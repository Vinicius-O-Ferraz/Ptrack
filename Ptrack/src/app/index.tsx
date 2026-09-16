import { Text, View, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import Button from "./Button";

export default function Index() {

  function souFuncionario() {
    router.push("/home");
  }

  function souMotorista() {
    router.push("/home");
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("./logo.png")}
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