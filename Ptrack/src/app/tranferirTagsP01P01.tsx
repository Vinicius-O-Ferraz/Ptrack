
import { useState } from "react";

import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";
import { supabase } from "./supabaseClient";

type Pallet = {
  pallet_id: number;
  tipo_pallet: string;
};

export default function ConsultarPallet() {
  const [palletIdP01, setPalletId] = useState("");
  const [palletEncontrado, setPalletEncontrado] =
    useState<Pallet | null>(null);

  const [buscando, setBuscando] = useState(false);

  async function buscarPallet() {
    const id = palletIdP01.trim();

    if (!id) {
      Alert.alert(
        "Atenção",
        "Informe o ID do pallet para realizar a busca."
      );
      return;
    }

    const idNumerico = Number(id);

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      Alert.alert(
        "ID inválido",
        "Informe um ID numérico válido."
      );
      return;
    }

    setBuscando(true);
    setPalletEncontrado(null);

    try {
      const { data, error } = await supabase
        .from("pallet")
        .select("pallet_id, tipo_pallet")
        .eq("pallet_id", idNumerico)
        .eq("tipo_pallet", "P01")
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar pallet:", error);

        Alert.alert(
          "Erro",
          "Não foi possível consultar o pallet. Tente novamente."
        );
        return;
      }

      if (!data) {
        Alert.alert(
          "Pallet não encontrado",
          "Não existe um pallet do tipo P01 com o ID informado."
        );
        return;
      }

      setPalletEncontrado(data as Pallet);
    } catch (error) {
      console.error("Erro inesperado:", error);

      Alert.alert(
        "Erro",
        "Ocorreu um erro ao consultar o pallet."
      );
    } finally {
      setBuscando(false);
    }
  }

  function usarPallet(pallet: Pallet) {
    router.push({
      pathname: "./tranferirTagsP01P01p2",
      params: {
        palletIdP01_old: String(pallet.pallet_id),
        tipoPalletP01_old: pallet.tipo_pallet,
      },
    });
  }

  function adicionarPallet() {
    router.push("./adicionarPalletP01");
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>
        Consultar Pallets P01
      </Text>

      <Text style={styles.descricao}>
        Informe o ID do pallet P01 que deseja transferir caixas para pallet p01.
      </Text>

      {/* CAMPO DE BUSCA E BOTÃO */}
      <View style={styles.buscaContainer}>
        <TextInput
          style={styles.input}
          value={palletIdP01}
          onChangeText={setPalletId}
          placeholder="ID do pallet"
          keyboardType="numeric"
          onSubmitEditing={buscarPallet}
          returnKeyType="search"
        />

        <Pressable
          style={[
            styles.botaoBuscar,
            buscando && styles.botaoDesabilitado,
          ]}
          onPress={buscarPallet}
          disabled={buscando}
        >
          <Text style={styles.textoBotaoBuscar}>
            Buscar
          </Text>
        </Pressable>
      </View>

      {buscando && (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={styles.carregando}
        />
      )}

      {/* RESULTADO DA BUSCA */}
      {palletEncontrado && (
        <View style={styles.card}>
          <Text style={styles.subtitulo}>
            Pallet encontrado
          </Text>

          <Text style={styles.informacao}>
            ID: {palletEncontrado.pallet_id}
          </Text>

          <Text style={styles.informacao}>
            Tipo: {palletEncontrado.tipo_pallet}
          </Text>

          <Pressable
            style={styles.botaoUsar}
            onPress={() => usarPallet(palletEncontrado)}
          >
            <Text style={styles.textoBotao}>
              Associar
            </Text>
          </Pressable>
        </View>
      )}

      {/* ADICIONAR PALLET
      <View style={styles.botaoAdicionarContainer}>
        <Button
          title="Adicionar pallet"
          onPress={adicionarPallet}
          color="#007AFF"
        />
      </View> */}
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
    marginBottom: 15,
  },

  descricao: {
    fontSize: 16,
    marginBottom: 15,
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
    paddingHorizontal: 18,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  botaoDesabilitado: {
    opacity: 0.5,
  },

  textoBotaoBuscar: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },

  carregando: {
    marginVertical: 15,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },

  subtitulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },

  informacao: {
    fontSize: 17,
    marginBottom: 8,
  },

  botaoUsar: {
    backgroundColor: "#007AFF",
    padding: 13,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },

  textoBotao: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },

  botaoAdicionarContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
});
