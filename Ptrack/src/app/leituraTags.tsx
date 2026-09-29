import { useEffect, useState } from "react";

import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

import NfcManager, {
  NfcTech,
  Ndef,
} from "react-native-nfc-manager";

import { createClient } from "@supabase/supabase-js";

import { useLocalSearchParams } from "expo-router";


const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);


type QuantidadesEsperadas = {
  qtd_pic: number;
  qtd_pfc: number;
  qtd_pc: number;
};


type DadosTag = {
  tag: string;
  tipo: string;
};


export default function LerTags() {

  const { idDocumento } = useLocalSearchParams<{
    idDocumento: string;
  }>();


  // Quantidades que estão no documento
  const [esperado, setEsperado] =
    useState<QuantidadesEsperadas>({
      qtd_pic: 0,
      qtd_pfc: 0,
      qtd_pc: 0,
    });


  // Quantidades encontradas durante a leitura
  const [lidoPIC, setLidoPIC] = useState(0);
  const [lidoPFC, setLidoPFC] = useState(0);
  const [lidoPC, setLidoPC] = useState(0);


  // Identificadores das tags já lidas
  const [tagsLidas, setTagsLidas] = useState<string[]>([]);


  const [lendo, setLendo] = useState(false);


  /*
   * Ao abrir a tela:
   *
   * 1. Busca as quantidades do documento
   * 2. Inicializa o NFC
   */
  useEffect(() => {

    buscarDocumento();

    NfcManager.start();

    return () => {
      NfcManager.cancelTechnologyRequest()
        .catch(() => {});
    };

  }, []);


  /*
   * Busca as quantidades esperadas
   * no documento de remessa.
   */
  async function buscarDocumento() {

    if (!idDocumento) {

      Alert.alert(
        "Erro",
        "Documento de remessa não informado."
      );

      return;
    }


    const { data, error } = await supabase
      .from("documento_remessa")
      .select(
        "qtd_pic, qtd_pfc, qtd_pc"
      )
      .eq(
        "id_documento",
        Number(idDocumento)
      )
      .single();


    if (error) {

      console.error(
        "Erro ao buscar documento:",
        error
      );

      Alert.alert(
        "Erro",
        "Não foi possível carregar o documento."
      );

      return;
    }


    setEsperado({

      qtd_pic: data.qtd_pic ?? 0,

      qtd_pfc: data.qtd_pfc ?? 0,

      qtd_pc: data.qtd_pc ?? 0,

    });

  }



  function obterDadosTag(
    tagNfc: any
  ): DadosTag | null {

    try {

      if (
        !tagNfc.ndefMessage ||
        tagNfc.ndefMessage.length === 0
      ) {

        return null;

      }


      const record =
        tagNfc.ndefMessage[0];


      const texto =
        Ndef.text.decodePayload(
          new Uint8Array(
            record.payload
          )
        );


      const dados =
        JSON.parse(texto);


      if (
        !dados.tag ||
        !dados.tipo
      ) {

        return null;

      }


      const tipo =
        String(dados.tipo)
          .trim()
          .toUpperCase();


      /*
       * Aceita somente os tipos
       * existentes no sistema.
       */
      if (
        tipo !== "PIC" &&
        tipo !== "PFC" &&
        tipo !== "PC"
      ) {

        return null;

      }


      return {

        tag: String(dados.tag),

        tipo: tipo,

      };

    } catch (error) {

      console.error(
        "Erro ao interpretar tag:",
        error
      );

      return null;

    }

  }


  /*
   * Realiza uma leitura NFC.
   */
  async function lerTag() {

    if (lendo) {
      return;
    }


    try {

      setLendo(true);


      /*
       * Solicita uma tag NFC
       * compatível com NDEF.
       */
      await NfcManager.requestTechnology(
        NfcTech.Ndef
      );


      /*
       * Obtém a tag aproximada
       * do celular.
       */
      const tagNfc =
        await NfcManager.getTag();


      if (!tagNfc) {

        Alert.alert(
          "Erro",
          "Não foi possível ler a tag."
        );

        return;

      }


      /*
       * Extrai o JSON da tag.
       */
      const dados =
        obterDadosTag(tagNfc);


      if (!dados) {

        Alert.alert(
          "Tag inválida",
          "Não foi possível identificar o identificador e o tipo da tag."
        );

        return;

      }


      /*
       * Verifica se essa tag
       * já foi lida anteriormente.
       */
      if (
        tagsLidas.includes(
          dados.tag
        )
      ) {

        Alert.alert(
          "Tag já lida",
          `A tag ${dados.tag} já foi contabilizada.`
        );

        return;

      }


      /*
       * Adiciona a tag à lista
       * de tags já processadas.
       */
      setTagsLidas(
        (lista) => [
          ...lista,
          dados.tag,
        ]
      );


      /*
       * Incrementa o contador
       * correspondente ao tipo.
       */
      if (dados.tipo === "PIC") {

        setLidoPIC(
          (valor) => valor + 1
        );

      }


      if (dados.tipo === "PFC") {

        setLidoPFC(
          (valor) => valor + 1
        );

      }


      if (dados.tipo === "PC") {

        setLidoPC(
          (valor) => valor + 1
        );

      }


      Alert.alert(
        "Tag lida",
        `Identificador: ${dados.tag}\nTipo: ${dados.tipo}`
      );


    } catch (error) {

      console.error(
        "Erro ao ler NFC:",
        error
      );


    } finally {

      setLendo(false);


      /*
       * Libera a comunicação NFC
       * para a próxima leitura.
       */
      await NfcManager
        .cancelTechnologyRequest()
        .catch(() => {});

    }

  }


  /*
   * Compara as quantidades
   * esperadas com as lidas.
   */
  function finalizarLeitura() {

    const diferencaPIC =
      lidoPIC !== esperado.qtd_pic;

    const diferencaPFC =
      lidoPFC !== esperado.qtd_pfc;

    const diferencaPC =
      lidoPC !== esperado.qtd_pc;


    if (
      diferencaPIC ||
      diferencaPFC ||
      diferencaPC
    ) {

      Alert.alert(
        "Diferença encontrada",

        `Documento: ${idDocumento}

Quantidade esperada:

PIC: ${esperado.qtd_pic}
PFC: ${esperado.qtd_pfc}
PC: ${esperado.qtd_pc}

Quantidade lida:

PIC: ${lidoPIC}
PFC: ${lidoPFC}
PC: ${lidoPC}`
      );

      return;

    }


    /*
     * Caso todas as quantidades
     * estejam corretas.
     */
    Alert.alert(
      "Leitura concluída",

      "Todas as tags esperadas foram lidas corretamente."
    );

  }


  return (

    <ScrollView
      contentContainerStyle={
        styles.container
      }
    >

      <Text style={styles.titulo}>
        Leitura de Tags NFC
      </Text>


      <Text style={styles.documento}>
        Documento: {idDocumento}
      </Text>


      {/* ========================= */}
      {/* QUANTIDADES ESPERADAS */}
      {/* ========================= */}

      <View style={styles.bloco}>

        <Text style={styles.subtitulo}>
          Quantidade esperada
        </Text>


        <Text style={styles.linha}>
          PIC: {esperado.qtd_pic}
        </Text>


        <Text style={styles.linha}>
          PFC: {esperado.qtd_pfc}
        </Text>


        <Text style={styles.linha}>
          PC: {esperado.qtd_pc}
        </Text>

      </View>


      {/* ========================= */}
      {/* QUANTIDADES LIDAS */}
      {/* ========================= */}

      <View style={styles.bloco}>

        <Text style={styles.subtitulo}>
          Tags lidas
        </Text>


        <Text style={styles.linha}>
          PIC: {lidoPIC}
        </Text>


        <Text style={styles.linha}>
          PFC: {lidoPFC}
        </Text>


        <Text style={styles.linha}>
          PC: {lidoPC}
        </Text>


        <Text style={styles.total}>
          Total: {tagsLidas.length}
        </Text>

      </View>


      {/* ========================= */}
      {/* BOTÃO DE LEITURA */}
      {/* ========================= */}

      <View style={styles.botao}>

        <Button
          title={
            lendo
              ? "Aproxime a tag..."
              : "Ler próxima tag"
          }
          onPress={lerTag}
          disabled={lendo}
        />

      </View>


      {/* ========================= */}
      {/* FINALIZAR */}
      {/* ========================= */}

      <View style={styles.botao}>

        <Button
          title="Finalizar leitura"
          onPress={finalizarLeitura}
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

    fontSize: 26,

    fontWeight: "bold",

    textAlign: "center",

    marginBottom: 25,

  },


  documento: {

    fontSize: 18,

    fontWeight: "bold",

    marginBottom: 20,

  },


  bloco: {

    backgroundColor: "#ffffff",

    padding: 20,

    borderRadius: 8,

    marginBottom: 20,

  },


  subtitulo: {

    fontSize: 18,

    fontWeight: "bold",

    marginBottom: 10,

  },


  linha: {

    fontSize: 17,

    marginBottom: 5,

  },


  total: {

    marginTop: 10,

    fontSize: 17,

    fontWeight: "bold",

  },


  botao: {

    marginBottom: 15,

  },

});