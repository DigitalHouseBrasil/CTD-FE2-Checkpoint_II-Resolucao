//Variável global no script
let cookieJwt; 

///Executa automaticamente ao iniciar a página
onload = () => {
    cookieJwt = getCookie("jwt");

    //Simula uma validação de rota se o usuário não estiver autenticado e autorizado (ou seja, se são possui um token salvo)
    if (!cookieJwt) {
        alert("Você não tem permissão para usar esta página!\nVoltando para a tela de login...");
        window.location = "index.html"
    } else {
        buscaUsuarioNaApi(cookieJwt);
        buscaAsTarefasDoUsuario(cookieJwt);
    }
}

/// CARREGA E ALTERA DADOS DO USUÁRIO LOGADO
//Usando Async-Await
async function buscaUsuarioNaApi(tokenJwtArmazenado) {

    let configuracaoRequisicao = {
        //method: 'GET', //Pode-se omitir o GET da configuração
        headers: {
            'Authorization': `${tokenJwtArmazenado}`, // é OBRIGATORIO passar essa informação
        },
    };
    let resposta;
    let respostaJson
    try {
        resposta = await fetch(`${apiBaseUrl()}/users/getMe`, configuracaoRequisicao);

        if (resposta.status == 200) {
            respostaJson = await resposta.json();
            alteraDadosUsuarioEmTela(respostaJson);
        } else {
            throw resposta.status
        }
    } catch (error) {
        let escolhaUsuario = confirm("Ocorreu algum erro ao buscar as informações do usuário logado")
        console.log(error);
        if (escolhaUsuario) {
            buscaUsuarioNaApi(cookieJwt);
        }
    }
}

function alteraDadosUsuarioEmTela(objetoUsuarioRecebido) {
    let nomeUsuarioEmTarefas = document.getElementById('nomeUsuarioEmTarefas');
    nomeUsuarioEmTarefas.innerText = `${objetoUsuarioRecebido.firstName} ${objetoUsuarioRecebido.lastName}`;
}

/// BUSCANDO TODAS AS TAREFAS DO USUÁRIO LOGADO
function buscaAsTarefasDoUsuario(tokenJwtArmazenado) {
    let configuracaoRequisicao = {
        headers: {
            'Authorization': `${tokenJwtArmazenado}`, // é OBRIGATORIO passar essa informação
        },
    };
    fetch(`${apiBaseUrl()}/tasks`, configuracaoRequisicao).then(
        resultado => {
            if (resultado.status == 200) {
                return resultado.json();
            }
            throw resultado.status;
        }
    ).then(
        resultado => {
            manipulandoTarefasUsuario(resultado);
        }
    ).catch(
        erros => {
            console.log(erros);
        }
    );
}

function manipulandoTarefasUsuario(listaDeTarefas) {

    //Verifica se o array retornou vazio [] na chamada na API
    if (listaDeTarefas.length != 0) { //caso são seja vazio....

        /* Criar 2 listas para separa as tarefas entre termiandas e completas (Utilizado pela animação do Sketelon) */
        let listaTarefasPendentes = listaDeTarefas.filter(elemento => !elemento.completed)
        let listaTarefasCompletas = listaDeTarefas.filter(elemento => elemento.completed)

        //Inicia a animação dos skeletons em ambas as listas
        renderizarSkeletons(listaTarefasPendentes.length, ".tarefas-pendentes");
        renderizarSkeletons(listaTarefasCompletas.length, ".tarefas-terminadas");

        /* NOTA:
            - Timeout é utilizado aqui para demonstrar a animação de forma mais eficiente, pois o tempo de retorno da requisição é quase instantaneo.
            - Tem como objetivo, melhorar a experiencia do usuário, com a animação de Skeletons
            */
        setTimeout(() => {

            //Ordenando a lista de tarefas pendentes (A - Z)
            listaTarefasPendentes = listaTarefasPendentes.sort(function (a, b) {
                return a.description.localeCompare(b.description);
            });

            //Ordenando a lista de tarefas completas (A - Z)
            listaTarefasCompletas = listaTarefasCompletas.sort(function (a, b) {
                return a.description.localeCompare(b.description);
            });

            //Percorre a lista de tarefas pendentes (já ordenada) e as exibe em tela
            listaTarefasPendentes.map(tarefa => {
                renderizaTarefasPendentes(tarefa);
            });

            //Percorre a lista de tarefas terminadas (já ordenada) e as exibe em tela
            listaTarefasCompletas.map(tarefa => {
                renderizaTarefasConcluidas(tarefa);
            });

            //Remove as animações do skeleton em ambas as listas
            removerSkeleton(".tarefas-pendentes");
            removerSkeleton(".tarefas-terminadas");

        }, 2000);

    } else {
        nenhumaTarefaPendenteEncontrada();
    }
}

/// CADASTRANDO UMA NOVA TAREFA PARA O USUÁRIO LOGADO
let botaoCadastrar = document.getElementById("botaoTarefas");

botaoCadastrar.addEventListener('click', evento => {
    evento.preventDefault();

    let descricaoTarefa = document.getElementById('novaTarefa');

    //Este elemento não é previsto no checkpoint II
    let radioGrupo = document.getElementsByName('grupoRadio');
    let radioSelecionado;
    if (descricaoTarefa.value != "") {

        //Verifica qual foi o radio selecionado e armazena em uma variável
        radioGrupo.forEach(radio => radioSelecionado = radio.checked);

        //Cria objeto JS que será convertido para JSON
        const objetoTarefa = {
            description: descricaoTarefa.value,
            completed: radioSelecionado
        }

        let objetoTarefaJson = JSON.stringify(objetoTarefa);

        let configuracoesRequisicao = {
            method: 'POST',
            body: objetoTarefaJson,
            headers: {
                // Precisa passar ambas propriedades pro Headers da requisição
                'Content-type': 'application/json', //responsável pelo json no Body
                'Authorization': `${cookieJwt}` //responsável pela autorização (vem do cookie)
            },
        }

        /// Chamando a API
        fetch(`${apiBaseUrl()}/tasks`, configuracoesRequisicao)
            .then((response) => {
                if (response.status == 201) {
                    return response.json()
                }
                //Se o código for diferente de sucesso (201), lança um throw para que a execução caia no Catch() 
                throw response;
            }).then(function () {
                alert("A tarefa foi salva com sucesso!")
                //Recarrega a página para atualiza a lista com a "nova" tarefa cadastrada
                window.location.reload();
            })
            .catch(error => {
                console.log(error)
            });
    } else {
        evento.preventDefault();
        alert("Você deve informar uma descrição para a tarefa")
    }
});

/// ATUALIZAR TAREFA, ALTERANDO SEU STATUS 
function atualizaTarefa(idTarefa, status, tokenJwt) {

    let configuracoesRequisicao = {
        method: 'PUT',
        body: JSON.stringify(
            {
                completed: status
            }
        ),
        headers: {
            // Preciso passar ambas propriedade pro Headers da requisição
            'Content-type': 'application/json', //responsável elo json no Body
            'Authorization': tokenJwt //responsável pela autorização (vem do cookie)
        },
    }

    /// Chamando a API
    fetch(`${apiBaseUrl()}/tasks/${idTarefa}`, configuracoesRequisicao)
        .then((response) => {
            if (response.status == 200) {
                return response.json()
            }
            //Se o código for diferente de sucesso (201), lança um throw para que a execução caia no Catch() 
            throw response;
        }).then(function () {
            alert("A tarefa foi atualizada com sucesso!")
            //Recarrega a página para atualiza a lista com a "nova" tarefa cadastrada
            window.location.reload();
        })
        .catch(error => {
            console.log(error)
        });
}

/// DELETAR UMA TAREFA POR SEU ID
function deletarTarefa(idTarefa, tokenJwt) {

    let configuracoesRequisicao = {
        method: 'DELETE',
        headers: {
            'Authorization': tokenJwt //responsável pela autorização (vem do cookie)
        },
    }

    /// Chamando a API
    fetch(`${apiBaseUrl()}/tasks/${idTarefa}`, configuracoesRequisicao)
        .then((resposta) => {
            if (resposta.status == 200) {
                return resposta.json()
            }
            //Se o código for diferente de sucesso (201), lança um throw para que a execução caia no Catch() 
            throw resposta;
        }).then(function () {
            alert("A tarefa foi deletada com sucesso!")
            //Recarrega a página para atualiza a lista com a "nova" tarefa cadastrada
            window.location.reload();
        })
        .catch(error => {
            console.log(error);
        });
}

function encerrarSessao() {
    let escolhaUsuario = confirm("Deseja realmente finalizar a sessão e voltar para o login ?");
    if (escolhaUsuario) {
        //Setar uma data anterior a atual, remove(deleta) o cookie do navegador
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        //Direciona para a tela de login
        window.location = "index.html"
    }
}