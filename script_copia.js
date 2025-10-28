// ---------- FAVORITOS ----------
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorite(pokemon) {
  let favorites = getFavorites();
  if (!favorites.some(fav => fav.id === pokemon.id)) {
    favorites.push(pokemon);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
}

function removeFavorite(id) {
  let favorites = getFavorites().filter(fav => fav.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function isFavorite(id) {
  return getFavorites().some(fav => fav.id === id);
}

// ---------- CARD SIMPLES (na lista) ----------
function exibeCardResumo(data, container) {
  const img = data.sprites.other.dream_world.front_default || data.sprites.front_default;
  const name = data.name;
  const id = data.id;

  const card = document.createElement("div");
  card.classList.add("pokemon-card");
  card.innerHTML = `
    <img src="${img}" alt="${name}">
    <p class="pokemon-name">${name}</p>
  `;

  card.onclick = () => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then(res => res.json())
      .then(exibe_dados)
      .catch(() => {
        document.getElementById("error").innerText = "Erro ao carregar detalhes.";
      });
  };

  container.appendChild(card);
}

// ---------- CARD COMPLETO (detalhes) ----------
function exibeCardDetalhado(data, container) {
  const img = data.sprites.other.dream_world.front_default || data.sprites.front_default;
  const name = data.name;
  const id = data.id;
  const height = data.height / 10;
  const weight = data.weight / 10;
  const favorite = isFavorite(id);

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
  favBtn.onclick = function() {
    if (isFavorite(id)) {
      removeFavorite(id);
      favBtn.textContent = "☆ Favoritar";
    } else {
      saveFavorite({ id, name, img, height, weight });
      favBtn.textContent = "★ Remover Favorito";
    }
  };

  container.appendChild(card);
}

// ---------- EXIBIR DETALHES ----------
function exibe_dados(data){
  const container = document.getElementById("pokemon-list");
  container.innerHTML = "";
  exibeCardDetalhado(data, container);

  // Esconde paginação e mostra botão voltar
  document.getElementById("pagination").style.display = "none";
  document.getElementById("back-button").style.display = "inline-block";
}

// ---------- LISTAGEM DE POKÉMON ----------
let limit = 8;
let offset = 0;
let showingFavorites = false;

async function listarPokemons() {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  const response = await fetch(url);
  const data = await response.json();

  const container = document.getElementById("pokemon-list");
  container.innerHTML = "";

  for (const pokemon of data.results) {
    const detailsResponse = await fetch(pokemon.url);
    const details = await detailsResponse.json();

    exibeCardResumo(details, container);
  }

  document.getElementById("prev-button").disabled = offset === 0;
  document.getElementById("pagination").style.display = "block";
  document.getElementById("back-button").style.display = "none";
}

// ---------- VER FAVORITOS ----------
function mostrarFavoritos() {
  const container = document.getElementById("pokemon-list");
  container.innerHTML = "";
  showingFavorites = true;

  const favorites = getFavorites();
  if (favorites.length === 0) {
    container.innerHTML = "<p>Você ainda não favoritou nenhum Pokémon ⭐</p>";
    document.getElementById("pagination").style.display = "none";
    document.getElementById("back-button").style.display = "none";
    return;
  }

  favorites.forEach(fav => {
    const data = { 
      id: fav.id, 
      name: fav.name, 
      height: fav.height, 
      weight: fav.weight, 
      sprites: { other: { dream_world: { front_default: fav.img } }, front_default: fav.img } 
    };
    exibeCardResumo(data, container);
  });

  document.getElementById("pagination").style.display = "none";
  document.getElementById("back-button").style.display = "none";
}

// ---------- EVENTOS ----------
document.getElementById("fetch-button").onclick = function() {
  showingFavorites = false;
  let pokemon_input = document.getElementById("pokemon-input").value.trim().toLowerCase();

  if (!pokemon_input) {
    document.getElementById("error").innerText = "Por favor, insira um nome ou ID.";
    return;
  }

  let url = `https://pokeapi.co/api/v2/pokemon/${pokemon_input}`;
  
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Pokémon não encontrado");
      return response.json();
    })
    .then(exibe_dados)
    .catch(() => {
      document.getElementById("error").innerText = "Pokémon não encontrado. Verifique o nome ou ID.";
    });
};

document.getElementById("view-favorites").onclick = function() {
  mostrarFavoritos();
};

document.getElementById("next-button").onclick = function() {
  showingFavorites = false;
  offset += limit;
  listarPokemons();
};

document.getElementById("prev-button").onclick = function() {
  showingFavorites = false;
  if (offset >= limit) {
    offset -= limit;
    listarPokemons();
  }
};

document.getElementById("back-button").onclick = function() {
  document.getElementById("error").innerText = "";
  if (showingFavorites) {
    mostrarFavoritos();
  } else {
    listarPokemons();
  }
};

// ---------- CARREGAR AO ABRIR ----------
window.onload = listarPokemons;
