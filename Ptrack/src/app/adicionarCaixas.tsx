import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { createClient } from "@supabase/supabase-js";
import { router } from "expo-router";

// ======================================================
// SUPABASE
// ======================================================

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// ======================================================
// TIPO DO DOCUMENTO
// ======================================================

type DocumentoRemessa = {
  id_documento: number;
  placa: string;
};

// ======================================================
// TELA
// ======================================================

export default function BuscarDocumentoRemessa() {
  const [numeroBusca, setNumeroBusca] = useState("");
  const [documentos, setDocumentos] = useState<DocumentoRemessa[]>([]);
  const [buscando, setBuscando] = useState(false);

  // ======================================================
  // BUSCAR DOCUMENTO
  // ======================================================

  async function buscarDocumento() {
    if (!numeroBusca.trim()) {
      Alert.alert("Atenção", "Digite o número do documento de remessa.");
      return;
    }

    setBuscando(true);

    const numero = Number(numeroBusca);

    if (isNaN(numero)) {
      setBuscando(false);
      Alert.alert("Atenção", "Digite um número de remessa válido.");
      return;
    }

    const { data, error } = await supabase
      .from("documento_remessa")
      .select("id_documento, placa")
      .eq("id_documento", numero);

    setBuscando(false);

    // ==================================================
    // TRATAR ERRO
    // ==================================================

    if (error) {
      console.error("Erro ao buscar documento:", error);
      Alert.alert("Erro", "Não foi possível buscar o documento.");
      return;
    }

    // ==================================================
    // NENHUM RESULTADO
    // ==================================================

    if (!data || data.length === 0) {
      setDocumentos([]);
      Alert.alert("Aviso", "Nenhum documento encontrado.");
      return;
    }

    // ==================================================
    // RESULTADOS
    // ==================================================

    setDocumentos(data);
  }

  // ======================================================
  // COMEÇAR LEITURA
  // ======================================================

  function comecarLeitura(documento: DocumentoRemessa) {
    router.push({
      pathname: "/todo",
      params: {
        idDocumento: documento.id_documento.toString(),
        placa: documento.placa,
      },
    });
  }

  // ======================================================
  // INTERFACE
  // ======================================================

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Buscar Documento de Remessa</Text>

      <Text style={styles.label}>Número do documento</Text>
      <TextInput
        style={styles.input}
        value={numeroBusca}
        onChangeText={setNumeroBusca}
        keyboardType="numeric"
        placeholder="Digite o número do documento"
      />

      <Button title="Buscar" onPress={buscarDocumento} disabled={buscando} />

      {buscando && (
        <View style={styles.carregando}>
          <ActivityIndicator />
          <Text style={styles.textoCarregando}>Buscando documento...</Text>
        </View>
      )}

      {!buscando && documentos.length > 0 && (
        <View style={styles.resultados}>
          <Text style={styles.subtitulo}>Documento encontrado</Text>
          {documentos.map((documento) => (
            <View key={documento.id_documento} style={styles.documento}>
              <Text style={styles.numeroDocumento}>
                Documento: {documento.id_documento}
              </Text>
              <Text style={styles.placa}>Placa: {documento.placa}</Text>
              <View style={styles.botaoLeitura}>
                <Button
                  title="Começar leitura"
                  onPress={() => comecarLeitura(documento)}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f7c23e",
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    minHeight: 45,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },
  carregando: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginTop: 20,
  },
  textoCarregando: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  resultados: {
    marginTop: 10,
  },
  documento: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  numeroDocumento: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  placa: {
    fontSize: 16,
    marginBottom: 5,
  },
  botaoLeitura: {
    marginTop: 15,
  },
});