import { useState } from "react";
import { router } from "expo-router";
import { View, Text, TextInput, Button, StyleSheet, Pressable } from "react-native";
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

/*

TODO 

Falta fazer ajustes no trigger do motorista para receber apenas os registros com o role de motorista, se o role for hemobrás, não será utilizado

*/

export default function primeiroAcesso() {
  const [nome, setNome] = useState<string>("");
  const [codMatricula, setcodMatricula] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");

  async function cadastrar( email: string, senha: string) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: senha,
        options: {
            data: {
                nome: nome,
                codMatricula: codMatricula
            }
        }
    });

    if (error) {
        console.error("Erro ao cadastrar funcionário:", error.message);
        return {
            sucesso: false,
            erro: error.message
        };
    }

    //Atalho, navegar para home sem autenticar
    router.push("./homeHb")

    console.log("Funcionário cadastrado com sucesso!");
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
        placeholder="Digite seu código de matrícula"
        keyboardType="numeric"
        value={codMatricula}
        onChangeText={setcodMatricula}
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
          onPress={() => cadastrar(email, senha)}
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