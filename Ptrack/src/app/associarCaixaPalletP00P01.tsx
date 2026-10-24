import { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import NfcManager, { NfcTech, Ndef } from "react-native-nfc-manager";
import { supabase } from "./supabaseClient";

type CaixaLida = {
  id: string;
  resultado: string;
};

export default function AssociarCaixaPalletP00P01() {
  const {
    palletIdP00,
    palletIdP01,
    tipoPalletP00,
    tipoPalletP01,
  } = useLocalSearchParams<{
    palletIdP00: string;
    palletIdP01: string;
    tipoPalletP00: string;
    tipoPalletP01: string;
  }>();

  const [lendo, setLendo] = useState(false);
  const [inicializado, setInicializado] = useState(false);
  const [caixasLidas, setCaixasLidas] = useState<CaixaLida[]>([]);
  const [processando, setProcessando] = useState(false);

  const lendoRef = useRef(false);
  const processandoRef = useRef(false);
  const caixasProcessadasRef = useRef(new Set<string>());

  useEffect(() => {
    let ativo = true;

    async function iniciarNfc() {
      try {
        await NfcManager.start();

        if (ativo) {
          setInicializado(true);
        }
      } catch (error) {
        console.error("Erro ao iniciar NFC:", error);
        Alert.alert("Erro", "Não foi possível inicializar o NFC.");
      }
    }

    iniciarNfc();

    return () => {
      ativo = false;
      lendoRef.current = false;

      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  function registrarResultado(id: string, resultado: string) {
    setCaixasLidas((anteriores) => [
      { id, resultado },
      ...anteriores,
    ]);
  }

  // async function associarCaixa(idCaixa: string) {
  //   // IMPORTANTE:
  //   // Exemplo de esquema:
  //   // caixa(id_caixa, pallet_id)
  //   //
  //   // Adapte os nomes para o esquema real do seu Supabase.

  //   const { data: caixa, error: erroBusca } = await supabase
  //     .from("caixa")
  //     .select("caixa_id, pallet_id")
  //     .eq("caixa_id", idCaixa)
  //     .maybeSingle();

  //   if (erroBusca) {
  //     throw new Error(`Erro ao consultar caixa: ${erroBusca.message}`);
  //   }

  //   if (!caixa) {
  //     throw new Error("Caixa não encontrada no banco de dados.");
  //   }

  //   if (String(caixa.pallet_id) !== String(palletIdP00)) {
  //     if (String(caixa.pallet_id) === String(palletIdP01)) {
  //       throw new Error("Esta caixa já está associada ao pallet P01.");
  //     }

  //     throw new Error("Esta caixa não está associada ao pallet P00 informado.");
  //   }

  //   // Atualiza somente se a caixa ainda pertencer ao P00.
  //   // Isso ajuda a evitar transferências concorrentes.
  //   const { data: atualizada, error: erroUpdate } = await supabase
  //     .from("caixa")
  //     .update({ pallet_id: Number(palletIdP01) })
  //     .eq("caixa_id", idCaixa)
  //     .eq("pallet_id", Number(palletIdP00))
  //     .select("caixa_id")
  //     .maybeSingle();

  //   if (erroUpdate) {
  //     throw new Error(`Erro ao transferir caixa: ${erroUpdate.message}`);
  //   }

  //   if (!atualizada) {
  //     throw new Error(
  //       "A associação não foi alterada. Verifique se a caixa ainda pertence ao P00 e se há permissão de atualização."
  //     );
  //   }
  // }
  
async function associarCaixa(idCaixa: string) {
  const origemId = Number(palletIdP00);
  const destinoId = Number(palletIdP01);

  if (
    !Number.isSafeInteger(origemId) ||
    !Number.isSafeInteger(destinoId)
  ) {
    throw new Error("Os IDs dos pallets são inválidos.");
  }

  // Nesta tabela, o identificador da caixa é textual.
  const { data: caixa, error: erroBusca } = await supabase
    .from("pallet_caixa")
    .select("caixa_id, pallet_id, tipo_caixa")
    .eq("caixa_id", idCaixa)
    .maybeSingle();

  if (erroBusca) {
    throw new Error(
      `Erro ao consultar pallet_caixa: ${erroBusca.message}`
    );
  }

  if (!caixa) {
    throw new Error(
      `Caixa "${idCaixa}" não encontrada na tabela pallet_caixa.`
    );
  }

  if (Number(caixa.pallet_id) !== origemId) {
    if (Number(caixa.pallet_id) === destinoId) {
      throw new Error("Esta caixa já está associada ao pallet P01.");
    }

    throw new Error(
      "Esta caixa não está associada ao pallet P00 informado."
    );
  }

  // Atualiza apenas se a caixa ainda estiver no pallet de origem.
  const { data: atualizada, error: erroUpdate } = await supabase
    .from("pallet_caixa")
    .update({ pallet_id: destinoId })
    .eq("caixa_id", idCaixa)
    .eq("pallet_id", origemId)
    .select("caixa_id")
    .maybeSingle();

  if (erroUpdate) {
    throw new Error(
      `Erro ao transferir caixa: ${erroUpdate.message}`
    );
  }

  if (!atualizada) {
    throw new Error(
      "A transferência não foi realizada. Verifique se a caixa ainda pertence ao P00 e se há permissão de atualização."
    );
  }
}

  async function lerCaixa() {
    if (processandoRef.current) {
      return;
    }

    processandoRef.current = true;
    setProcessando(true);

    let idCaixa = "";

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const tag = await NfcManager.getTag();

      if (!tag?.ndefMessage?.length) {
        throw new Error("A tag não contém uma mensagem NDEF.");
      }

      const registro = tag.ndefMessage[0];

      const payload = Uint8Array.from(
        Array.isArray(registro.payload) ? registro.payload : []
      );

      const conteudo = Ndef.text.decodePayload(payload);

      // Formato esperado, conforme o payload utilizado no projeto:
      // {"tag":"CX001","tipo":"PIC"}
      let dados: { tag?: string; tipo?: string };

      try {
        dados = JSON.parse(conteudo);
      } catch {
        throw new Error("O conteúdo da tag não é um JSON válido.");
      }

      if (!dados.tag) {
        throw new Error("A tag não contém o identificador da caixa.");
      }

      idCaixa = String(dados.tag).trim();

      if (!idCaixa) {
        throw new Error("O identificador da caixa está vazio.");
      }

      if (caixasProcessadasRef.current.has(idCaixa)) {
        registrarResultado(idCaixa, "Ignorada: caixa já lida nesta sessão.");
        return;
      }

      caixasProcessadasRef.current.add(idCaixa);

      await associarCaixa(idCaixa);

      registrarResultado(idCaixa, "Transferida para P01 com sucesso.");
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao ler ou transferir a caixa.";

      registrarResultado(
        idCaixa || "Tag não identificada",
        `Falha: ${mensagem}`
      );
    } finally {
      processandoRef.current = false;
      setProcessando(false);

      await NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  }

  async function iniciarLeitura() {
    if (!inicializado) {
      Alert.alert("Aguarde", "O leitor NFC ainda está inicializando.");
      return;
    }

    if (!palletIdP00 || !palletIdP01) {
      Alert.alert("Erro", "Os IDs dos pallets não foram recebidos.");
      return;
    }

    if (String(palletIdP00) === String(palletIdP01)) {
      Alert.alert("Erro", "Os pallets de origem e destino são iguais.");
      return;
    }

    lendoRef.current = true;
    setLendo(true);

    while (lendoRef.current) {
      await lerCaixa();
    }
  }

  async function pararLeitura() {
    lendoRef.current = false;
    setLendo(false);

    await NfcManager.cancelTechnologyRequest().catch(() => {});
  }

  function alternarLeitura() {
    if (lendoRef.current) {
      void pararLeitura();
    } else {
      void iniciarLeitura();
    }
  }

  function limparHistorico() {
    if (lendoRef.current || processandoRef.current) {
      Alert.alert(
        "Leitura em andamento",
        "Pare a leitura antes de limpar o histórico."
      );
      return;
    }

    caixasProcessadasRef.current.clear();
    setCaixasLidas([]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>
        Associar caixas: P00 → P01
      </Text>

      <View style={styles.card}>
        <Text style={styles.subtitulo}>Pallet de origem</Text>
        <Text style={styles.info}>ID: {palletIdP00}</Text>
        <Text style={styles.info}>
          Tipo: {tipoPalletP00 ?? "P00"}
        </Text>

        <View style={styles.separador} />

        <Text style={styles.subtitulo}>Pallet de destino</Text>
        <Text style={styles.info}>ID: {palletIdP01}</Text>
        <Text style={styles.info}>
          Tipo: {tipoPalletP01 ?? "P01"}
        </Text>
      </View>

      {!inicializado && (
        <View style={styles.aviso}>
          <ActivityIndicator color="#007AFF" />
          <Text style={styles.textoAviso}>
            Inicializando leitor NFC...
          </Text>
        </View>
      )}

      {processando && (
        <View style={styles.aviso}>
          <ActivityIndicator color="#007AFF" />
          <Text style={styles.textoAviso}>
            Processando caixa...
          </Text>
        </View>
      )}

      <Pressable
        style={[
          styles.botao,
          lendo ? styles.botaoParar : styles.botaoIniciar,
          !inicializado && styles.desabilitado,
        ]}
        onPress={alternarLeitura}
        disabled={!inicializado}
      >
        <Text style={styles.textoBotao}>
          {lendo ? "Parar leitura NFC" : "Iniciar leitura NFC"}
        </Text>
      </Pressable>

      <Text style={styles.descricao}>
        {lendo
          ? "Aproxime uma tag de caixa por vez do celular. A leitura continuará até você parar."
          : "Inicie a leitura e aproxime as tags das caixas que deseja transferir."}
      </Text>

      <View style={styles.historicoCabecalho}>
        <Text style={styles.subtitulo}>
          Histórico ({caixasLidas.length})
        </Text>

        <Pressable onPress={limparHistorico}>
          <Text style={styles.limpar}>Limpar</Text>
        </Pressable>
      </View>

      {caixasLidas.length === 0 ? (
        <Text style={styles.vazio}>
          Nenhuma caixa lida nesta sessão.
        </Text>
      ) : (
        caixasLidas.map((caixa, indice) => (
          <View key={`${caixa.id}-${indice}`} style={styles.item}>
            <Text style={styles.idCaixa}>
              Caixa: {caixa.id}
            </Text>

            <Text style={styles.resultado}>
              {caixa.resultado}
            </Text>
          </View>
        ))
      )}

      <Pressable
        style={styles.botaoVoltar}
        onPress={() => {
          if (lendoRef.current || processandoRef.current) {
            Alert.alert(
              "Leitura em andamento",
              "Pare a leitura NFC antes de sair."
            );
            return;
          }

          router.back();
        }}
      >
        <Text style={styles.textoBotao}>Voltar</Text>
      </Pressable>
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
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
  },
  separador: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 12,
  },
  aviso: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 15,
  },
  textoAviso: {
    fontSize: 15,
  },
  botao: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoIniciar: {
    backgroundColor: "#007AFF",
  },
  botaoParar: {
    backgroundColor: "#D62828",
  },
  desabilitado: {
    opacity: 0.5,
  },
  textoBotao: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  descricao: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 15,
    textAlign: "center",
  },
  historicoCabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  limpar: {
    color: "#005BBB",
    fontWeight: "bold",
  },
  vazio: {
    textAlign: "center",
    marginVertical: 20,
  },
  item: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  idCaixa: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  resultado: {
    fontSize: 14,
  },
  botaoVoltar: {
    backgroundColor: "#555",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    marginBottom: 25,
  },
});
