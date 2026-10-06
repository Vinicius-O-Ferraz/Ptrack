//   import { useState } from "react";
// import { router } from "expo-router";
// import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
// import { supabase } from "./supabaseClient";
// import Button from "./Button";

// export default function Login() {
//   const [email, setEmail] = useState<string>("");
//   const [senha, setSenha] = useState<string>("");

//   async function fazerLogin(email: string, senha: string) {
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email: email,
//       password: senha,
//     });

//     if (error) {
//       console.error("Erro ao fazer login:", error.message);
//       return;
//     }

//     else{
//           router.push("/homeDriver");
//     }

//   }



//   function primeiroAcesso() {
//     console.log("Primeiro acesso");
//     router.push("/signUpDriver");
//   }

//   return (
//     <View style={styles.container}>
//       <Text>E-mail</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Digite seu e-mail"
//         keyboardType="email-address"
//         autoCapitalize="none"
//         value={email}
//         onChangeText={setEmail}
//       />

//        <Text>Senha</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Digite sua senha"
//         keyboardType="default"
//         autoCapitalize="none"
//         secureTextEntry={true}
//         value={senha}
//         onChangeText={setSenha}
//       />

//       <Button
//         title="Entrar"
//         onPress={() => fazerLogin(email, senha)}
//       />

//       <Pressable onPress={primeiroAcesso}>
//         <Text style={{ color: "blue" }}>
//           Primeiro acesso? Clique aqui para se cadastrar.
//         </Text>
//       </Pressable>
//     </View>
//   );
// }



// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#f7c23e",
//   },

//   text: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#E63A4A",
//   },

//   input: {
//     width: "80%",
//     height: 40,
//     backgroundColor: "#ffffff",
//   },
// });

import { useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";

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

    // Erro ao autenticar
    if (error) {
      console.error("Erro ao fazer login:", error.message);

      Alert.alert(
        "Erro",
        "E-mail ou senha incorretos."
      );

      return;
    }

    // Verifica se o usuário foi retornado
    if (!data.user) {
      Alert.alert(
        "Erro",
        "Não foi possível identificar o usuário."
      );

      return;
    }

    // Obtém o role salvo no usuário
    const role = data.user.user_metadata?.role;

    console.log("Role do usuário:", role);

    // Verifica se o usuário é motorista
    if (role !== "motorista") {

      // Usuário autenticou, mas não possui
      // permissão para acessar o aplicativo.
      await supabase.auth.signOut();

      Alert.alert(
        "Acesso negado",
        "Apenas motoristas podem acessar este aplicativo."
      );

      return;
    }

    // Somente motorista chega aqui
    router.push("/homeDriver");
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
