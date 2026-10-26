// import { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   StyleSheet,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import {supabase} from "./supabaseClient";


// // ======================================================
// // NOMINATIM
// // ======================================================
// async function obterCoordenadas(endereco: string) {
//   const url = new URL("https://nominatim.openstreetmap.org/search");
//   url.searchParams.set("q", endereco);
//   url.searchParams.set("format", "jsonv2");
//   url.searchParams.set("limit", "1");

//   const resposta = await fetch(url, {
//     headers: {
//       "User-Agent": "PTrack/1.0 (seu-email@exemplo.com)",
//     },
//   });

//   if (!resposta.ok) {
//     throw new Error(
//       `Erro no Nominatim: ${resposta.status} ${resposta.statusText}`
//     );
//   }

//   const resultados = await resposta.json();

//   if (resultados.length === 0) {
//     throw new Error(`Não foi possível encontrar o endereço: ${endereco}`);
//   }

//   return {
//     lat: Number(resultados[0].lat),
//     long: Number(resultados[0].lon),
//   };
// }

// // ======================================================
// // ESPERA
// // ======================================================
// function esperar(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// // ======================================================
// // GERA ID DA ROTA
// // ======================================================
// function gerarIdRota() {
//   const numero = Math.floor(Math.random() * 1000000);
//   return `R${numero.toString().padStart(7, "0")}`;
// }

// // ======================================================
// // CRIAÇÃO DA ROTA
// // ======================================================
// async function criarRota(nome_rota: string, enderecos: string[]) {
//   // --------------------------------------------------
//   // 1. Gera o ID da rota
//   // --------------------------------------------------
//   const id_rota = gerarIdRota();

//   // --------------------------------------------------
//   // 2. Cria a rota no Supabase
//   // --------------------------------------------------
//   const { data: rota, error: erroRota } = await supabase
//     .from("rota")
//     .insert({
//       id_rota: id_rota,
//       nome_rota: nome_rota,
//     })
//     .select()
//     .single();

//   if (erroRota) {
//     throw new Error(`Erro ao criar rota: ${erroRota.message}`);
//   }

//   // --------------------------------------------------
//   // 3. Obtém as coordenadas dos endereços
//   // --------------------------------------------------
//   const pontos = [];

//   for (let i = 0; i < enderecos.length; i++) {
//     const endereco = enderecos[i].trim();
//     console.log(`Obtendo coordenadas do ponto ${i + 1}: ${endereco}`);

//     const coordenadas = await obterCoordenadas(endereco);
//     const ordem = i + 1;

//     pontos.push({
//       id_ponto: `${id_rota}-P${ordem}`,
//       id_rota: id_rota,
//       ordem_ponto_na_rota: ordem,
//       endereco: endereco,
//       lat: coordenadas.lat,
//       long: coordenadas.long,
//     });

//     // ------------------------------------------------
//     // Nominatim recomenda limitar as requisições.
//     // ------------------------------------------------
//     if (i < enderecos.length - 1) {
//       await esperar(1000);
//     }
//   }

//   // --------------------------------------------------
//   // 4. Insere os pontos no Supabase
//   // --------------------------------------------------
//   const { data: pontosInseridos, error: erroPontos } = await supabase
//     .from("pontos_rota")
//     .insert(pontos)
//     .select();

//   if (erroPontos) {
//     throw new Error(
//       `Erro ao criar pontos da rota: ${erroPontos.message}`
//     );
//   }

//   // --------------------------------------------------
//   // 5. Retorna os dados criados
//   // --------------------------------------------------
//   return {
//     rota: rota,
//     pontos: pontosInseridos,
//   };
// }

// // ======================================================
// // TELA
// // ======================================================
// export default function CriarRota() {
//   const [nomeRota, setNomeRota] = useState("");
//   const [quantidadePontos, setQuantidadePontos] = useState("");
//   const [enderecos, setEnderecos] = useState<string[]>([]);
//   const [criandoRota, setCriandoRota] = useState(false);

//   // ====================================================
//   // CRIA OS CAMPOS DE ENDEREÇO
//   // ====================================================
//   function definirQuantidadePontos() {
//     const quantidade = Number(quantidadePontos);

//     if (!Number.isInteger(quantidade) || quantidade <= 0) {
//       Alert.alert(
//         "Quantidade inválida",
//         "Informe uma quantidade de pontos maior que zero."
//       );
//       return;
//     }

//     const novosEnderecos = Array.from(
//       { length: quantidade },
//       (_, index) => enderecos[index] ?? ""
//     );

//     setEnderecos(novosEnderecos);
//   }

//   // ====================================================
//   // ALTERA UM ENDEREÇO
//   // ====================================================
//   function alterarEndereco(index: number, endereco: string) {
//     const novosEnderecos = [...enderecos];
//     novosEnderecos[index] = endereco;
//     setEnderecos(novosEnderecos);
//   }

//   // ====================================================
//   // CRIA A ROTA
//   // ====================================================
//   async function executarCriacaoRota() {
//     // -----------------------------------------------
//     // Validação do nome
//     // -----------------------------------------------
//     if (!nomeRota.trim()) {
//       Alert.alert("Erro", "Digite o nome da rota.");
//       return;
//     }

//     // -----------------------------------------------
//     // Validação da quantidade
//     // -----------------------------------------------
//     if (enderecos.length === 0) {
//       Alert.alert("Erro", "Informe a quantidade de pontos da rota.");
//       return;
//     }

//     // -----------------------------------------------
//     // Verifica endereços vazios
//     // -----------------------------------------------
//     const existeEnderecoVazio = enderecos.some(
//       (endereco) => !endereco.trim()
//     );

//     if (existeEnderecoVazio) {
//       Alert.alert("Erro", "Preencha todos os endereços.");
//       return;
//     }

//     setCriandoRota(true);

//     try {
//       console.log("Iniciando criação da rota...");

//       const resultado = await criarRota(nomeRota.trim(), enderecos);

//       console.log("Rota criada:", resultado.rota);
//       console.log("Pontos criados:", resultado.pontos);

//       Alert.alert(
//         "Sucesso",
//         `Rota ${resultado.rota.id_rota} criada com sucesso!\n\n${resultado.pontos.length} pontos foram cadastrados.`
//       );

//       // Limpa o formulário
//       setNomeRota("");
//       setQuantidadePontos("");
//       setEnderecos([]);
//     } catch (erro: any) {
//       console.error("Erro ao criar rota:", erro);
//       Alert.alert(
//         "Erro ao criar rota",
//         erro.message ?? "Ocorreu um erro inesperado."
//       );
//     } finally {
//       setCriandoRota(false);
//     }
//   }

//   // ====================================================
//   // INTERFACE
//   // ====================================================
//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.titulo}>Criar nova rota</Text>

//       {/* ==============================================
//           NOME DA ROTA
//       ============================================== */}
//       <Text style={styles.label}>Nome da rota</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Ex.: Rota Recife - Hemobrás"
//         value={nomeRota}
//         onChangeText={setNomeRota}
//         editable={!criandoRota}
//       />

//       {/* ==============================================
//           QUANTIDADE DE PONTOS
//       ============================================== */}
//       <Text style={styles.label}>Quantidade de pontos</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Ex.: 4"
//         keyboardType="numeric"
//         value={quantidadePontos}
//         onChangeText={setQuantidadePontos}
//         editable={!criandoRota}
//       />

//       <Button
//         title="Definir pontos"
//         onPress={definirQuantidadePontos}
//         disabled={criandoRota}
//       />

//       {/* ==============================================
//           ENDEREÇOS
//       ============================================== */}
//       {enderecos.length > 0 && (
//         <View style={styles.pontosContainer}>
//           <Text style={styles.subtitulo}>Pontos da rota</Text>

//           {enderecos.map((endereco, index) => (
//             <View key={index} style={styles.ponto}>
//               <Text style={styles.label}>Ponto {index + 1}</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder={`Endereço do ponto ${index + 1}`}
//                 value={endereco}
//                 onChangeText={(texto) => alterarEndereco(index, texto)}
//                 editable={!criandoRota}
//                 multiline
//               />
//             </View>
//           ))}
//         </View>
//       )}

//       {/* ==============================================
//           BOTÃO CRIAR ROTA
//       ============================================== */}
//       {enderecos.length > 0 && (
//         <View style={styles.botaoCriar}>
//           {criandoRota ? (
//             <View style={styles.carregando}>
//               <ActivityIndicator size="large" />
//               <Text style={styles.textoCarregando}>Criando rota...</Text>
//               <Text style={styles.textoAviso}>
//                 Os endereços estão sendo convertidos em coordenadas.
//               </Text>
//             </View>
//           ) : (
//             <Button title="Criar rota" onPress={executarCriacaoRota} />
//           )}
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// // ======================================================
// // ESTILOS
// // ======================================================
// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 20,
//     backgroundColor: "#f7c23e",
//   },
//   titulo: {
//     fontSize: 26,
//     fontWeight: "bold",
//     marginBottom: 25,
//     textAlign: "center",
//   },
//   subtitulo: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginTop: 25,
//     marginBottom: 15,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 6,
//   },
//   input: {
//     width: "100%",
//     minHeight: 45,
//     backgroundColor: "#ffffff",
//     borderRadius: 6,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     marginBottom: 15,
//   },
//   pontosContainer: {
//     marginTop: 10,
//   },
//   ponto: {
//     marginBottom: 5,
//   },
//   botaoCriar: {
//     marginTop: 25,
//     marginBottom: 40,
//   },
//   carregando: {
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#ffffff",
//     borderRadius: 8,
//   },
//   textoCarregando: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginTop: 10,
//   },
//   textoAviso: {
//     textAlign: "center",
//     marginTop: 8,
//   },
// });



import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from "react-native";

import { supabase } from "./supabaseClient";

type SugestaoEndereco = {
  endereco: string;
  lat: number;
  long: number;
};

export default function CriarRota() {
  const [nomeRota, setNomeRota] = useState("");
  const [quantidadePontos, setQuantidadePontos] = useState("2");

  const [enderecos, setEnderecos] = useState<string[]>([
    "",
    "",
  ]);

  const [coordenadas, setCoordenadas] = useState<
    Record<number, SugestaoEndereco>
  >({});

  const [indiceBusca, setIndiceBusca] = useState<number | null>(
    null
  );

  const [sugestoes, setSugestoes] = useState<
    SugestaoEndereco[]
  >([]);

  const [buscando, setBuscando] = useState(false);
  const [criandoRota, setCriandoRota] = useState(false);
  const [erroBusca, setErroBusca] = useState("");

  // Mantém a quantidade de campos sincronizada.
  function alterarQuantidade(valor: string) {
    const apenasNumeros = valor.replace(/\D/g, "");

    setQuantidadePontos(apenasNumeros);

    if (!apenasNumeros) {
      return;
    }

    const quantidade = Number(apenasNumeros);

    if (quantidade < 1 || quantidade > 10) {
      return;
    }

    setEnderecos((anteriores) => {
      return Array.from(
        { length: quantidade },
        (_, i) => anteriores[i] ?? ""
      );
    });

    setCoordenadas((anteriores) => {
      const novas: Record<number, SugestaoEndereco> = {};

      for (let i = 0; i < quantidade; i++) {
        if (anteriores[i]) {
          novas[i] = anteriores[i];
        }
      }

      return novas;
    });

    setIndiceBusca(null);
    setSugestoes([]);
    setErroBusca("");
  }

  // Consulta o autocomplete do LocationIQ.
  useEffect(() => {
    if (indiceBusca === null) {
      return;
    }

    const indice = indiceBusca;
    const texto = enderecos[indice]?.trim() ?? "";

    setSugestoes([]);
    setErroBusca("");

    if (texto.length < 3) {
      setBuscando(false);
      return;
    }

    let cancelado = false;

    const temporizador = setTimeout(async () => {
      setBuscando(true);

      try {
        const chave =
          process.env.EXPO_PUBLIC_LOCATIONIQ_KEY;

        if (!chave) {
          throw new Error(
            "A chave do LocationIQ não foi configurada."
          );
        }

        const url = new URL(
          "https://api.locationiq.com/v1/autocomplete"
        );

        url.searchParams.set("key", chave);
        url.searchParams.set("q", texto);
        url.searchParams.set("limit", "5");
        url.searchParams.set("countrycodes", "br");
        url.searchParams.set("accept-language", "pt-BR");

        const resposta = await fetch(url.toString());

        if (!resposta.ok) {
          throw new Error(
            `Erro HTTP ${resposta.status} ao buscar endereços.`
          );
        }

        const dados = await resposta.json();

        const resultados: SugestaoEndereco[] = dados
          .filter(
            (item: any) =>
              item.display_name &&
              item.lat != null &&
              item.lon != null
          )
          .map((item: any) => ({
            endereco: item.display_name,
            lat: Number(item.lat),
            long: Number(item.lon),
          }))
          .filter(
            (item: SugestaoEndereco) =>
              Number.isFinite(item.lat) &&
              Number.isFinite(item.long)
          );

        if (!cancelado) {
          setSugestoes(resultados);

          if (resultados.length === 0) {
            setErroBusca(
              "Nenhum endereço encontrado. Tente informar a rua, o número e a cidade."
            );
          }
        }
      } catch (erro) {
        if (!cancelado) {
          console.error("Erro no LocationIQ:", erro);

          setErroBusca(
            erro instanceof Error
              ? erro.message
              : "Não foi possível buscar os endereços."
          );
        }
      } finally {
        if (!cancelado) {
          setBuscando(false);
        }
      }
    }, 500);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [enderecos, indiceBusca]);

  // Atualiza o endereço digitado e invalida a coordenada antiga.
  function alterarEndereco(indice: number, texto: string) {
    setEnderecos((anteriores) =>
      anteriores.map((endereco, i) =>
        i === indice ? texto : endereco
      )
    );

    setCoordenadas((anteriores) => {
      const novas = { ...anteriores };
      delete novas[indice];
      return novas;
    });

    setIndiceBusca(indice);
  }

  // Guarda o endereço e as coordenadas da sugestão selecionada.
  function selecionarEndereco(
    indice: number,
    sugestao: SugestaoEndereco
  ) {
    setEnderecos((anteriores) =>
      anteriores.map((endereco, i) =>
        i === indice ? sugestao.endereco : endereco
      )
    );

    setCoordenadas((anteriores) => ({
      ...anteriores,
      [indice]: sugestao,
    }));

    setIndiceBusca(null);
    setSugestoes([]);
    setErroBusca("");
  }

  function gerarIdRota() {
    return `R${Math.floor(
      1000000 + Math.random() * 9000000
    )}`;
  }

  // Salva a rota e seus pontos no Supabase.
  async function criarRota() {
    const quantidade = Number(quantidadePontos);

    if (!nomeRota.trim()) {
      Alert.alert("Atenção", "Informe o nome da rota.");
      return;
    }

    if (
      !Number.isInteger(quantidade) ||
      quantidade < 1 ||
      quantidade > 10
    ) {
      Alert.alert(
        "Atenção",
        "A rota deve possuir entre 1 e 10 pontos."
      );
      return;
    }

    if (enderecos.length !== quantidade) {
      Alert.alert(
        "Atenção",
        "Confira a quantidade de pontos da rota."
      );
      return;
    }

    for (let i = 0; i < quantidade; i++) {
      if (!enderecos[i]?.trim()) {
        Alert.alert(
          "Endereço incompleto",
          `Preencha o endereço do ponto ${i + 1}.`
        );
        return;
      }

      if (!coordenadas[i]) {
        Alert.alert(
          "Selecione um endereço",
          `Escolha uma sugestão do LocationIQ para o ponto ${i + 1}.`
        );
        return;
      }
    }

    setCriandoRota(true);

    let idRota: string | null = null;

    try {
      idRota = gerarIdRota();

      const { error: erroRota } = await supabase
        .from("rota")
        .insert({
          id_rota: idRota,
          nome_rota: nomeRota.trim(),
        });

      if (erroRota) {
        throw erroRota;
      }

      const pontos = enderecos.map((endereco, indice) => ({
        id_ponto: `P${Date.now()}${indice}`,
        id_rota: idRota,
        ordem_ponto_na_rota: indice + 1,
        endereco: endereco.trim(),
        lat: coordenadas[indice].lat,
        long: coordenadas[indice].long,
      }));

      const { error: erroPontos } = await supabase
        .from("pontos_rota")
        .insert(pontos);

      if (erroPontos) {
        // Evita deixar uma rota sem os seus pontos.
        const { error: erroExclusao } = await supabase
          .from("rota")
          .delete()
          .eq("id_rota", idRota);

        if (erroExclusao) {
          console.error(
            "Não foi possível excluir a rota incompleta:",
            erroExclusao
          );
        }

        throw erroPontos;
      }

      Alert.alert(
        "Sucesso",
        `Rota "${nomeRota}" criada com ${quantidade} ponto(s).`,
        [
          {
            text: "OK",
            onPress: () => {
              setNomeRota("");
              setQuantidadePontos("2");
              setEnderecos(["", ""]);
              setCoordenadas({});
              setIndiceBusca(null);
              setSugestoes([]);
              setErroBusca("");
            },
          },
        ]
      );
    } catch (erro) {
      console.error("Erro ao criar rota:", erro);

      Alert.alert(
        "Erro",
        "Não foi possível criar a rota. Verifique a conexão e as permissões do Supabase."
      );
    } finally {
      setCriandoRota(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilos.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={estilos.titulo}>Criar rota</Text>

        <Text style={estilos.descricao}>
          Informe os dados da rota e selecione os endereços
          sugeridos.
        </Text>

        <Text style={estilos.label}>Nome da rota</Text>

        <TextInput
          style={estilos.input}
          placeholder="Ex.: Rota Recife Centro"
          placeholderTextColor="#888"
          value={nomeRota}
          onChangeText={setNomeRota}
        />

        <Text style={estilos.label}>
          Quantidade de pontos (1 a 10)
        </Text>

        <TextInput
          style={estilos.input}
          placeholder="Quantidade de pontos"
          placeholderTextColor="#888"
          keyboardType="number-pad"
          value={quantidadePontos}
          onChangeText={alterarQuantidade}
        />

        {enderecos.map((endereco, indice) => (
          <View key={indice} style={estilos.blocoPonto}>
            <Text style={estilos.label}>
              Ponto {indice + 1}
            </Text>

            <TextInput
              style={estilos.input}
              placeholder="Digite rua, número e cidade"
              placeholderTextColor="#888"
              value={endereco}
              onChangeText={(texto) =>
                alterarEndereco(indice, texto)
              }
              onFocus={() => setIndiceBusca(indice)}
            />

            {coordenadas[indice] && (
              <View style={estilos.confirmacao}>
                <Text style={estilos.textoConfirmacao}>
                  Endereço selecionado
                </Text>

                <Text style={estilos.coordenadas}>
                  Lat: {coordenadas[indice].lat.toFixed(6)}
                  {"\n"}
                  Long: {coordenadas[indice].long.toFixed(6)}
                </Text>
              </View>
            )}

            {indiceBusca === indice && buscando && (
              <View style={estilos.statusBusca}>
                <ActivityIndicator color="#E63A4A" />
                <Text style={estilos.textoAuxiliar}>
                  Buscando endereços...
                </Text>
              </View>
            )}

            {indiceBusca === indice &&
              !buscando &&
              erroBusca !== "" && (
                <Text style={estilos.erro}>
                  {erroBusca}
                </Text>
              )}

            {indiceBusca === indice &&
              sugestoes.length > 0 && (
                <View style={estilos.listaSugestoes}>
                  {sugestoes.map((sugestao, i) => (
                    <Pressable
                      key={`${sugestao.lat}-${sugestao.long}-${i}`}
                      style={estilos.itemSugestao}
                      onPress={() =>
                        selecionarEndereco(indice, sugestao)
                      }
                    >
                      <Text style={estilos.textoSugestao}>
                        {sugestao.endereco}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
          </View>
        ))}

        <Pressable
          style={[
            estilos.botao,
            criandoRota && estilos.botaoDesabilitado,
          ]}
          onPress={criarRota}
          disabled={criandoRota}
        >
          {criandoRota ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={estilos.textoBotao}>
              Criar rota
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7c23e",
  },
  conteudo: {
    padding: 20,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 8,
  },
  descricao: {
    color: "#555",
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 22,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#222",
    marginBottom: 16,
  },
  blocoPonto: {
    marginTop: 8,
  },
  confirmacao: {
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    padding: 12,
    marginTop: -8,
    marginBottom: 16,
  },
  textoConfirmacao: {
    color: "#216E39",
    fontWeight: "600",
    marginBottom: 4,
  },
  coordenadas: {
    color: "#356344",
    fontSize: 12,
    lineHeight: 18,
  },
  statusBusca: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: -6,
    marginBottom: 16,
  },
  textoAuxiliar: {
    color: "#666",
    fontSize: 13,
  },
  erro: {
    color: "#B42318",
    fontSize: 13,
    marginTop: -6,
    marginBottom: 16,
  },
  listaSugestoes: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    marginTop: -8,
    marginBottom: 16,
    overflow: "hidden",
  },
  itemSugestao: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  textoSugestao: {
    color: "#333",
    fontSize: 14,
    lineHeight: 20,
  },
  botao: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    minHeight: 52,
  },
  botaoDesabilitado: {
    opacity: 0.65,
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
