import { useEffect, useRef, useState } from "react";

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

import { useLocalSearchParams } from "expo-router";
import { supabase } from "./supabaseClient";


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


  // ==========================================
  // QUANTIDADES ESPERADAS
  // ==========================================

  const [esperado, setEsperado] =
    useState<QuantidadesEsperadas>({
      qtd_pic: 0,
      qtd_pfc: 0,
      qtd_pc: 0,
    });


  // ==========================================
  // QUANTIDADES LIDAS
  // ==========================================

  const [lidoPIC, setLidoPIC] = useState(0);
  const [lidoPFC, setLidoPFC] = useState(0);
  const [lidoPC, setLidoPC] = useState(0);


  // ==========================================
  // TAGS JÁ LIDAS
  // ==========================================

  const [tagsLidas, setTagsLidas] =
    useState<string[]>([]);


  // ==========================================
  // ESTADO DA LEITURA
  // ==========================================

  const [lendo, setLendo] = useState(false);


  /*
   * useRef é utilizado para que o loop de leitura
   * consiga saber imediatamente se o usuário
   * apertou o botão novamente.
   */
  const lendoRef = useRef(false);


  /*
   * Também mantemos os dados em refs.
   *
   * Isso garante que, no momento de finalizar,
   * teremos os valores mais recentes mesmo que
   * uma atualização de estado ainda esteja sendo
   * processada pelo React.
   */
  const tagsLidasRef = useRef<string[]>([]);

  const lidoPICRef = useRef(0);
  const lidoPFCRef = useRef(0);
  const lidoPCRef = useRef(0);


  // ==========================================
  // INICIALIZAÇÃO
  // ==========================================

  useEffect(() => {

    buscarDocumento();

    NfcManager.start();

    return () => {

      lendoRef.current = false;

      NfcManager.cancelTechnologyRequest()
        .catch(() => {});

    };

  }, []);


  // ==========================================
  // BUSCAR DOCUMENTO
  // ==========================================

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


  // ==========================================
  // INTERPRETAR TAG NFC
  // ==========================================

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
       * Aceita somente:
       *
       * PIC
       * PFC
       * PC
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


  // ==========================================
  // PROCESSAR UMA TAG
  // ==========================================

  function processarTag(
    dados: DadosTag
  ) {

    /*
     * Verifica se a tag já foi lida.
     */

    if (
      tagsLidasRef.current.includes(
        dados.tag
      )
    ) {

      console.log(
        `Tag ${dados.tag} já foi lida.`
      );

      return;

    }


    /*
     * Adiciona o identificador
     * à lista de tags lidas.
     */

    tagsLidasRef.current.push(
      dados.tag
    );


    setTagsLidas(
      [...tagsLidasRef.current]
    );


    /*
     * Incrementa o contador
     * de acordo com o tipo.
     */

    if (dados.tipo === "PIC") {

      lidoPICRef.current += 1;

      setLidoPIC(
        lidoPICRef.current
      );

    }


    if (dados.tipo === "PFC") {

      lidoPFCRef.current += 1;

      setLidoPFC(
        lidoPFCRef.current
      );

    }


    if (dados.tipo === "PC") {

      lidoPCRef.current += 1;

      setLidoPC(
        lidoPCRef.current
      );

    }


    console.log(
      "Tag lida:",
      dados.tag,
      dados.tipo
    );

  }


  // ==========================================
  // LOOP DE LEITURA NFC
  // ==========================================

  async function iniciarLeituraContinua() {

    /*
     * Enquanto o usuário não apertar
     * novamente o botão, o loop continua.
     */

    while (lendoRef.current) {

      try {

        /*
         * Solicita uma tag NFC.
         */

        await NfcManager.requestTechnology(
          NfcTech.Ndef
        );


        /*
         * Verifica se o usuário apertou
         * o botão enquanto o NFC estava
         * esperando uma tag.
         */

        if (!lendoRef.current) {

          await NfcManager
            .cancelTechnologyRequest()
            .catch(() => {});

          break;

        }


        /*
         * Obtém a tag.
         */

        const tagNfc =
          await NfcManager.getTag();


        if (!tagNfc) {

          continue;

        }


        /*
         * Interpreta o conteúdo da tag.
         */

        const dados =
          obterDadosTag(tagNfc);


        if (!dados) {

          console.log(
            "Tag inválida."
          );

        } else {

          /*
           * Processa a tag.
           *
           * Se já tiver sido lida,
           * ela será ignorada.
           */

          processarTag(dados);

        }

      } catch (error) {

        /*
         * Quando o usuário aperta o botão
         * novamente, cancelTechnologyRequest()
         * provoca uma interrupção do request.
         *
         * Nesse caso não precisamos mostrar
         * erro para o usuário.
         */

        if (lendoRef.current) {

          console.error(
            "Erro durante leitura NFC:",
            error
          );

        }

      } finally {

        /*
         * Libera a tecnologia NFC depois
         * de cada leitura.
         */

        await NfcManager
          .cancelTechnologyRequest()
          .catch(() => {});

      }

    }

  }


  // ==========================================
  // BOTÃO LER / PARAR
  // ==========================================

  function alternarLeitura() {

    /*
     * ----------------------------------------
     * SEGUNDO TOQUE
     * ----------------------------------------
     *
     * Se já estiver lendo, o segundo toque
     * encerra a leitura.
     */

    if (lendoRef.current) {

      /*
       * Primeiro sinalizamos para o loop
       * que ele deve parar.
       */

      lendoRef.current = false;

      setLendo(false);


      /*
       * Cancela uma eventual espera por
       * uma nova tag NFC.
       */

      NfcManager
        .cancelTechnologyRequest()
        .catch(() => {});


      /*
       * Depois de parar, verifica a
       * transação.
       */

      finalizarLeitura();

      return;

    }


    /*
     * ----------------------------------------
     * PRIMEIRO TOQUE
     * ----------------------------------------
     *
     * Começa uma nova leitura.
     */


    /*
     * IMPORTANTE:
     *
     * Ao iniciar uma nova leitura,
     * esquecemos completamente as tags
     * da leitura anterior.
     */

    tagsLidasRef.current = [];

    lidoPICRef.current = 0;
    lidoPFCRef.current = 0;
    lidoPCRef.current = 0;


    setTagsLidas([]);

    setLidoPIC(0);
    setLidoPFC(0);
    setLidoPC(0);


    /*
     * Ativa o modo de leitura.
     */

    lendoRef.current = true;

    setLendo(true);


    /*
     * Inicia o loop de leitura.
     */

    iniciarLeituraContinua();

  }


  // ==========================================
  // FINALIZAR LEITURA
  // ==========================================

  function finalizarLeitura() {

    const quantidadePIC =
      lidoPICRef.current;

    const quantidadePFC =
      lidoPFCRef.current;

    const quantidadePC =
      lidoPCRef.current;


    const diferencaPIC =
      quantidadePIC -
      esperado.qtd_pic;


    const diferencaPFC =
      quantidadePFC -
      esperado.qtd_pfc;


    const diferencaPC =
      quantidadePC -
      esperado.qtd_pc;


    /*
     * Verifica se existe alguma
     * divergência.
     */

    if (
      diferencaPIC !== 0 ||
      diferencaPFC !== 0 ||
      diferencaPC !== 0
    ) {

      let mensagem =
        `Documento: ${idDocumento}\n\n`;


      mensagem +=
        "Divergências encontradas:\n\n";


      /*
       * PIC
       */

      if (diferencaPIC !== 0) {

        if (diferencaPIC > 0) {

          mensagem +=
            `PIC: ${diferencaPIC} tag(s) a mais.\n` +
            `Esperado: ${esperado.qtd_pic}\n` +
            `Lido: ${quantidadePIC}\n\n`;

        } else {

          mensagem +=
            `PIC: ${Math.abs(diferencaPIC)} tag(s) a menos.\n` +
            `Esperado: ${esperado.qtd_pic}\n` +
            `Lido: ${quantidadePIC}\n\n`;

        }

      }


      /*
       * PFC
       */

      if (diferencaPFC !== 0) {

        if (diferencaPFC > 0) {

          mensagem +=
            `PFC: ${diferencaPFC} tag(s) a mais.\n` +
            `Esperado: ${esperado.qtd_pfc}\n` +
            `Lido: ${quantidadePFC}\n\n`;

        } else {

          mensagem +=
            `PFC: ${Math.abs(diferencaPFC)} tag(s) a menos.\n` +
            `Esperado: ${esperado.qtd_pfc}\n` +
            `Lido: ${quantidadePFC}\n\n`;

        }

      }


      /*
       * PC
       */

      if (diferencaPC !== 0) {

        if (diferencaPC > 0) {

          mensagem +=
            `PC: ${diferencaPC} tag(s) a mais.\n` +
            `Esperado: ${esperado.qtd_pc}\n` +
            `Lido: ${quantidadePC}\n\n`;

        } else {

          mensagem +=
            `PC: ${Math.abs(diferencaPC)} tag(s) a menos.\n` +
            `Esperado: ${esperado.qtd_pc}\n` +
            `Lido: ${quantidadePC}\n\n`;

        }

      }


      Alert.alert(
        "Transação com divergência",
        mensagem
      );

      return;

    }


    /*
     * Se chegou aqui, todas as quantidades
     * estão exatamente iguais.
     */

    Alert.alert(
      "Transação bem-sucedida",
      `Documento ${idDocumento}\n\n` +
      "Todas as tags esperadas foram lidas corretamente.\n\n" +
      `PIC: ${quantidadePIC}\n` +
      `PFC: ${quantidadePFC}\n` +
      `PC: ${quantidadePC}\n\n` +
      `Total: ${tagsLidasRef.current.length}`
    );

  }


  // ==========================================
  // INTERFACE
  // ==========================================

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
              ? "Parar leitura"
              : "Ler tags"
          }
          onPress={alternarLeitura}
        />

      </View>


      {/* ========================= */}
      {/* STATUS */}
      {/* ========================= */}

      <View style={styles.status}>

        <Text style={styles.statusTexto}>

          {lendo
            ? "Leitura ativa - aproxime as tags NFC"
            : "Leitura parada"}

        </Text>

      </View>

    </ScrollView>

  );

}


// ==========================================
// ESTILOS
// ==========================================

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


  status: {

    backgroundColor: "#ffffff",

    padding: 15,

    borderRadius: 8,

    marginBottom: 20,

  },


  statusTexto: {

    textAlign: "center",

    fontSize: 16,

    fontWeight: "bold",

  },

});