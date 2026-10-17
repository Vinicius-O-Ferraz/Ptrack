
import { useState } from "react";

import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";
import { supabase } from "./supabaseClient";

export default function CadastrarPallet() {
  const [palletId, setPalletId] = useState("");
  const [cadastrando, setCadastrando] = useState(false);

  async function cadastrarPallet() {
    const id = palletId.trim();

    if (!id) {
      Alert.alert(
        "Atenção",
        "Informe o ID do pallet."
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

    setCadastrando(true);

    try {
      const { error } = await supabase
        .from("pallet")
        .insert({
          pallet_id: idNumerico,
          tipo_pallet: "P00",
        });

      if (error) {
        console.error("Erro ao cadastrar pallet:", error);

        if (error.code === "23505") {
          Alert.alert(
            "Pallet já cadastrado",
            "Já existe um pallet com esse ID."
          );
        } else {
          Alert.alert(
            "Erro",
            "Não foi possível cadastrar o pallet. Verifique sua conexão e as permissões do Supabase."
          );
        }

        return;
      }

      Alert.alert(
        "Sucesso",
        `Pallet ${idNumerico} cadastrado como P00.`
      );

      setPalletId("");
    } catch (error) {
      console.error("Erro inesperado:", error);

      Alert.alert(
        "Erro",
        "Ocorreu um erro inesperado ao cadastrar o pallet."
      );
    } finally {
      setCadastrando(false);
    }
  }

  function concluir() {
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        Cadastrar Pallet P00
      </Text>

      <Text style={styles.label}>
        ID do pallet
      </Text>

      <TextInput
        style={styles.input}
        value={palletId}
        onChangeText={setPalletId}
        placeholder="Digite o ID do pallet"
        keyboardType="numeric"
        editable={!cadastrando}
        returnKeyType="done"
        onSubmitEditing={cadastrarPallet}
      />

      <View style={styles.botao}>
        {cadastrando ? (
          <ActivityIndicator
            size="large"
            color="#333333"
          />
        ) : (
          <Button
            title="Cadastrar"
            onPress={cadastrarPallet}
            color="#007AFF"
          />
        )}
      </View>

      <View style={styles.botao}>
        <Button
          title="Concluído"
          onPress={concluir}
          disabled={cadastrando}
        color="#248a45"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7c23e",
  },

  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },

  label: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },

  input: {
    height: 50,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 17,
  },

  botao: {
    marginTop: 20,
  },
});
