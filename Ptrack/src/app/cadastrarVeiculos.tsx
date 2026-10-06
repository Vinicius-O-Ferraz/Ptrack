import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";

import { supabase } from "./supabaseClient";

export default function CadastrarVeiculo() {
  const [placa, setPlaca] = useState("");
  const [cadastrando, setCadastrando] = useState(false);

  function formatarPlaca(texto: string) {
    const valor = texto
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    return valor.slice(0, 11);
  }

  function validarPlaca(valor: string): boolean {
   
    if (valor.length === 7) {
      return true;
    }

    if (valor.length === 8) {
      return true;
    }

    if (valor.length === 11) {
      return true;
    }

    return false;
  }

  async function cadastrarVeiculo() {
    const placaLimpa = formatarPlaca(placa);

    if (!validarPlaca(placaLimpa)) {
      Alert.alert(
        "Placa inválida",
        "Informe uma placa de veículo com 7 caracteres ou uma identificação de contêiner com 11 caracteres."
      );

      return;
    }

    setCadastrando(true);

    try {
      const { data, error } = await supabase
        .from("veiculo")
        .insert({
          placa: placaLimpa,
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao cadastrar veículo:", error);

        // Violação de chave primária
        if (error.code === "23505") {
          Alert.alert(
            "Veículo já cadastrado",
            `A placa ${placaLimpa} já está cadastrada no sistema.`
          );
        } else {
          Alert.alert(
            "Erro",
            "Não foi possível cadastrar o veículo."
          );
        }

        return;
      }

      console.log("Veículo cadastrado:", data);

      Alert.alert(
        "Cadastro realizado",
        `O veículo ${placaLimpa} foi cadastrado com sucesso.`
      );

      setPlaca("");

    } catch (error) {
      console.error(error);

      Alert.alert(
        "Erro",
        "Ocorreu um erro ao cadastrar o veículo."
      );

    } finally {
      setCadastrando(false);
    }
  }

  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>
        Cadastrar veículo
      </Text>

      <Text style={styles.label}>
        Placa / identificação do contêiner
      </Text>

      <TextInput
        style={styles.input}
        value={placa}
        onChangeText={(texto) => {
          setPlaca(formatarPlaca(texto));
        }}
        placeholder="ABC1234"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={11}
      />

      <Text style={styles.ajuda}>
        Veículo: 7 ou 8 caracteres{"\n"}
        Contêiner: 11 caracteres
      </Text>

      <Pressable
        style={[
          styles.botao,
          cadastrando && styles.botaoDesabilitado,
        ]}
        onPress={cadastrarVeiculo}
        disabled={cadastrando}
      >
        <Text style={styles.textoBotao}>
          {cadastrando
            ? "Cadastrando..."
            : "Cadastrar veículo"}
        </Text>
      </Pressable>

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
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    fontSize: 20,
    letterSpacing: 2,
    marginBottom: 10,
  },

  ajuda: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 25,
  },

  botao: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  textoBotao: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});
