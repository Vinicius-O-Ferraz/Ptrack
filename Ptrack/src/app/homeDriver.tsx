import { Text, View, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import Button from "./Button";

export default function homeDriver() {

  function adicionarCaixas() {
    // router.push("/adicionarCaixas");
    router.push("./todo");
  }

  function adicionarNumeroRemessa() {
    router.push("./todo");
    // router.push("/adicionarNumeroRemessa");
  }

  return (
    <View style={styles.container}>

      <Image
              source={require("./images/caminhao.png")}
              style={styles.logo}
      />

      <Text style={styles.text}>
          TRANSPORTADOR
      </Text>
      
      <Button
        title="Adicionar número de remessa"
        onPress={adicionarNumeroRemessa}
      />

      <Button
        title="Adicionar caixas para transporte"
        onPress={adicionarCaixas}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
     backgroundColor: "#244CA4",
  },

  logo: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },

  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
});