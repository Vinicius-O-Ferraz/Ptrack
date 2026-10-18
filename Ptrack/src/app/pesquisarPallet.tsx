import { Text, View, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import Button from "./Button";

export default function todo() {


  return (
    <View style={styles.container}>
      <Image
        source={require("./images/manutencao.png")}
        style={styles.logo}
      />
         <Text style={styles.text}>
                Desculpe, estamos em manutenção
        </Text>
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