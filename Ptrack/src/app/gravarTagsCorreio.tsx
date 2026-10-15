import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";

import NfcManager, {
  NfcTech,
  Ndef,
} from "react-native-nfc-manager";

import { supabase } from "./supabaseClient";

type TipoCaixa = "PIC" | "PC" | "PFC";

export default function GravarTag() {
  const [numeroCaixa, setNumeroCaixa] = useState("");
  const [tipo, setTipo] = useState<TipoCaixa>("PIC");

  const [gravando, setGravando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [quantidadeGravada, setQuantidadeGravada] = useState(0);
  const [status, setStatus] = useState("Aguardando pistola RFID");

  const gravandoRef = useRef(false);
  const numeroRef = useRef("");
  const tipoRef = useRef<TipoCaixa>("PIC");
  const processandoRef = useRef(false);
  const ultimoCodigoRef = useRef("");

  // Mantém os valores atuais disponíveis nas rotinas assíncronas.
  useEffect(() => {
    numeroRef.current = numeroCaixa;
  }, [numeroCaixa]);

  useEffect(() => {
    tipoRef.current = tipo;
  }, [tipo]);

  useEffect(() => {
    async function iniciarNFC() {
      try {
        const suportado = await NfcManager.isSupported();

        if (!suportado) {
          setStatus("NFC indisponível neste dispositivo");
          return;
        }

        await NfcManager.start();
        setStatus("Pronto: aproxime a pistola RFID");
      } catch (error) {
        console.error("Erro ao iniciar NFC:", error);
        setStatus("Não foi possível iniciar o NFC");
      }
    }

    iniciarNFC();

    return () => {
      gravandoRef.current = false;
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  // Recebe a leitura enviada pelo leitor HID.
  // O campo não fica desabilitado durante a gravação NFC.
  async function receberCodigo(codigoRecebido: string) {
    const codigo = codigoRecebido.trim();

    if (!codigo || processandoRef.current) {
      return;
    }

    processandoRef.current = true;

    try {
      // Evita o reenvio imediato do mesmo código.
      if (codigo === ultimoCodigoRef.current) {
        setStatus(`Código já processado: ${codigo}`);
        return;
      }

      // caixa_id é bigint no PostgreSQL.
      // O código lido deve representar um inteiro positivo.
      if (!/^[0-9]+$/.test(codigo) || /^0+$/.test(codigo)) {
        setStatus("Leitura inválida: esperado um número positivo");
        return;
      }

      const numero = Number(codigo);

      if (!Number.isSafeInteger(numero)) {
        setStatus("Código fora do limite numérico seguro do aplicativo");
        return;
      }

      setNumeroCaixa(codigo);
      numeroRef.current = codigo;

      setSalvando(true);
      setStatus("Salvando caixa no Supabase...");

      // Insere o registro. pallet_id será NULL.
      const { error } = await supabase
        .from("caixa")
        .insert({
          caixa_id: numero,
          tipo: tipoRef.current,
          pallet_id: null,
        });

      if (error) {
        console.error("Erro ao salvar caixa:", error);

        setStatus(
          error.code === "23505"
            ? "Esta caixa já está cadastrada"
            : `Erro ao salvar: ${error.message}`
        );

        return;
      }

      ultimoCodigoRef.current = codigo;
      setStatus(`Caixa ${codigo} salva com sucesso`);

      // Se a gravação NFC estiver ativa, o próximo ciclo
      // usará o código recém-lido.
    } finally {
      setSalvando(false);
      processandoRef.current = false;
    }
  }

  async function gravarTag() {
    if (gravandoRef.current) {
      gravandoRef.current = false;
      setGravando(false);
      setStatus("Parando gravação NFC...");

      try {
        await NfcManager.cancelTechnologyRequest();
      } catch (error) {
        console.log("Erro ao cancelar NFC:", error);
      }

      setStatus("Gravação NFC parada");
      return;
    }

    if (!numeroRef.current.trim()) {
      Alert.alert(
        "Aguardando RFID",
        "Leia uma caixa com a pistola RFID antes de iniciar a gravação NFC."
      );
      return;
    }

    gravandoRef.current = true;
    setGravando(true);
    setQuantidadeGravada(0);
    setStatus("Aproxime uma tag NFC para gravar");

    iniciarGravacaoContinua();
  }

  async function iniciarGravacaoContinua() {
    while (gravandoRef.current) {
      try {
        await NfcManager.requestTechnology(NfcTech.Ndef);

        if (!gravandoRef.current) {
          break;
        }

        // Lê o valor mais recente, não um valor antigo
        // capturado quando o botão foi pressionado.
        const numeroAtual = numeroRef.current.trim();
        const tipoAtual = tipoRef.current;

        if (!numeroAtual) {
          setStatus("Aguardando leitura da pistola RFID...");
          continue;
        }

        const texto = JSON.stringify({
          numero: numeroAtual,
          tipo: tipoAtual,
        });

        const mensagem = Ndef.encodeMessage([
          Ndef.textRecord(texto),
        ]);

        if (!mensagem) {
          throw new Error("Falha ao codificar a mensagem NDEF");
        }

        await NfcManager.ndefHandler.writeNdefMessage(mensagem);

        setQuantidadeGravada((q) => q + 1);
        setStatus(`Tag NFC gravada: ${numeroAtual} - ${tipoAtual}`);
      } catch (error: any) {
        if (gravandoRef.current) {
          console.error("Erro na gravação NFC:", error);
          setStatus("Erro na gravação NFC. Tente outra tag.");
        }
      } finally {
        try {
          await NfcManager.cancelTechnologyRequest();
        } catch {}
      }

      if (gravandoRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    setGravando(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro de Caixa RFID/NFC</Text>

      <Text style={styles.label}>Número da caixa (RFID)</Text>

      <TextInput
        style={styles.input}
        value={numeroCaixa}
        placeholder="Aguardando leitura da pistola..."
        editable={true}
        showSoftInputOnFocus={false}
        caretHidden={true}
        contextMenuHidden={true}
        selectTextOnFocus={false}
        onChangeText={(valor) => {
          // Não aceita alterações manuais pelo teclado.
          // A leitura autorizada é tratada no onSubmitEditing
          // em equipamentos que enviam Enter.
          if (valor === numeroRef.current) return;

          // A atualização efetiva ocorre ao confirmar a leitura.
          // Não atualizar o estado com texto digitado.
        }}
        onSubmitEditing={({ nativeEvent }) => {
          receberCodigo(nativeEvent.text).catch((error) => {
            console.error(error);
            setStatus("Falha ao processar a leitura RFID");
          });
        }}
        blurOnSubmit={false}
      />

      <Text style={styles.ajuda}>
        Campo reservado à pistola RFID. A leitura permanece habilitada
        durante a gravação NFC.
      </Text>

      <Text style={styles.label}>Tipo da caixa</Text>

      <View style={styles.tipos}>
        {(["PIC", "PC", "PFC"] as TipoCaixa[]).map((item) => (
          <Pressable
            key={item}
            style={[
              styles.tipoBotao,
              tipo === item && styles.tipoSelecionado,
            ]}
            disabled={gravando || salvando}
            onPress={() => setTipo(item)}
          >
            <Text
              style={[
                styles.tipoTexto,
                tipo === item && styles.tipoTextoSelecionado,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.status}>{status}</Text>

      <Text style={styles.contador}>
        Tags NFC gravadas: {quantidadeGravada}
      </Text>

      <Pressable
        style={[
          styles.botao,
          gravando ? styles.botaoParar : styles.botaoIniciar,
        ]}
        onPress={gravarTag}
      >
        <Text style={styles.botaoTexto}>
          {gravando ? "PARAR GRAVAÇÃO" : "INICIAR GRAVAÇÃO NFC"}
        </Text>
      </Pressable>
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
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    marginBottom: 8,
    backgroundColor: "#fff",
    color: "#222",
  },
  ajuda: {
    fontSize: 12,
    marginBottom: 20,
    color: "#333",
  },
  tipos: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 30,
  },
  tipoBotao: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  tipoSelecionado: {
    backgroundColor: "#333",
    borderColor: "#333",
  },
  tipoTexto: {
    fontWeight: "bold",
  },
  tipoTextoSelecionado: {
    color: "#fff",
  },
  status: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 10,
  },
  contador: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 25,
  },
  botao: {
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  botaoIniciar: {
    backgroundColor: "#2196F3",
  },
  botaoParar: {
    backgroundColor: "#D32F2F",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});