import { Text, View, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import Button from "./Button";

export default function homeDriver() {

  function cadastrar_veiculos() {
    // router.push("/adicionarCaixas");
    router.push("./todo");
  }

  function gravarTagsCorreio() {
    router.push("./todo");
    // router.push("/adicionarNumeroRemessa");
  }

    function gravarTagsP00() {
    router.push("./todo");
    // router.push("/adicionarNumeroRemessa");
  }

   function tranferirTagsP00P001() {
    router.push("./todo");
    // router.push("/adicionarNumeroRemessa");
  }

     function tranferirTagsP01P001() {
    router.push("./todo");
    // router.push("/adicionarNumeroRemessa");
  }

  return (
    <View style={styles.container}>

      <Text style={styles.text}>
          Funcionário Hemobrás
      </Text>
      
      <Button
        title="Cadastrar veículo qualificados"
        onPress={cadastrar_veiculos}
      />

      <Button
        title="Gravar tags para remessa para correios"
        onPress={gravarTagsCorreio}
      />

            <Button
        title="Gravar tags das caixas em pallets p00"
        onPress={gravarTagsP00}
      />

      <Button
        title="Vincular tags do p0 aos pallets p01"
        onPress={tranferirTagsP00P001}
      />

            <Button
        title="Vincular tags do p01 aos pallets p01"
        onPress={tranferirTagsP01P001}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
     backgroundColor: "#e0ad2a",
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