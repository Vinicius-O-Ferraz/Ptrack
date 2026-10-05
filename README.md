# Ptrack - O uso de tecnologias contactless para aumentar a rastreabilidade do plasma sanguíneo

<p align="center">
  <img 
    width="300" 
    height="300" 
    alt="image" 
    src="https://github.com/user-attachments/assets/955cec66-c446-4208-bc55-056fa5867ed0"
  />
</p>

## Sobre o projeto

O Ptrack é um aplicativo elaborado durando o Trabalho de Conclusão de Curso(TCC) na modalidade Empresa do autor. Este app visa usar tecnologias contactless e computação na nuvem para aumentar a rastreabilidade do plasma sanguíneo recebido na Hemobrás dos maiores bancos de sangue do Brasil.

## Tecnologias utilizadas
<p align="center">
  <img src="https://nfc.cards/1153-large_default/nfc-tag-ntag215.jpg" width="100" height="100" alt="NTAG 215">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/supabase/supabase/master/packages/common/assets/images/supabase-logo-icon.svg" width="100" height="100" alt="Supabase">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img width="100" height="100" alt="react-native-seeklogo" src="https://github.com/user-attachments/assets/cec0b477-740a-48f3-8053-7bf8194208be" />
</p>

<p align="center">
  <b>NTAG 215</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <b>Supabase</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <b>React Native</b>
</p>

## Releases

### V1 
Na primeira release, já é possível cadastrar o usuário e fazer login usando a API do Supabase e estão feitas todas as funções básicas do motorista. 

Está modelado o CRUD de rotas que usa a API do nominatim para traduzir endereços em coordenadas geográficas. Também é possível criar o documento de remessa com os números das caixas de cada tipo associadas a placa de veículo de transporte e motorista. Por fim, é possível usar o react-native-nfc-manager para ler as tags e comparar com as quantidades de notas de remessa para verificar se houveram divergências.

Abaixo segue uma demosntração da V1.


#### Demonstração do cadastro/login
<table>
  <tr>
    <td align="center">
      <video src="https://github.com/user-attachments/assets/4983e716-cc03-4a43-b7e1-4da94e84c993" width="500" controls></video>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/fafaf326-de4e-446d-811d-c76dec574c5b" width="500" alt="Imagem">
    </td>
  </tr>
</table>

#### Demonstração de CRUD de criar/alterar rotas


<table>
  <tr>
    <td align="center">
      <video src="https://github.com/user-attachments/assets/c354d7e4-2a93-4384-a01a-118003d4e5d6
" width="500" controls></video>
    </td>
    <td align="center">
      <video src="https://github.com/user-attachments/assets/2de96d9b-76cd-4e96-8d11-cae56493b44a
" width="500" controls></video>
  </tr>
</table>

#### Criando documento de remessa/ Lendo tags NFC e conferindo divergências

<table>
  <tr>
    <td align="center">
      <video src="https://github.com/user-attachments/assets/fa396f9c-88f5-4713-869d-b92df4f74ba2
" width="500" controls></video>
    </td>
    <td align="center">
      <video src="https://github.com/user-attachments/assets/99b177fa-4928-4dc2-8b54-0dc18f56a35f
" width="500" controls></video>
  </tr>
</table>




