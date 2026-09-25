import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { createClient } from "@supabase/supabase-js";
import { router, useLocalSearchParams } from "expo-router";

// ======================================================
// SUPABASE
// ======================================================
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// ======================================================
// TELA
// ======================================================
export default function CadastrarTags() {
  // ID da rota recebido da tela anterior
  const { idRota } = useLocalSearchParams<{
    idRota: string;
  }>();

  const [numeroRemessa, setNumeroRemessa] = useState("");
  const [caixasPC, setCaixasPC] = useState("");
  const [caixasPFC, setCaixasPFC] = useState("");
  const [caixasPIC, setCaixasPIC] = useState("");

  const [placa, setPlaca] = useState("");
  const [placas, setPlacas] = useState<string[]>([]);
  const [buscandoPlacas, setBuscandoPlacas] = useState(false);

  // ======================================================
  // BUSCAR PLACAS
  // ======================================================
  async function buscarPlacas(texto: string) {
    setPlaca(texto);

    if (texto.trim().length === 0) {
      setPlacas([]);
      return;
    }

    setBuscandoPlacas(true);

    const { data, error } = await supabase
      .from("veiculo")
      .select("placa")
      .ilike("placa", `%${texto}%`)
      .order("placa", { ascending: true })
      .limit(10);

    setBuscandoPlacas(false);

    if (error) {
      console.error("Erro ao buscar placas:", error);
      Alert.alert("Erro", "Não foi possível buscar os veículos.");
      return;
    }

    setPlacas(data?.map((veiculo) => veiculo.placa) || []);
  }

  // ======================================================
  // SELECIONAR PLACA
  // ======================================================
  function selecionarPlaca(placaSelecionada: string) {
    setPlaca(placaSelecionada);
    setPlacas([]);
  }

  // ======================================================
  // COMEÇAR LEITURA
  // ======================================================
  async function comecarLeitura() {
    // Validação do número da remessa
    if (!numeroRemessa) {
      Alert.alert("Atenção", "Informe o número da remessa.");
      return;
    }

    // Validação das caixas PC
    if (!caixasPC) {
      Alert.alert("Atenção", "Informe o número de caixas PC.");
      return;
    }

    // Validação das caixas PFC
    if (!caixasPFC) {
      Alert.alert("Atenção", "Informe o número de caixas PFC.");
      return;
    }

    // Validação das caixas PIC
    if (!caixasPIC) {
      Alert.alert("Atenção", "Informe o número de caixas PIC.");
      return;
    }

    // Validação da placa
    if (!placa) {
      Alert.alert("Atenção", "Selecione uma placa.");
      return;
    }

    // Validação da rota recebida da tela anterior
    if (!idRota) {
      Alert.alert("Atenção", "Nenhuma rota foi selecionada.");
      return;
    }

    // ==================================================
    // PEGAR MOTORISTA LOGADO
    // ==================================================
    const {
      data: { user },
      error: erroUsuario,
    } = await supabase.auth.getUser();

    if (erroUsuario || !user) {
      Alert.alert("Erro", "Não foi possível identificar o motorista.");
      return;
    }

    // ==================================================
    // BUSCAR CPF DO MOTORISTA
    // ==================================================
    const { data: motorista, error: erroMotorista } = await supabase
      .from("motorista")
      .select("cpf")
      .eq("id_motorista", user.id)
      .single();

    if (erroMotorista || !motorista) {
      console.error("Erro ao buscar motorista:", erroMotorista);
      Alert.alert("Erro", "Não foi possível encontrar o CPF do motorista.");
      return;
    }

    // ==================================================
    // INSERT DO DOCUMENTO
    // ==================================================
    const { error } = await supabase.from("documento_remessa").insert({
      id_documento: Number(numeroRemessa),
      placa: placa,
      cpf: motorista.cpf,
      id_rota: idRota,
      qtd_pic: Number(caixasPIC),
      qtd_pfc: Number(caixasPFC),
      qtd_pc: Number(caixasPC),
    });

    // ==================================================
    // TRATAR ERRO
    // ==================================================
    if (error) {
      console.error("Erro ao cadastrar documento:", error);
      Alert.alert("Erro", "Não foi possível cadastrar o documento de remessa.");
      return;
    }

    // ==================================================
    // CADASTRO REALIZADO
    // ==================================================
    Alert.alert("Sucesso", "Documento de remessa cadastrado!");

    router.push({
      pathname: "/todo",
      params: {
        numeroRemessa,
        caixasPC,
        caixasPFC,
        caixasPIC,
        placa,
      },
    });
  }

  // ======================================================
  // INTERFACE
  // ======================================================
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>Cadastro de Tags</Text>

      <Text style={styles.label}>Número de documento de remessa</Text>
      <TextInput
        style={styles.input}
        value={numeroRemessa}
        onChangeText={setNumeroRemessa}
        placeholder="Digite o número da remessa"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Número de caixas PC</Text>
      <TextInput
        style={styles.input}
        value={caixasPC}
        onChangeText={setCaixasPC}
        placeholder="Digite a quantidade"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Número de caixas PFC</Text>
      <TextInput
        style={styles.input}
        value={caixasPFC}
        onChangeText={setCaixasPFC}
        placeholder="Digite a quantidade"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Número de caixas PIC</Text>
      <TextInput
        style={styles.input}
        value={caixasPIC}
        onChangeText={setCaixasPIC}
        placeholder="Digite a quantidade"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Placa do veículo</Text>
      <TextInput
        style={styles.input}
        value={placa}
        onChangeText={buscarPlacas}
        placeholder="Digite a placa"
        autoCapitalize="characters"
      />

      {buscandoPlacas && (
        <ActivityIndicator size="small" style={styles.carregando} />
      )}

      {placas.length > 0 && (
        <View style={styles.listaPlacas}>
          {placas.map((item) => (
            <Pressable
              key={item}
              style={styles.placaItem}
              onPress={() => selecionarPlaca(item)}
            >
              <Text style={styles.textoPlaca}>{item}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.botaoLeitura}>
        <Button title="Começar a leitura de tags" onPress={comecarLeitura} />
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
    marginBottom: 30,
    textAlign: "center",
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
    marginBottom: 18,
  },
  carregando: {
    marginTop: -10,
    marginBottom: 10,
  },
  listaPlacas: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    marginTop: -10,
    marginBottom: 18,
    overflow: "hidden",
  },
  placaItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
  },
  textoPlaca: {
    fontSize: 16,
    fontWeight: "bold",
  },
  botaoLeitura: {
    marginTop: 20,
    marginBottom: 40,
  },
});