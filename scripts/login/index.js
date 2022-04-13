//Captura as entradas de dados e ações do usuário na página de login
let campoEmailLogin = document.getElementById("inputEmail");
let campoSenhaLogin = document.getElementById("inputPassword");
let botaoAcessarLogin = document.getElementById("botaoAcessar");
let formularioLogin = document.getElementById("formularioLogin");

// Variáveis que serão normalizadas
let campoEmailLoginNormalizado;
let campoSenhaLoginNormalizado;

//Desabilita o botão de salvar ao iniciar a página
botaoAcessarLogin.setAttribute("disabled", true);
botaoAcessarLogin.innerText = "Bloqueado";

let emailValidacoesOk = false;
let senhaValidacoesOk = false;

//API
let loginApiValidacao = true;

const loginUsuario = {
  email: "",
  password: "",
};

//Ao clicar no botão, executa...
botaoAcessarLogin.addEventListener("click", function (evento) {
  
  //Verifica se ambos os campos estão preenchidos, normalizados e validados
  if (validaTelaDeLogin()) {
    evento.preventDefault();

    //NORMALIZAÇÃO
    //Retirando os espaços das informações obtidass
    campoEmailLoginNormalizado = retiraEspacosDeUmValorInformado(
      campoEmailLogin.value
    );
    campoSenhaLoginNormalizado = retiraEspacosDeUmValorInformado(
      campoSenhaLogin.value
    );

    //Converte para minusculo os valores recebidos
    campoEmailLoginNormalizado = converteValorRecebidoParaMinusculo(
      campoEmailLoginNormalizado
    );
    campoSenhaLoginNormalizado = converteValorRecebidoParaMinusculo(
      campoSenhaLoginNormalizado
    );

    //Atribui as informações normalizadas e validadas no Objeto do usuário
    loginUsuario.email = campoEmailLoginNormalizado;
    loginUsuario.password = campoSenhaLoginNormalizado;
    //console.log(loginUsuario);

    let loginUsuarioEmJson = JSON.stringify(loginUsuario);

    let configuracoesRequisicao = {
      method: 'POST',
      body: loginUsuarioEmJson,
      headers: {
        'Content-type': 'application/json',
      },
    }
    //Habilita o spinner antes de fazer a requisição
    mostrarSpinner();

    //Timeout demonstra uma requisição mais demorada
    setTimeout(() => {
      //@@ Utilizando Promisses
      //Chamando a API
      fetch("https://ctd-todo-api.herokuapp.com/v1/users/login", configuracoesRequisicao)
        .then((response) => {
          if (response.status == 201) {
            return response.json()
          }
          // Se o código for diferente de sucesso (201), lança um throw para que a execução caia no Catch() 
          throw response;
        }).then(function (resposta) {
          loginSucesso(resposta.jwt)
        })
        .catch(error => {
          loginErro(error.status)
        });

    }, 2000);

    //@@ Utilizando Async/Await
    //loginApi(configuracoesRequisicao);

    //@@ Utilizando Async/Await
    /*  async function loginApi(configuracoesRequisicaoRecebidas) {
 
       try {
         let respostaApi = await fetch("https://ctd-todo-api.herokuapp.com/v1/users/login", configuracoesRequisicaoRecebidas);
         let respostaJson = await respostaApi.json();
         console.log(respostaJson);
 
       } catch (error) {
         console.log(error);
       }
 
     } */

    //  Ao obter o sucesso, recebe o json (token) do usuário
    function loginSucesso(jwtRecebido) {
      console.log("Jwt recebido");
      console.log(jwtRecebido);

      //@@@ Após obter o jwt, salva no localStorage ou SessionStorage
      //sessionStorage.setItem("jwt", jwtRecebido);

      //@@ Setando o token usandio Cookies
      document.cookie = `jwt=${jwtRecebido}`;

      //Desabilita o Spinner após sucesso no login
      ocultarSpinner();

      //@@Direciona o usuário para a tela de tarefas após sucesso ao logar
      window.location.href = "tarefas.html"
    }

    function loginErro(statusRecebido) {

      ocultarSpinner();

      let loginValidacao = document.getElementById("loginValidacao");
      elementoSmallErro(loginValidacao);

      //Limpa o campo da senha ao errar o login
      campoSenhaLogin.value = "";

      console.log(statusRecebido);
      if (statusRecebido == 400 || statusRecebido == 404) {
        console.log("Ocorreu algum erro, verifique o e-mail e/ou senha");
        loginValidacao.innerHTML = "Ocorreu algum erro, verifique o e-mail e/ou senha";
        loginApiValidacao = false;

      } else {
        loginApiValidacao = true;
      }
      validaTelaDeLogin();
      /* switch (statusRecebido) {
        case 400:
          console.log("Senha incorreta");
          break;

        case 404:
          console.log("Email incorreto");
          break;
        case 500:
          console.log("Problema com o servidor");
          break;
          
          default:
          console.log("Erro desconhecido, entre em contato com o suporte");
          break;
      } */
    }

  } else {
    evento.preventDefault();
    alert("Ambos campos devem ser preenchidos");
  }
});

function resetaValidacaoLoginErro() {
  loginValidacao.innerHTML = "";
  botaoAcessarLogin.removeAttribute("disabled");
  botaoAcessarLogin.innerText = "Acessar";
  loginApiValidacao = true;
}

campoEmailLogin.addEventListener("blur", function () {
  let inputEmailValidacao = document.getElementById("inputEmailValidacao");
  campoEmailLogin.style.border = `1px solid #E42323BF`;

  elementoSmallErro(inputEmailValidacao);

  let emailEValido = validaEmailRecebido(campoEmailLogin.value);

  //Se o e-mail não for válido e o campo não for vazio, depois essa mais complexa
  if (!emailEValido && campoEmailLogin.value != "") {
    inputEmailValidacao.innerText = "E-mail inválido";
    emailValidacoesOk = false;

    //Se o email não for válido e o campo for vazio
  } else if (!emailEValido && campoEmailLogin.value == "") {
    inputEmailValidacao.innerText = "Campo obrigatorio";
    emailValidacoesOk = false;

    //Senão.. ambos são válidos
  } else {
    inputEmailValidacao.innerText = "";
    campoEmailLogin.style.border = ``;
    emailValidacoesOk = true;
  }

  validaTelaDeLogin();
});

campoSenhaLogin.addEventListener("blur", function () {
  let inputPasswordValidacao = document.getElementById(
    "inputPasswordValidacao"
  );
  campoSenhaLogin.style.border = `1px solid #E42323BF`;
  elementoSmallErro(inputPasswordValidacao);

  if (campoSenhaLogin.value == "") {
    inputPasswordValidacao.innerText = "Campo obrigatorio";
    senhaValidacoesOk = false;
  } else {
    inputPasswordValidacao.innerText = "";
    campoSenhaLogin.style.border = ``;
    senhaValidacoesOk = true;
  }
  resetaValidacaoLoginErro();
  validaTelaDeLogin();
});

function validaTelaDeLogin() {
  //Se ambos algum dos campos não forem válido
  if (!emailValidacoesOk || !senhaValidacoesOk || !loginApiValidacao) {
    botaoAcessarLogin.setAttribute("disabled", true);
    botaoAcessarLogin.innerText = "Bloqueado";
    return false;
    //Se ambos forem válidos
  } else {
    botaoAcessarLogin.removeAttribute("disabled");
    botaoAcessarLogin.innerText = "Acessar";
    return true;
  }
}