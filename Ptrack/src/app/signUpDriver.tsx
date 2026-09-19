import { useState } from "react";
import { router } from "expo-router";
import { View, Text, TextInput, Button, StyleSheet, Pressable } from "react-native";

export default function primeiroAcesso() {
  const [nome, setNome] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");


  function cadastrar() {
    console.log("Nome digitado:", nome);
    console.log("CPF digitado:", cpf);
    console.log("E-mail digitado:", email);
    console.log("Senha digitada:", senha);
    router.push("/homeDriver");
  }


  return (
    <View style={styles.container}>

      <Text>Nome</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite seu nome"
        keyboardType="default"
        autoCapitalize="words"
        value={nome}
        onChangeText={setNome}
      />

      <Text>CPF</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite seu CPF"
        keyboardType="numeric"
        value={cpf}
        onChangeText={setCpf}
      />

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
        title="Cadastrar"
        onPress={cadastrar}
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