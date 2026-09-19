import { Text, View, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import Button from "./Button";

export default function Index() {

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