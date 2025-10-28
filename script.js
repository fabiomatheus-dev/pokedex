let limit = 8; // Limita em 8 os pokemons 
let offset = 0; // Faz com que a listagem de pokemons comece a partir do 0.
let currentView = "lista"; // Irá inicialmente mostrar a lista dos pokemons.

// ---------- FAVORITOS ----------
function getFavorites() { // Puxa no local storage se tem algum favorito salvo.
  return JSON.parse(localStorage.getItem("favorites")) || []; // o Json.parse Converte de texto do local storage para um objeto javascript. [] serve para evitar erro caso o local storage esteja vazio.
}

function saveFavorite(pokemon) { // Salva um Pokémon nos favoritos
  const favorites = getFavorites(); // Pega a lista atual de favoritos que está salva no navegador.
  if (!favorites.some(fav => fav.id === pokemon.id)) { // verifica se o Pokémon já está nos favoritos.
    favorites.push(pokemon); // Se não existir esse pokemon nos favoritos, adicionar esse Pokemon aos favoritos. 
    localStorage.setItem("favorites", JSON.stringify(favorites)); // Salva o novo array atualizado no armazenamento local (localStorage) do navegador. JSON.stringify(favorites) converte o array em texto JSON, pois o localStorage só guarda strings.
  }
}

function removeFavorite(id) { // Remove um pokemon da lista de favoritos
  const favorites = getFavorites().filter(fav => fav.id !== id); // O metodo filter() cria um novo array, mantendo apenas os itens que passam no teste de fav.id !== id, ou seja, mantenha apenas os pokemon cujo id não é igual ao ID que quero remover. Novo array é guardado na variavel favorites.
  localStorage.setItem("favorites", JSON.stringify(favorites)); // Atualiza o local storage com o novo array é gaurdado
}

function isFavorite(id) { // verifica se um Pokemon ja esta nos favoritos. 
  return getFavorites().some(fav => fav.id === id);
}

// ---------- LISTAGEM DE POKÉMON ----------
async function listarPokemons() { // Faz a listagem dos pokemons na tela. Define uma função assíncrona, ou seja, que usa await para lidar com requisições que demoram (como chamadas à internet).
  currentView = "lista"; // Define que a tela atual é a de lista
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`; // Monta a URL da API com base nas variáveis limit e offset.
  const response = await fetch(url); // Faz uma requisição HTTP à PokéAPI (busca os dados na internet). Como isso demora, usa-se await para esperar a resposta antes de continuar.
  const data = await response.json(); // Converte a resposta da API (que vem como texto) em um objeto JavaScript. Esse data contém uma lista básica dos Pokémons.

  const container = document.getElementById("pokemon-list"); // Busca no HTML o elemento onde os cards dos Pokémon serão exibidos (geralmente uma <div id="pokemon-list">).
  container.innerHTML = ""; // Limpa o conteúdo anterior antes de mostrar a nova lista. Isso evita que os Pokémon se acumulem na tela ao mudar de página.

  for (const pokemon of data.results) { // Percorre cada Pokemon retornado pela API
    const detailsResponse = await fetch(pokemon.url); // Faz uma nova requisição pegando os detalhes completos do pokemon(peso, altura, etc...)
    const details = await detailsResponse.json(); // Converte a resposta para obj javascript
    exibeCardResumo(details, container); // Chama a função que cria e mostra o card do Pokemon.
  }

  document.getElementById("prev-button").disabled = offset === 0; // Desativa o botão “Anterior” se offset for 0 (ou seja, se estiver na primeira página).
  document.getElementById("pagination").style.display = "block"; // Garante que os botões de paginação fiquem visíveis.
  document.getElementById("back-button").style.display = "none"; // Esconde o botão de “voltar” (usado na tela de detalhes, por exemplo).
}

// ---------- CARD SIMPLES (lista/favoritos) ----------
function exibeCardResumo(data, container) { // função que cria e mostra o card do Pokemon. Data sao os dados detalhados do Pokemon vindos da api, container é o elemento html onde o card será inserido.
  const img = data.sprites.other?.dream_world?.front_default || data.sprites.front_default; // Retorna varias imagens de cada Pokemon. Tenta pegar o SVG bonito, se não der pega imagem normal.
  const name = data.name; // Armazena o nome do pokemon na variavel name
  const id = data.id; // Armazena o id do pokemon na variavel id

  const card = document.createElement("div"); // Cria um elemento div
  card.classList.add("pokemon-card"); // Adiciona a esse elemento div um css de classe "pokemon-card".
  card.innerHTML = `
    <img src="${img}" alt="${name}">
    <p class="pokemon-name">${name}</p>
  `; // Define o conteudo HYML interno do card, <img> mostra a img e <p> mostra o nome do pokemon em texto.

  card.onclick = () => { // Ao usuario clicar no card...
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`) // é feita uma nova requisição à PokéAPI, buscando os detalhes completos do Pokémon clicado
      .then(res => res.json()) // Converte a resposta em JSON
      .then(exibeDetalhes) // Mostra os detalhes do pokemon na tela.
      .catch(() => {
        document.getElementById("error").innerText = "Erro ao carregar detalhes.";
      }); // Caso dê erro, exibe uma mensagem de erro no elemento com id "error"
  };

  container.appendChild(card); // Adiciona o card que foi criado dentro do container principal da página.
}

// ---------- CARD COMPLETO (detalhes) ----------
function exibeDetalhes(data) {
  currentView = "detalhes"; // Mostra no momento os detalhes
  const container = document.getElementById("pokemon-list"); // Busca no HTML o elemento onde os cards dos pokemons serão exibidos.
  container.innerHTML = ""; // Limpa o conteudo anterior antes de mostrar a nova lista. Evita que pokemons se sobreponham.

  const img = data.sprites.other?.dream_world?.front_default || data.sprites.front_default; // Retorna varias imagens de cada pokemon. O Dream world faz com que tente pegar o svg bonito primeiro, se não pega uma imagem pior.
  const name = data.name; // Armazena o nome do pokemon na variavel name.
  const id = data.id; // Armazena o id do pokemon na variavel id. 
  const height = data.height / 10; // Armazena a altura do pokemon na variavel height. Transforma de decimetros para metros.
  const weight = data.weight / 10; // Armazena o peso do pokemon na variavel height. Transforma de hectogramas para quilos. 
  const favorite = isFavorite(id); // verifica se o pokemon ja esta nos favoritos. 

  const card = document.createElement("div");
  card.classList.add("pokemon-card");
  card.innerHTML = `
    <img src="${img}" alt="${name}">
    <p class="pokemon-name">${name}</p>
    <div class="pokemon-info">
      <p><strong>ID:</strong> #${id}</p>
      <p><strong>Altura:</strong> ${height.toFixed(1)} m</p>
      <p><strong>Peso:</strong> ${weight.toFixed(1)} kg</p>
    </div>
    <button class="favorite-btn">${favorite ? "★ Remover Favorito" : "☆ Favoritar"}</button>
  `;

  const favBtn = card.querySelector(".favorite-btn");
  favBtn.onclick = () => {
    if (isFavorite(id)) { // Se ja for favorito, chama removeFavorite(id) e muda o texto do botão para "☆ Favoritar".
      removeFavorite(id);
      favBtn.textContent = "☆ Favoritar";
    } else { // Se não for, chama saveFavorite(...) e muda o texto para "★ Remover Favorito".
      saveFavorite({ id, name, img, height, weight });
      favBtn.textContent = "★ Remover Favorito";
    }
  };

  container.appendChild(card); // Adiciona o card (com os detalhes e o botão) dentro da área principal da página.
  document.getElementById("back-button").style.display = "inline-block";
  document.getElementById("pagination").style.display = "none"; // Esconde a paginação, já que na tela de detalhes ela não faz sentido.
}

// ---------- BOTÃO VOLTAR ----------
document.getElementById("back-button").onclick = function() { // Define o que acontece quando o botão “Voltar” é clicado.
  document.getElementById("error").innerText = ""; // Limpa mensagens de erro que possam estar aparecendo na tela.

  if (currentView === "detalhes") { // Se tava em detalhes e clicar em voltar
    currentView = document.getElementById("view-favorites").clicked ? "favoritos" : "lista";
    if (getFavorites().length > 0 && currentView === "favoritos") { 
      mostrarFavoritos(); // mostra a lista de favoritos
    } else {
      listarPokemons(); // mostra a lista de pokemons
    }
  } else if (currentView === "favoritos") { // Se tava em favoritos e clica rem voltar
    listarPokemons(); // mostra a lista de pokemons
  }
};

// ---------- BUSCAR POKÉMON ----------
document.getElementById("fetch-button").onclick = function() { // Define o que vai aconecer ao clicar no botão de id fecth button.
  currentView = "lista"; // Atualiza a a variavel global CurrentView para indicar que estamos na tela de listagem do pokemon.
  const pokemon_input = document.getElementById("pokemon-input").value.trim().toLowerCase(); // Pega o valor digitado no campo de entrada input, .trim() remove espaços antes e depois do texto, .toLowerCase() transforma tudo em minúsculas.

  if (!pokemon_input) {
    document.getElementById("error").innerText = "Por favor, insira um nome ou ID."; // se o usuario não digitar nada, mostra a mensagem de erro.
    return; // termina a execucao da função
  }

  fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon_input}`) // faz a requisição a PokeAPI, se o usuario digiitou pikachu, fica https://pokeapi.co/api/v2/pokemon/pikachu
    .then(res => {
      if (!res.ok) throw new Error("Pokémon não encontrado"); 
      return res.json(); // converte a repsosta para formato json(objeto javascript legivel).
    })
    .then(exibeDetalhes) // se deu tudo certo, o json do pokemon é passado para a função exibedetalhes(data)
    .catch(() => {
      document.getElementById("error").innerText = "Pokémon não encontrado. Verifique o nome ou ID."; // se ocorrer qualquer erro.
    });
};

// ---------- PAGINAÇÃO ----------
document.getElementById("next-button").onclick = function() { // define o que acontece ao clicar no botao de id next-button
  currentView = "lista"; // atualiza a variavel global CurrentView para a lista de pokemons
  offset += limit; // o offset incrementa o limite
  listarPokemons(); // lista os pokemons
};

document.getElementById("prev-button").onclick = function() { // define o que acontece ao clicar no botao de id prev-button
  currentView = "lista"; // atualiza a variavel global CurrentView para a lista de pokemons.
  if (offset >= limit) { // se o offset for maior que o limite
    offset -= limit; // o offset decrementa o limite
    listarPokemons(); // lista os pokemons
  }
};

// ---------- VER FAVORITOS ----------
document.getElementById("view-favorites").onclick = mostrarFavoritos; // Define o que acontece ao clicar em no botao de id view-favorites, chama a função mostrar favoritos.

function mostrarFavoritos() {
  currentView = "favoritos"; // atualiza a variavel global currentView para a lista de favoritos.
  const container = document.getElementById("pokemon-list"); // busca no html o div de id pokemon list e armazena na variavel continer.
  container.innerHTML = ""; // limpa o conteudo anterior, preparando o espaço para mostrar os favoritos. 

  const favorites = getFavorites(); // pega a lista de pokemons salvos no localStorage atraves da função getFavorites() e retorna um array com todos os pokemon favoritados anteriormente.
  if (favorites.length === 0) { // se o tamanho de favoritos for igual a 0
    container.innerHTML = "<p>Você ainda não favoritou nenhum Pokémon ⭐</p>"; // printar que nao há pokemon favoritado.
    document.getElementById("pagination").style.display = "none"; // desabilitar a paginacao
    document.getElementById("back-button").style.display = "none"; // desabilitar o botao de voltar
    document.getElementById("back-button").style.display = "inline-block"; // voltar a lista
    return; // termina a execucao da funcao
  }

  favorites.forEach(fav => { // percorre todos os pokemons favoritados.
    const data = { 
      id: fav.id, 
      name: fav.name, 
      height: fav.height, 
      weight: fav.weight, 
      sprites: { other: { dream_world: { front_default: fav.img } }, front_default: fav.img } 
    };
    exibeCardResumo(data, container); // mostra o card do pokemon com imagem e nome na tela
  });

  document.getElementById("pagination").style.display = "none";
  document.getElementById("back-button").style.display = "inline-block";
}

// ---------- CARREGAR AO ABRIR ----------
window.onload = listarPokemons; // significa que assim que a página terminar de carregar, o JavaScript vai executar automaticamente a função listarPokemons()
