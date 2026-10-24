
import { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";

import NfcManager, {
  NfcTech,
  Ndef,
} from "react-native-nfc-manager";

import { supabase } from "./supabaseClient";

type DadosCaixa = {
  tag: string;
  tipo: "PIC" | "PFC" | "PC";
};

export default function AssociarCaixasPallet() {
  const { palletId } = useLocalSearchParams<{
    palletId: string;
  }>();

  const [caixas, setCaixas] = useState<DadosCaixa[]>([]);
  const [lendo, setLendo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const lendoRef = useRef(false);
  const caixasLidasRef = useRef<string[]>([]);

  useEffect(() => {
    NfcManager.start();

    return () => {
      lendoRef.current = false;
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  function interpretarTag(tagNfc: any): DadosCaixa | null {
    try {
      if (!tagNfc?.ndefMessage?.length) {
        return null;
      }

      const record = tagNfc.ndefMessage[0];

      const texto = Ndef.text.decodePayload(
        new Uint8Array(record.payload)
      );

      const dados = JSON.parse(texto);

      const idCaixa = String(dados.tag ?? "").trim();
      const tipo = String(dados.tipo ?? "")
        .trim()
        .toUpperCase();

      if (!idCaixa || !["PIC", "PFC", "PC"].includes(tipo)) {
        return null;
      }

      return {
        tag: idCaixa,
        tipo: tipo as DadosCaixa["tipo"],
      };
    } catch (error) {
      console.error("Erro ao interpretar tag:", error);
      return null;
    }
  }

  async function lerEAssociarCaixa() {
    if (lendoRef.current || salvando) {
      return;
    }

    if (!palletId || !/^\d+$/.test(String(palletId))) {
      Alert.alert("Erro", "ID do pallet não informado ou inválido.");
      return;
    }

    lendoRef.current = true;
    setLendo(true);

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const tagNfc = await NfcManager.getTag();

      if (!tagNfc) {
        Alert.alert("Erro", "Não foi possível ler a tag NFC.");
        return;
      }

      const caixa = interpretarTag(tagNfc);

      if (!caixa) {
        Alert.alert(
          "Tag inválida",
          "A tag não contém um identificador e um tipo de caixa válidos."
        );
        return;
      }

      if (caixasLidasRef.current.includes(caixa.tag)) {
        Alert.alert(
          "Caixa já lida",
          `A caixa ${caixa.tag} já foi processada nesta tela.`
        );
        return;
      }

      setSalvando(true);

      // Confirma que o pallet existe e é do tipo P00.
      const { data: pallet, error: erroPallet } = await supabase
        .from("pallet")
        .select("pallet_id, tipo_pallet")
        .eq("pallet_id", Number(palletId))
        .eq("tipo_pallet", "P00")
        .maybeSingle();

      if (erroPallet) {
        throw erroPallet;
      }

      if (!pallet) {
        Alert.alert(
          "Pallet inválido",
          "O pallet informado não existe ou não é do tipo P00."
        );
        return;
      }

      // Salva a associação entre a caixa e o pallet.
      const { error: erroAssociacao } = await supabase
        .from("pallet_caixa")
        .insert({
          pallet_id: pallet.pallet_id,
          caixa_id: caixa.tag,
          tipo_caixa: caixa.tipo,
        });

      if (erroAssociacao) {
        if (erroAssociacao.code === "23505") {
          Alert.alert(
            "Caixa já associada",
            `A caixa ${caixa.tag} já consta na tabela de associações.`
          );
          return;
        }

        console.error("Erro ao associar caixa:", erroAssociacao);

        Alert.alert(
          "Erro",
          "Não foi possível associar a caixa ao pallet."
        );
        return;
      }

      caixasLidasRef.current.push(caixa.tag);
      setCaixas((lista) => [...lista, caixa]);

      Alert.alert(
        "Associação concluída",
        `Caixa: ${caixa.tag}\n` +
          `Tipo: ${caixa.tipo}\n` +
          `Pallet: ${pallet.pallet_id}`
      );
    } catch (error) {
      if (lendoRef.current) {
        console.error("Erro durante leitura NFC:", error);

        Alert.alert(
          "Erro",
          "Não foi possível ler ou associar a caixa. Tente novamente."
        );
      }
    } finally {
      lendoRef.current = false;
      setLendo(false);
      setSalvando(false);

      await NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>
        Associar Caixas ao Pallet
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Pallet selecionado</Text>

        <Text style={styles.valor}>
          ID: {palletId ?? "Não informado"}
        </Text>

        <Text style={styles.valor}>Tipo: P00</Text>
      </View>

      <Text style={styles.instrucao}>
        Aproxime a tag NFC da caixa para registrar sua associação
        ao pallet selecionado.
      </Text>

      <View style={styles.botao}>
        {lendo || salvando ? (
          <View style={styles.carregando}>
            <ActivityIndicator size="large" color="#333333" />
            <Text style={styles.textoCarregando}>
              {salvando ? "Associando caixa..." : "Aproxime a tag NFC..."}
            </Text>
          </View>
        ) : (
          <Button
            title="Ler caixa e associar"
            onPress={lerEAssociarCaixa}
            color="#248a45"
          />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitulo}>
          Caixas associadas nesta sessão: {caixas.length}
        </Text>

        {caixas.length === 0 ? (
          <Text style={styles.instrucao}>
            Nenhuma caixa associada nesta sessão.
          </Text>
        ) : (
          caixas.map((caixa) => (
            <View key={caixa.tag} style={styles.caixa}>
              <Text style={styles.valor}>
                ID: {caixa.tag}
              </Text>

              <Text style={styles.valor}>
                Tipo: {caixa.tipo}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.botao}>
        <Button
          title="Concluído"
          onPress={() => router.back()}
          disabled={lendo || salvando}
          color="#333333"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f7c23e",
  },

  titulo: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 10,
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },

  valor: {
    fontSize: 16,
    marginBottom: 5,
  },

  instrucao: {
    fontSize: 16,
    marginBottom: 15,
  },

  botao: {
    marginBottom: 20,
  },

  carregando: {
    alignItems: "center",
    padding: 10,
  },

  textoCarregando: {
    marginTop: 10,
    fontSize: 16,
  },

  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  caixa: {
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
    paddingTop: 10,
    marginTop: 5,
  },
});
