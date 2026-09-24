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
  Pressable,
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
// TIPO DA ROTA
// ======================================================
type Rota = {
  id_rota: string;
  nome_rota: string;
};

// ======================================================
// TELA
// ======================================================
export default function adicionarNumeroRemessa() {
  const [nomeBusca, setNomeBusca] = useState("");
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [carregando, setCarregando] = useState(false);

  // ======================================================
  // IR PARA CADASTRO DE ROTAS
  // ======================================================
  function cadastrarRotas() {
    router.push("/cadastrarRotas");
  }

  // ======================================================
  // BUSCAR ROTAS
  // ======================================================
  async function buscarRotas() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("rota")
      .select("id_rota, nome_rota")
      .ilike("nome_rota", `%${nomeBusca}%`)
      .order("nome_rota", { ascending: true });

    setCarregando(false);

    if (error) {
      console.error("Erro ao buscar rotas:", error);

      Alert.alert(
        "Erro",
        "Não foi possível buscar as rotas."
      );

      return;
    }

    setRotas(data || []);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* ==================================================
          TÍTULO
      ================================================== */}
      <Text style={styles.titulo}>
        Buscar Rota
      </Text>

      {/* ==================================================
          CAMPO DE BUSCA
      ================================================== */}
      <Text style={styles.label}>
        Nome da rota
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o nome da rota"
        value={nomeBusca}
        onChangeText={setNomeBusca}
      />

      {/* ==================================================
          BOTÃO BUSCAR
      ================================================== */}
      <Button
        title="Buscar"
        onPress={buscarRotas}
      />

      {/* ==================================================
          CARREGAMENTO
      ================================================== */}
      {carregando && (
        <View style={styles.carregando}>
          <ActivityIndicator size="large" />

          <Text style={styles.textoCarregando}>
            Buscando rotas...
          </Text>
        </View>
      )}

      {/* ==================================================
          RESULTADOS
      ================================================== */}
      {!carregando && rotas.length > 0 && (
        <View style={styles.resultados}>

          <Text style={styles.subtitulo}>
            Rotas encontradas
          </Text>

          {rotas.map((rota) => (
            <View
              key={rota.id_rota}
              style={styles.rota}
            >
              <Text style={styles.nomeRota}>
                {rota.nome_rota}
              </Text>

              <Text style={styles.idRota}>
                ID: {rota.id_rota}
              </Text>

              <View style={{ flexDirection: "row", gap: 20 }}>
                <Pressable
                   onPress={() =>
                    router.push({
                      pathname: "/alterarRota",
                      params: {
                        id_rota: rota.id_rota,
                      },
                    })
                  }
                >
                  <Text>Alterar</Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push("/todo")}
                >
                  <Text>Usar</Text>
                </Pressable>
              </View>
            </View>
          ))}

        </View>
      )}

      {/* ==================================================
          NENHUM RESULTADO
      ================================================== */}
      {!carregando &&
        rotas.length === 0 &&
        nomeBusca !== "" && (
          <Text style={styles.textoAviso}>
            Nenhuma rota encontrada.
          </Text>
        )}

      {/* ==================================================
          CADASTRAR NOVA ROTA
      ================================================== */}
      <View style={styles.botaoCriar}>

        <Button
          title="Cadastrar Rota"
          onPress={cadastrarRotas}
        />

      </View>

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
    marginBottom: 25,
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
    marginBottom: 15,
  },

  carregando: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginTop: 15,
  },

  textoCarregando: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  resultados: {
    marginTop: 10,
  },

  rota: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,

    // Sombra no Android
    elevation: 3,
  },

  nomeRota: {
    fontSize: 18,
    fontWeight: "bold",
  },

  idRota: {
    fontSize: 14,
    marginTop: 5,
    color: "#555555",
  },

  textoAviso: {
    textAlign: "center",
    marginTop: 15,
    fontSize: 16,
  },

  botaoCriar: {
    marginTop: 25,
    marginBottom: 40,
  },
});
