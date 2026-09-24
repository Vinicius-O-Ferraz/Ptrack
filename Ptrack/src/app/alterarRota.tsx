import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";

import { createClient } from "@supabase/supabase-js";
import { useLocalSearchParams, router } from "expo-router";

// ======================================================
// SUPABASE
// ======================================================
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// ======================================================
// TIPO DO PONTO
// ======================================================
type Ponto = {
  id_ponto: string;
  id_rota: string;
  ordem_ponto_na_rota: number;
  endereco: string;
  lat: number | null;
  long: number | null;
};

export default function AlterarRota() {
  // ======================================================
  // ID DA ROTA RECEBIDO PELA NAVEGAÇÃO
  // ======================================================
  const { id_rota } = useLocalSearchParams<{
    id_rota: string;
  }>();

  const [nomeRota, setNomeRota] = useState("");
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // ======================================================
  // BUSCAR ROTA E PONTOS
  // ======================================================
  useEffect(() => {
    buscarRota();
  }, []);

  async function buscarRota() {
    if (!id_rota) {
      Alert.alert("Erro", "ID da rota não informado.");
      return;
    }

    setCarregando(true);

    // Busca nome da rota
    const { data: rota, error: erroRota } = await supabase
      .from("rota")
      .select("nome_rota")
      .eq("id_rota", id_rota)
      .single();

    if (erroRota) {
      console.error(erroRota);

      Alert.alert(
        "Erro",
        "Não foi possível carregar a rota."
      );

      setCarregando(false);
      return;
    }

    setNomeRota(rota.nome_rota);

    // Busca pontos
    const { data: pontosData, error: erroPontos } = await supabase
      .from("pontos_rota")
      .select(`
        id_ponto,
        id_rota,
        ordem_ponto_na_rota,
        endereco,
        lat,
        long
      `)
      .eq("id_rota", id_rota)
      .order("ordem_ponto_na_rota", {
        ascending: true,
      });

    if (erroPontos) {
      console.error(erroPontos);

      Alert.alert(
        "Erro",
        "Não foi possível carregar os pontos."
      );

      setCarregando(false);
      return;
    }

    setPontos(pontosData || []);
    setCarregando(false);
  }

  // ======================================================
  // ALTERAR ENDEREÇO
  // ======================================================
  function alterarEndereco(
    index: number,
    endereco: string
  ) {
    const novosPontos = [...pontos];

    novosPontos[index].endereco = endereco;

    // Como o endereço mudou, as coordenadas antigas
    // deixam de ser necessariamente válidas.
    novosPontos[index].lat = null;
    novosPontos[index].long = null;

    setPontos(novosPontos);
  }

  // ======================================================
  // ADICIONAR PONTO
  // ======================================================
  function adicionarPonto() {
    if (!id_rota) return;

    const novoPonto: Ponto = {
      id_ponto: `P${Date.now()}`,
      id_rota: id_rota,
      ordem_ponto_na_rota: pontos.length + 1,
      endereco: "",
      lat: null,
      long: null,
    };

    setPontos([
      ...pontos,
      novoPonto,
    ]);
  }

  // ======================================================
  // REMOVER PONTO
  // ======================================================
  function removerPonto(index: number) {
    const novosPontos = pontos.filter(
      (_, i) => i !== index
    );

    // Reorganiza a ordem
    novosPontos.forEach((ponto, i) => {
      ponto.ordem_ponto_na_rota = i + 1;
    });

    setPontos(novosPontos);
  }

  // ======================================================
  // SALVAR ALTERAÇÕES
  // ======================================================
  async function salvarAlteracoes() {
    if (!id_rota) return;

    // Verifica se existe endereço vazio
    const possuiEnderecoVazio = pontos.some(
      (ponto) => ponto.endereco.trim() === ""
    );

    if (possuiEnderecoVazio) {
      Alert.alert(
        "Atenção",
        "Preencha todos os endereços antes de salvar."
      );

      return;
    }

    setSalvando(true);

    try {
      // --------------------------------------------------
      // ATUALIZA O NOME DA ROTA
      // --------------------------------------------------
      const { error: erroRota } = await supabase
        .from("rota")
        .update({
          nome_rota: nomeRota,
        })
        .eq("id_rota", id_rota);

      if (erroRota) {
        throw erroRota;
      }

      // --------------------------------------------------
      // BUSCA OS PONTOS ANTIGOS
      // --------------------------------------------------
      const { data: pontosAntigos, error: erroBusca } =
        await supabase
          .from("pontos_rota")
          .select("id_ponto")
          .eq("id_rota", id_rota);

      if (erroBusca) {
        throw erroBusca;
      }

      // --------------------------------------------------
      // REMOVE OS PONTOS ANTIGOS
      // --------------------------------------------------
      const { error: erroDelete } = await supabase
        .from("pontos_rota")
        .delete()
        .eq("id_rota", id_rota);

      if (erroDelete) {
        throw erroDelete;
      }

      // --------------------------------------------------
      // REINSERE OS PONTOS ATUAIS
      // --------------------------------------------------
      const pontosParaSalvar = pontos.map(
        (ponto, index) => ({
          id_ponto: ponto.id_ponto,
          id_rota: id_rota,
          ordem_ponto_na_rota: index + 1,
          endereco: ponto.endereco,
          lat: ponto.lat,
          long: ponto.long,
        })
      );

      if (pontosParaSalvar.length > 0) {
        const { error: erroInsert } = await supabase
          .from("pontos_rota")
          .insert(pontosParaSalvar);

        if (erroInsert) {
          throw erroInsert;
        }
      }

      Alert.alert(
        "Sucesso",
        "Rota alterada com sucesso!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );

    } catch (error) {
      console.error(
        "Erro ao salvar alterações:",
        error
      );

      Alert.alert(
        "Erro",
        "Não foi possível salvar as alterações."
      );
    }

    setSalvando(false);
  }

  // ======================================================
  // CARREGANDO
  // ======================================================
  if (carregando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" />

        <Text style={styles.textoCarregando}>
          Carregando rota...
        </Text>
      </View>
    );
  }

  // ======================================================
  // TELA
  // ======================================================
  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >

      <Text style={styles.titulo}>
        Alterar Rota
      </Text>

      {/* ==================================================
          NOME DA ROTA
      ================================================== */}

      <Text style={styles.label}>
        Nome da rota
      </Text>

      <TextInput
        style={styles.input}
        value={nomeRota}
        onChangeText={setNomeRota}
        placeholder="Nome da rota"
      />

      {/* ==================================================
          PONTOS
      ================================================== */}

      <Text style={styles.subtitulo}>
        Pontos da rota
      </Text>

      {pontos.map((ponto, index) => (

        <View
          key={ponto.id_ponto}
          style={styles.ponto}
        >

          <Text style={styles.numeroPonto}>
            Ponto {index + 1}
          </Text>

          <TextInput
            style={styles.input}
            value={ponto.endereco}
            onChangeText={(texto) =>
              alterarEndereco(index, texto)
            }
            placeholder="Digite o endereço"
          />

          <Pressable
            style={styles.botaoRemover}
            onPress={() =>
              removerPonto(index)
            }
          >
            <Text style={styles.textoRemover}>
              Remover ponto
            </Text>
          </Pressable>

        </View>

      ))}

      {/* ==================================================
          ADICIONAR PONTO
      ================================================== */}

      <View style={styles.botaoAdicionar}>
        <Button
          title="Adicionar ponto"
          onPress={adicionarPonto}
        />
      </View>

      {/* ==================================================
          SALVAR
      ================================================== */}

      <View style={styles.botaoSalvar}>

        {salvando ? (

          <ActivityIndicator size="large" />

        ) : (

          <Button
            title="Salvar alterações"
            onPress={salvarAlteracoes}
          />

        )}

      </View>

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
    marginBottom: 10,
  },

  ponto: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },

  numeroPonto: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  botaoRemover: {
    alignSelf: "flex-start",
    paddingVertical: 5,
  },

  textoRemover: {
    color: "#d00000",
    fontWeight: "bold",
  },

  botaoAdicionar: {
    marginTop: 10,
    marginBottom: 20,
  },

  botaoSalvar: {
    marginBottom: 40,
  },

  carregando: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7c23e",
  },

  textoCarregando: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
});