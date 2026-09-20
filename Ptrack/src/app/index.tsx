import { Text, View, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import { createClient } from "@supabase/supabase-js";
import Button from "./Button";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Configure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export default function Index() {

  function souFuncionario() {
    router.push("/homeHb");
  }

  function souMotorista() {
    router.push("/loginDriver");
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("./images/logo.png")}
        style={styles.logo}
      />

      <Text style={styles.text}>
        Bem-vindo ao PlasmaTrack!
      </Text>

      <Button
        title="Sou Hemobrás"
        onPress={souFuncionario}
      />

      <Button
        title="Sou Motorista"
        onPress={souMotorista}
      />


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

  logo: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },

  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E63A4A",
  },
});