import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

export default function TestePallets() {
  const {
    palletIdP00,
    tipoPalletP00,
    palletIdP01,
    tipoPalletP01,
  } = useLocalSearchParams<{
    palletIdP00: string;
    tipoPalletP00: string;
    palletIdP01: string;
    tipoPalletP01: string;
  }>();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Teste de Pallets" }} />

      <Text style={styles.titulo}>
        Pallets Selecionados
      </Text>

      <View style={styles.card}>
        <Text style={styles.subtitulo}>
          Pallet de origem
        </Text>

        <Text style={styles.texto}>
          ID P00: {palletIdP00 ?? "Não recebido"}
        </Text>

        <Text style={styles.texto}>
          Tipo: {tipoPalletP00 ?? "Não recebido"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitulo}>
          Pallet de destino
        </Text>

        <Text style={styles.texto}>
          ID P01: {palletIdP01 ?? "Não recebido"}
        </Text>

        <Text style={styles.texto}>
          Tipo: {tipoPalletP01 ?? "Não recebido"}
        </Text>
      </View>

      <Text style={styles.status}>
        {palletIdP00 && palletIdP01
          ? "Os dois IDs foram recebidos!"
          : "Faltam parâmetros de um ou dos dois pallets."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#f7c23e",
  },

  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },

  subtitulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },

  texto: {
    fontSize: 17,
    marginBottom: 8,
  },

  status: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
});
