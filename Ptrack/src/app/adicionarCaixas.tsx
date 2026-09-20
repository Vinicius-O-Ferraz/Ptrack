import { Text, View, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import Button from "./Button";

export default function adicionarCaixas() {

  return (
    <View style={styles.container}>
        <text style={styles.text}>
        Adicionar caixas para transporte
      </text>


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