import { Text, View, StyleSheet, Image } from "react-native";


export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bem vindo ao PlasmaTrack</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "lightpink",
  },


  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E63A4A",
  },
});