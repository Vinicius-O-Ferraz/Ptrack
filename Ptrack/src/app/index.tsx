import { Text, Pressable, View, StyleSheet, Image } from "react-native";


export default function Index() {
  return (
    <View style={styles.container}>
      <Image
        source={require("./logo.png")}
        style={styles.logo}
      />

      <Text style={styles.text}>Bem vindo ao PlasmaTrack</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 400,
    height: 400,
    resizeMode: "contain",
  },

  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E63A4A",
  },
});