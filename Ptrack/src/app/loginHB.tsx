  import { useState } from "react";
import { router } from "expo-router";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { supabase } from "./supabaseClient";
import Button from "./Button";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");

  async function fazerLogin(email: string, senha: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
    });

    if (error) {
      console.error("Erro ao fazer login:", error.message);
      return;
    }

    else{
          router.push("/homeHb");
    }

  }



  function primeiroAcesso() {
    console.log("Primeiro acesso");
    router.push("/signupHb");
  }

  return (
    <View style={styles.container}>
      <Text>E-mail</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

       <Text>Senha</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite sua senha"
        keyboardType="default"
        autoCapitalize="none"
        secureTextEntry={true}
        value={senha}
        onChangeText={setSenha}
      />

      <Button
        title="Entrar"
        onPress={() => fazerLogin(email, senha)}
      />

      <Pressable onPress={primeiroAcesso}>
        <Text style={{ color: "blue" }}>
          Primeiro acesso? Clique aqui para se cadastrar.
        </Text>
      </Pressable>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7c23e",
  },

  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E63A4A",
  },

  input: {
    width: "80%",
    height: 40,
    backgroundColor: "#ffffff",
  },
});