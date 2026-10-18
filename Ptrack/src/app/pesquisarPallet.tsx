
import { useState } from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { supabase } from "./supabaseClient";

type CaixaPallet = {
  id_caixa: string;
  tipo_caixa: string;
};

type ResumoPallet = {
  pallet_id: number;
  tipo_pallet: string;
  qtdPIC: number;
  qtdPFC: number;
  qtdPC: number;
};

export default function ConsultarPallet() {
  const [palletId, setPalletId] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<ResumoPallet | null>(null);

  async function pesquisarPallet() {
    const id = palletId.trim();

    if (!id) {
      Alert.alert(
        "Atenção",
        "Informe ou leia o ID do pallet."
      );
      return;
    }

    const idNumerico = Number(id);

    if (!Number.isSafeInteger(idNumerico) || idNumerico <= 0) {
      Alert.alert(
        "ID inválido",
        "Informe um ID numérico inteiro positivo."
      );
      return;
    }

    setBuscando(true);
    setResultado(null);

    try {
      // 1. Busca o pallet pelo ID.
      const { data: pallet, error: erroPallet } = await supabase
        .from("pallet")
        .select("pallet_id, tipo_pallet")
        .eq("pallet_id", idNumerico)
        .maybeSingle();

      if (erroPallet) {
        console.error("Erro ao consultar pallet:", erroPallet);
        Alert.alert(
          "Erro",
          "Não foi possível consultar o pallet."
        );
        return;
      }

      if (!pallet) {
        Alert.alert(
          "Pallet não encontrado",
          `Não existe pallet cadastrado com o ID ${idNumerico}.`
        );
        return;
      }

      // 2. Busca as caixas associadas ao pallet.
      const { data: caixas, error: erroCaixas } = await supabase
        .from("pallet_caixa")
        .select("id_caixa, tipo_caixa")
        .eq("pallet_id", idNumerico);

      if (erroCaixas) {
        console.error("Erro ao consultar caixas:", erroCaixas);
        Alert.alert(
          "Erro",
          "O pallet foi encontrado, mas não foi possível consultar suas caixas."
        );
        return;
      }

      const listaCaixas = (caixas ?? []) as CaixaPallet[];

      // 3. Conta as caixas de cada tipo.
      const qtdPIC = listaCaixas.filter(
        (caixa) => caixa.tipo_caixa === "PIC"
      ).length;

      const qtdPFC = listaCaixas.filter(
        (caixa) => caixa.tipo_caixa === "PFC"
      ).length;

      const qtdPC = listaCaixas.filter(
        (caixa) => caixa.tipo_caixa === "PC"
      ).length;

      setResultado({
        pallet_id: pallet.pallet_id,
        tipo_pallet: pallet.tipo_pallet,
        qtdPIC,
        qtdPFC,
        qtdPC,
      });
    } catch (error) {
      console.error("Erro inesperado:", error);

      Alert.alert(
        "Erro",
        "Ocorreu um erro inesperado durante a consulta."
      );
    } finally {
      setBuscando(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>
        Consultar Pallet
      </Text>

      <Text style={styles.label}>
        ID do pallet
      </Text>

      <View style={styles.buscaContainer}>
        <TextInput
          style={styles.input}
          value={palletId}
          onChangeText={setPalletId}
          placeholder="Leia ou digite o ID"
          keyboardType="numeric"
          returnKeyType="search"
          onSubmitEditing={pesquisarPallet}
        />

        <Pressable
          style={[
            styles.botaoBuscar,
            buscando && styles.botaoDesabilitado,
          ]}
          onPress={pesquisarPallet}
          disabled={buscando}
        >
          <Text style={styles.textoBotao}>
            Pesquisar
          </Text>
        </Pressable>
      </View>

      {buscando && (
        <ActivityIndicator
          size="large"
          color="#333333"
          style={styles.carregando}
        />
      )}

      {resultado && (
        <View style={styles.card}>
          <Text style={styles.subtitulo}>
            Dados do pallet
          </Text>

          <Text style={styles.informacao}>
            ID: {resultado.pallet_id}
          </Text>

          <Text style={styles.informacao}>
            Tipo: {resultado.tipo_pallet}
          </Text>

          <View style={styles.divisor} />

          <Text style={styles.subtitulo}>
            Quantidade de caixas
          </Text>

          <View style={styles.linhaQuantidade}>
            <Text style={styles.tipoCaixa}>PIC</Text>
            <Text style={styles.quantidade}>
              {resultado.qtdPIC}
            </Text>
          </View>

          <View style={styles.linhaQuantidade}>
            <Text style={styles.tipoCaixa}>PFC</Text>
            <Text style={styles.quantidade}>
              {resultado.qtdPFC}
            </Text>
          </View>

          <View style={styles.linhaQuantidade}>
            <Text style={styles.tipoCaixa}>PC</Text>
            <Text style={styles.quantidade}>
              {resultado.qtdPC}
            </Text>
          </View>

          <View style={styles.divisor} />

          <View style={styles.linhaQuantidade}>
            <Text style={styles.total}>Total de caixas</Text>
            <Text style={styles.total}>
              {resultado.qtdPIC +
                resultado.qtdPFC +
                resultado.qtdPC}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f7c23e",
  },

  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },

  label: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },

  buscaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    height: 48,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cccccc",
    paddingHorizontal: 12,
    fontSize: 16,
  },

  botaoBuscar: {
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: "#244CA4",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  botaoDesabilitado: {
    opacity: 0.5,
  },

  textoBotao: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },

  carregando: {
    marginVertical: 15,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },

  subtitulo: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 15,
  },

  informacao: {
    fontSize: 17,
    marginBottom: 8,
  },

  divisor: {
    height: 1,
    backgroundColor: "#dddddd",
    marginVertical: 15,
  },

  linhaQuantidade: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  tipoCaixa: {
    fontSize: 17,
    fontWeight: "500",
  },

  quantidade: {
    fontSize: 19,
    fontWeight: "bold",
  },

  total: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
