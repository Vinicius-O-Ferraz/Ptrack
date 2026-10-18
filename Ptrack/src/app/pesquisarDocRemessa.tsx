
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "./supabaseClient";

type DocumentoRemessa = {
  id_documento: number;
  placa: string;
  cpf: string;
  id_rota: string;
  qtd_pic: number | null;
  qtd_pfc: number | null;
  qtd_pc: number | null;
};

type Divergencia = {
  id_documento: number;
  qtd_pic: number | null;
  qtd_pfc: number | null;
  qtd_pc: number | null;
};

export default function ConsultarDocumentoRemessa() {
  const router = useRouter();

  const [idDocumento, setIdDocumento] = useState("");
  const [documento, setDocumento] =
    useState<DocumentoRemessa | null>(null);
  const [divergencia, setDivergencia] =
    useState<Divergencia | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function pesquisarDocumento() {
    const id = idDocumento.trim();

    if (!id || !/^\d+$/.test(id)) {
      Alert.alert(
        "ID inválido",
        "Digite um ID de documento numérico."
      );
      return;
    }

    setCarregando(true);
    setDocumento(null);
    setDivergencia(null);

    try {
      // Busca o documento de remessa
      const { data: doc, error: erroDocumento } = await supabase
        .from("documento_remessa")
        .select("*")
        .eq("id_documento", Number(id))
        .maybeSingle();

      if (erroDocumento) {
        throw erroDocumento;
      }

      if (!doc) {
        Alert.alert(
          "Documento não encontrado",
          `Não existe documento de remessa com ID ${id}.`
        );
        return;
      }

      setDocumento(doc as DocumentoRemessa);

      // Busca as divergências registradas para o documento
      const { data: div, error: erroDivergencia } = await supabase
        .from("divergencia")
        .select("*")
        .eq("id_documento", Number(id))
        .maybeSingle();

      if (erroDivergencia) {
        throw erroDivergencia;
      }

      setDivergencia(div as Divergencia | null);
    } catch (erro: any) {
      console.error("Erro ao consultar documento:", erro);

      Alert.alert(
        "Erro na consulta",
        erro?.message ?? "Não foi possível consultar o documento."
      );
    } finally {
      setCarregando(false);
    }
  }

  function Campo({
    titulo,
    valor,
  }: {
    titulo: string;
    valor: string | number | null | undefined;
  }) {
    return (
      <View style={styles.campo}>
        <Text style={styles.campoTitulo}>{titulo}</Text>
        <Text style={styles.campoValor}>
          {valor === null || valor === undefined || valor === ""
            ? "Não informado"
            : String(valor)}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>
        Consultar documento de remessa
      </Text>

      <Text style={styles.descricao}>
        Digite ou leia o ID do documento para consultar suas
        informações.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="ID do documento"
        placeholderTextColor="#777"
        value={idDocumento}
        onChangeText={setIdDocumento}
        keyboardType="numeric"
        returnKeyType="search"
        onSubmitEditing={pesquisarDocumento}
      />

      <Pressable
        style={[
          styles.botao,
          carregando && styles.botaoDesabilitado,
        ]}
        onPress={pesquisarDocumento}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBotao}>Pesquisar</Text>
        )}
      </Pressable>

      {documento && (
        <View style={styles.card}>
          <Text style={styles.subtitulo}>
            Dados do documento
          </Text>

          <Campo
            titulo="ID do documento"
            valor={documento.id_documento}
          />
          <Campo titulo="Placa do veículo" valor={documento.placa} />
          <Campo
            titulo="CPF do motorista"
            valor={documento.cpf}
          />
          <Campo titulo="ID da rota" valor={documento.id_rota} />

          <Text style={styles.subtitulo}>
            Quantidades registradas no documento
          </Text>

          <View style={styles.linhaQuantidades}>
            <View style={styles.quantidade}>
              <Text style={styles.tipoPIC}>PIC</Text>
              <Text style={styles.numero}>
                {documento.qtd_pic ?? 0}
              </Text>
            </View>

            <View style={styles.quantidade}>
              <Text style={styles.tipoPFC}>PFC</Text>
              <Text style={styles.numero}>
                {documento.qtd_pfc ?? 0}
              </Text>
            </View>

            <View style={styles.quantidade}>
              <Text style={styles.tipoPC}>PC</Text>
              <Text style={styles.numero}>
                {documento.qtd_pc ?? 0}
              </Text>
            </View>
          </View>

          <Text style={styles.subtitulo}>
            Divergências registradas
          </Text>

          {divergencia ? (
            <>
              <Campo
                titulo="ID do documento"
                valor={divergencia.id_documento}
              />
              <View style={styles.linhaQuantidades}>
                <View style={styles.quantidade}>
                  <Text style={styles.tipoPIC}>PIC</Text>
                  <Text style={styles.numero}>
                    {divergencia.qtd_pic ?? 0}
                  </Text>
                </View>

                <View style={styles.quantidade}>
                  <Text style={styles.tipoPFC}>PFC</Text>
                  <Text style={styles.numero}>
                    {divergencia.qtd_pfc ?? 0}
                  </Text>
                </View>

                <View style={styles.quantidade}>
                  <Text style={styles.tipoPC}>PC</Text>
                  <Text style={styles.numero}>
                    {divergencia.qtd_pc ?? 0}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.semDivergencia}>
              Nenhuma divergência registrada para este documento.
            </Text>
          )}
        </View>
      )}

      <Pressable
        style={styles.botaoVoltar}
        onPress={() => router.back()}
      >
        <Text style={styles.textoBotao}>Voltar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7c23e",
  },
  conteudo: {
    padding: 20,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
  },
  descricao: {
    fontSize: 15,
    color: "#555",
    marginBottom: 20,
    lineHeight: 22,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#222",
    marginBottom: 12,
  },
  botao: {
    backgroundColor: "#244CA4",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  textoBotao: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 18,
    marginTop: 5,
    elevation: 3,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginTop: 10,
    marginBottom: 15,
  },
  campo: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  campoTitulo: {
    fontSize: 13,
    color: "#777",
    marginBottom: 4,
  },
  campoValor: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
  },
  linhaQuantidades: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 15,
  },
  quantidade: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    paddingVertical: 14,
  },
  tipoPIC: {
    color: "#B45309",
    fontWeight: "bold",
    fontSize: 16,
  },
  tipoPFC: {
    color: "#244CA4",
    fontWeight: "bold",
    fontSize: 16,
  },
  tipoPC: {
    color: "#15803D",
    fontWeight: "bold",
    fontSize: 16,
  },
  numero: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#222",
    marginTop: 5,
  },
  semDivergencia: {
    color: "#15803D",
    fontSize: 14,
    lineHeight: 21,
    paddingVertical: 8,
  },
  botaoVoltar: {
    backgroundColor: "#244CA4",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
});
