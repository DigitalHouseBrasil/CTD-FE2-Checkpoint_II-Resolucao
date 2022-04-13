function mostrarSpinner() {
    // Selecionamos o corpo. Isso nos ajudará a incorporar nosso spinner
    // dentro de nosso HTML.
    const body = document.querySelector("body");

    // Selecionamos o formulário de registro para poder ocultá-lo durante o carregamento
    const form = document.querySelector("form");

    //Captura a Div da foto na esquerda para ocultar ela também
    const imgForm = document.querySelector(".left");

    // Criamos nosso spinner
    const spinnerContainer = document.createElement("div");
    const spinner = document.createElement("div");

    // Atribuímos os IDs a cada novo elemento, para poder manipular
    // seus estilos
    spinnerContainer.setAttribute("id", "conteiner-load"); //Aqui tinha um erro em "conteiner"
    spinner.setAttribute("id", "load");

    // Ocultamos o formulário de registro
    form.classList.add("hidden");

    //Oculta a div usando a classe hidden
    imgForm.classList.add("hidden");

    // Adicionamos o Spinner ao nosso HTML.
    spinnerContainer.appendChild(spinner);
    body.appendChild(spinnerContainer);
}


function ocultarSpinner() {
    // Selecionamos o corpo para poder remover o spinner do HTML.
    const body = document.querySelector("body");

    // Selecionamos o formulário de registro para poder mostrar-lo novamente
    const form = document.querySelector("form");

    //Captura a Div da foto na esquerda para ocultar ela também
    const imgForm = document.querySelector(".left");

    // Selecionamos o spinner
    const spinnerContainer = document.querySelector("#conteiner-load");

    // Removemos o spinner do HTML
    body.removeChild(spinnerContainer);

    // Removemos a classe que oculta o formulário
    form.classList.remove("hidden");

    // Removemos a classe que oculta a imagem da esquerda
    imgForm.classList.remove("hidden");
}