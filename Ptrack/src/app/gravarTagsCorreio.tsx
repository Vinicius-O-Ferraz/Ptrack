import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";

import NfcManager, {
  NfcTech,
  Ndef,
} from "react-native-nfc-manager";

type TipoCaixa = "PIC" | "PC" | "PFC";

export default function GravarTag() {

  const [numeroCaixa, setNumeroCaixa] = useState("");
  const [tipo, setTipo] = useState<TipoCaixa>("PIC");

  const [gravando, setGravando] = useState(false);
  const [quantidadeGravada, setQuantidadeGravada] = useState(0);

  useEffect(() => {

    async function iniciarNFC() {

      try {

        const suportado = await NfcManager.isSupported();

        if (!suportado) {
          Alert.alert(
            "NFC não suportado",
            "Este dispositivo não possui suporte para NFC."
          );

          return;
        }

        await NfcManager.start();

      } catch (error) {

        console.error(
          "Erro ao iniciar NFC:",
          error
        );

      }
    }

    iniciarNFC();

    return () => {
      NfcManager.cancelTechnologyRequest()
        .catch(() => {});
    };

  }, []);


  async function alternarGravacao() {

    if (gravando) {

      await NfcManager.cancelTechnologyRequest()
        .catch(() => {});

      setGravando(false);

      return;
    }

    if (!numeroCaixa.trim()) {

      Alert.alert(
        "Número da caixa",
        "Informe o número da caixa antes de iniciar a gravação."
      );

      return;
    }

    setQuantidadeGravada(0);
    setGravando(true);

    gravarContinuamente();
  }

  async function gravarContinuamente() {

    while (true) {

      
      if (!gravandoAtual()) {
        break;
      }

      try {

        await NfcManager.requestTechnology(
          NfcTech.Ndef
        );

        const tag = await NfcManager.getTag();

        if (!tag) {
          continue;
        }

        const dados = {
          numero: numeroCaixa.trim(),
          tipo: tipo,
        };

        const texto = JSON.stringify(dados);

      
        const registro = Ndef.textRecord(texto);

        const mensagem = [
          registro,
        ];

        
        await NfcManager.ndefHandler.writeNdefMessage(
          mensagem
        );

        setQuantidadeGravada(
          (valor) => valor + 1
        );

        Alert.alert(
          "Tag gravada",
          `Caixa: ${numeroCaixa}\nTipo: ${tipo}`
        );

      } catch (error) {

        console.error(
          "Erro ao gravar tag:",
          error
        );

        Alert.alert(
          "Erro",
          "Não foi possível gravar esta tag."
        );

      } finally {

        await NfcManager.cancelTechnologyRequest()
          .catch(() => {});
      }
      await new Promise(
        (resolve) => setTimeout(resolve, 300)
      );
    }
  }

  function gravandoAtual() {
    return gravando;
  }


  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>
        Gravar Tag NFC
      </Text>


      <Text style={styles.label}>
        Número da caixa
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o número da caixa"
        value={numeroCaixa}
        onChangeText={setNumeroCaixa}
        keyboardType="numeric"
        editable={!gravando}
      />


      <Text style={styles.label}>
        Tipo da caixa
      </Text>


      <View style={styles.tipos}>

        <Pressable
          style={[
            styles.tipo,
            tipo === "PIC" && styles.tipoSelecionado,
          ]}
          onPress={() => setTipo("PIC")}
          disabled={gravando}
        >
          <Text
            style={[
              styles.textoTipo,
              tipo === "PIC" && styles.textoSelecionado,
            ]}
          >
            PIC
          </Text>
        </Pressable>


        <Pressable
          style={[
            styles.tipo,
            tipo === "PC" && styles.tipoSelecionado,
          ]}
          onPress={() => setTipo("PC")}
          disabled={gravando}
        >
          <Text
            style={[
              styles.textoTipo,
              tipo === "PC" && styles.textoSelecionado,
            ]}
          >
            PC
          </Text>
        </Pressable>


        <Pressable
          style={[
            styles.tipo,
            tipo === "PFC" && styles.tipoSelecionado,
          ]}
          onPress={() => setTipo("PFC")}
          disabled={gravando}
        >
          <Text
            style={[
              styles.textoTipo,
              tipo === "PFC" && styles.textoSelecionado,
            ]}
          >
            PFC
          </Text>
        </Pressable>

      </View>


      <View style={styles.informacoes}>

        <Text style={styles.info}>
          Caixa: {numeroCaixa || "-"}
        </Text>

        <Text style={styles.info}>
          Tipo: {tipo}
        </Text>

        <Text style={styles.info}>
          Tags gravadas: {quantidadeGravada}
        </Text>

      </View>


      <Pressable
        style={[
          styles.botao,
          gravando
            ? styles.botaoParar
            : styles.botaoIniciar,
        ]}
        onPress={alternarGravacao}
      >

        <Text style={styles.textoBotao}>
          {gravando
            ? "Parar gravação"
            : "Iniciar gravação"}
        </Text>

      </Pressable>


      {gravando && (
        <Text style={styles.status}>
          Aproxime uma tag NFC...
        </Text>
      )}

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7c23e",

  },

  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    marginBottom: 25,
    backgroundColor: "#fff",
  },

  tipos: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  tipo: {
    width: "30%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
  },

  tipoSelecionado: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },

  textoTipo: {
    fontSize: 18,
    fontWeight: "bold",
  },

  textoSelecionado: {
    color: "#fff",
  },

  informacoes: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
    marginBottom: 25,
  },

  info: {
    fontSize: 17,
    marginBottom: 5,
  },

  botao: {
    padding: 17,
    borderRadius: 10,
    alignItems: "center",
  },

  botaoIniciar: {
    backgroundColor: "#007AFF",
  },

  botaoParar: {
    backgroundColor: "#dc3545",
  },

  textoBotao: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  status: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
  },

});
