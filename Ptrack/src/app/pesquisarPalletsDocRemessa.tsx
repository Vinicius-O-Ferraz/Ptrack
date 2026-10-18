import { Text, View, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import Button from "./Button";
import gravarTagsCorreio from "./gravarTagsCorreio";

export default function homeDriver() {

  function pesquisarPallet() {
    router.push("./pesquisarPallet");
  }

  function pesquisarDocRemessa() {
    // router.push("./todo");
    router.push("./pesquisarDocRemessa");
  }

  return (
    <View style={styles.container}>

      <Text style={styles.text}>
          Funcionário Hemobrás
      </Text>
      
      <Button
        title="Pesquisar Pallet"
        onPress={pesquisarPallet}
      />

      <Button
        title="Pesquisar Documento de Remessa"
        onPress={pesquisarDocRemessa}
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
});