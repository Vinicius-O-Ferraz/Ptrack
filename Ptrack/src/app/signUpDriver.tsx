import { useState } from "react";
import { router } from "expo-router";
import { View, Text, TextInput, Button, StyleSheet, Pressable } from "react-native";
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);


export default function primeiroAcesso() {
  const [nome, setNome] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");

  async function cadastrar(nome: string, cpf: string, email: string, senha: string) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: senha,
        options: {
            data: {
                nome: nome,
                cpf: cpf,
                role: "motorista"
                // role: "motorista" é necessário para ativar o trigger
            }
        }
    });

    if (error) {
        console.error("Erro ao cadastrar motorista:", error.message);
        return {
            sucesso: false,
            erro: error.message
        };
    }

    else{
      router.push("./homeDriver")
    }

    console.log("Motorista cadastrado com sucesso!");
    console.log("Usuário:", data.user);

    return {
        sucesso: true,
        usuario: data.user
    };
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
          onPress={() => cadastrar(nome, cpf, email, senha)}
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