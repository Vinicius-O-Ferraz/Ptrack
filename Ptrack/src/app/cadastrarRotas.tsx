import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { createClient } from "@supabase/supabase-js";

// ======================================================
// SUPABASE
// ======================================================
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// ======================================================
// NOMINATIM
// ======================================================
async function obterCoordenadas(endereco: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", endereco);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");

  const resposta = await fetch(url, {
    headers: {
      "User-Agent": "PTrack/1.0 (seu-email@exemplo.com)",
    },
  });

  if (!resposta.ok) {
    throw new Error(
      `Erro no Nominatim: ${resposta.status} ${resposta.statusText}`
    );
  }

  const resultados = await resposta.json();

  if (resultados.length === 0) {
    throw new Error(`Não foi possível encontrar o endereço: ${endereco}`);
  }

  return {
    lat: Number(resultados[0].lat),
    long: Number(resultados[0].lon),
  };
}

// ======================================================
// ESPERA
// ======================================================
function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ======================================================
// GERA ID DA ROTA
// ======================================================
function gerarIdRota() {
  const numero = Math.floor(Math.random() * 1000000);
  return `R${numero.toString().padStart(7, "0")}`;
}

// ======================================================
// CRIAÇÃO DA ROTA
// ======================================================
async function criarRota(nome_rota: string, enderecos: string[]) {
  // --------------------------------------------------
  // 1. Gera o ID da rota
  // --------------------------------------------------
  const id_rota = gerarIdRota();

  // --------------------------------------------------
  // 2. Cria a rota no Supabase
  // --------------------------------------------------
  const { data: rota, error: erroRota } = await supabase
    .from("rota")
    .insert({
      id_rota: id_rota,
      nome_rota: nome_rota,
    })
    .select()
    .single();

  if (erroRota) {
    throw new Error(`Erro ao criar rota: ${erroRota.message}`);
  }

  // --------------------------------------------------
  // 3. Obtém as coordenadas dos endereços
  // --------------------------------------------------
  const pontos = [];

  for (let i = 0; i < enderecos.length; i++) {
    const endereco = enderecos[i].trim();
    console.log(`Obtendo coordenadas do ponto ${i + 1}: ${endereco}`);

    const coordenadas = await obterCoordenadas(endereco);
    const ordem = i + 1;

    pontos.push({
      id_ponto: `${id_rota}-P${ordem}`,
      id_rota: id_rota,
      ordem_ponto_na_rota: ordem,
      endereco: endereco,
      lat: coordenadas.lat,
      long: coordenadas.long,
    });

    // ------------------------------------------------
    // Nominatim recomenda limitar as requisições.
    // ------------------------------------------------
    if (i < enderecos.length - 1) {
      await esperar(1000);
    }
  }

  // --------------------------------------------------
  // 4. Insere os pontos no Supabase
  // --------------------------------------------------
  const { data: pontosInseridos, error: erroPontos } = await supabase
    .from("pontos_rota")
    .insert(pontos)
    .select();

  if (erroPontos) {
    throw new Error(
      `Erro ao criar pontos da rota: ${erroPontos.message}`
    );
  }

  // --------------------------------------------------
  // 5. Retorna os dados criados
  // --------------------------------------------------
  return {
    rota: rota,
    pontos: pontosInseridos,
  };
}

// ======================================================
// TELA
// ======================================================
export default function CriarRota() {
  const [nomeRota, setNomeRota] = useState("");
  const [quantidadePontos, setQuantidadePontos] = useState("");
  const [enderecos, setEnderecos] = useState<string[]>([]);
  const [criandoRota, setCriandoRota] = useState(false);

  // ====================================================
  // CRIA OS CAMPOS DE ENDEREÇO
  // ====================================================
  function definirQuantidadePontos() {
    const quantidade = Number(quantidadePontos);

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      Alert.alert(
        "Quantidade inválida",
        "Informe uma quantidade de pontos maior que zero."
      );
      return;
    }

    const novosEnderecos = Array.from(
      { length: quantidade },
      (_, index) => enderecos[index] ?? ""
    );

    setEnderecos(novosEnderecos);
  }

  // ====================================================
  // ALTERA UM ENDEREÇO
  // ====================================================
  function alterarEndereco(index: number, endereco: string) {
    const novosEnderecos = [...enderecos];
    novosEnderecos[index] = endereco;
    setEnderecos(novosEnderecos);
  }

  // ====================================================
  // CRIA A ROTA
  // ====================================================
  async function executarCriacaoRota() {
    // -----------------------------------------------
    // Validação do nome
    // -----------------------------------------------
    if (!nomeRota.trim()) {
      Alert.alert("Erro", "Digite o nome da rota.");
      return;
    }

    // -----------------------------------------------
    // Validação da quantidade
    // -----------------------------------------------
    if (enderecos.length === 0) {
      Alert.alert("Erro", "Informe a quantidade de pontos da rota.");
      return;
    }

    // -----------------------------------------------
    // Verifica endereços vazios
    // -----------------------------------------------
    const existeEnderecoVazio = enderecos.some(
      (endereco) => !endereco.trim()
    );

    if (existeEnderecoVazio) {
      Alert.alert("Erro", "Preencha todos os endereços.");
      return;
    }

    setCriandoRota(true);

    try {
      console.log("Iniciando criação da rota...");

      const resultado = await criarRota(nomeRota.trim(), enderecos);

      console.log("Rota criada:", resultado.rota);
      console.log("Pontos criados:", resultado.pontos);

      Alert.alert(
        "Sucesso",
        `Rota ${resultado.rota.id_rota} criada com sucesso!\n\n${resultado.pontos.length} pontos foram cadastrados.`
      );

      // Limpa o formulário
      setNomeRota("");
      setQuantidadePontos("");
      setEnderecos([]);
    } catch (erro: any) {
      console.error("Erro ao criar rota:", erro);
      Alert.alert(
        "Erro ao criar rota",
        erro.message ?? "Ocorreu um erro inesperado."
      );
    } finally {
      setCriandoRota(false);
    }
  }

  // ====================================================
  // INTERFACE
  // ====================================================
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Criar nova rota</Text>

      {/* ==============================================
          NOME DA ROTA
      ============================================== */}
      <Text style={styles.label}>Nome da rota</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex.: Rota Recife - Hemobrás"
        value={nomeRota}
        onChangeText={setNomeRota}
        editable={!criandoRota}
      />

      {/* ==============================================
          QUANTIDADE DE PONTOS
      ============================================== */}
      <Text style={styles.label}>Quantidade de pontos</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex.: 4"
        keyboardType="numeric"
        value={quantidadePontos}
        onChangeText={setQuantidadePontos}
        editable={!criandoRota}
      />

      <Button
        title="Definir pontos"
        onPress={definirQuantidadePontos}
        disabled={criandoRota}
      />

      {/* ==============================================
          ENDEREÇOS
      ============================================== */}
      {enderecos.length > 0 && (
        <View style={styles.pontosContainer}>
          <Text style={styles.subtitulo}>Pontos da rota</Text>

          {enderecos.map((endereco, index) => (
            <View key={index} style={styles.ponto}>
              <Text style={styles.label}>Ponto {index + 1}</Text>
              <TextInput
                style={styles.input}
                placeholder={`Endereço do ponto ${index + 1}`}
                value={endereco}
                onChangeText={(texto) => alterarEndereco(index, texto)}
                editable={!criandoRota}
                multiline
              />
            </View>
          ))}
        </View>
      )}

      {/* ==============================================
          BOTÃO CRIAR ROTA
      ============================================== */}
      {enderecos.length > 0 && (
        <View style={styles.botaoCriar}>
          {criandoRota ? (
            <View style={styles.carregando}>
              <ActivityIndicator size="large" />
              <Text style={styles.textoCarregando}>Criando rota...</Text>
              <Text style={styles.textoAviso}>
                Os endereços estão sendo convertidos em coordenadas.
              </Text>
            </View>
          ) : (
            <Button title="Criar rota" onPress={executarCriacaoRota} />
          )}
        </View>
      )}
    </ScrollView>
  );
}

// ======================================================
// ESTILOS
// ======================================================
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f7c23e",
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    minHeight: 45,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
  },
  pontosContainer: {
    marginTop: 10,
  },
  ponto: {
    marginBottom: 5,
  },
  botaoCriar: {
    marginTop: 25,
    marginBottom: 40,
  },
  carregando: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
  textoCarregando: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  textoAviso: {
    textAlign: "center",
    marginTop: 8,
  },
});