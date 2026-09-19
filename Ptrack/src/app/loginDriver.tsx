import { useState } from "react";
import { router } from "expo-router";
import { View, Text, TextInput, Button, StyleSheet, Pressable } from "react-native";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");

  function fazerLogin() {
    console.log("raiga!")
    console.log("E-mail digitado:", email);
    console.log("Senha digitada:", senha);
  }

  function primeiroAcesso() {
    console.log("Primeiro acesso");
    router.push("/signUpDriver");
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
        onPress={fazerLogin}
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