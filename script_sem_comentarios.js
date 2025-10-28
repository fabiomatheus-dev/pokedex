let limit = 8; 
let offset = 0; 
let currentView = "lista";

// ---------- FAVORITOS ----------
function getFavorites() { 
  return JSON.parse(localStorage.getItem("favorites")) || []; 
}

function saveFavorite(pokemon) { 
  const favorites = getFavorites(); 
  if (!favorites.some(fav => fav.id === pokemon.id)) {
    favorites.push(pokemon);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
}

function removeFavorite(id) {
  const favorites = getFavorites().filter(fav => fav.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function isFavorite(id) {
  return getFavorites().some(fav => fav.id === id);
}

// ---------- LISTAGEM DE POKÉMON ----------
async function listarPokemons() {
  currentView = "lista";
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

// ---------- CARD SIMPLES (lista/favoritos) ----------
function exibeCardResumo(data, container) {
  const img = data.sprites.other?.dream_world?.front_default || data.sprites.front_default;
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
      .then(exibeDetalhes)
      .catch(() => {
        document.getElementById("error").innerText = "Erro ao carregar detalhes.";
      });
  };

  container.appendChild(card);
}

// ---------- CARD COMPLETO (detalhes) ----------
function exibeDetalhes(data) {
  currentView = "detalhes";
  const container = document.getElementById("pokemon-list");
  container.innerHTML = "";

  const img = data.sprites.other?.dream_world?.front_default || data.sprites.front_default;
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
  favBtn.onclick = () => {
    if (isFavorite(id)) {
      removeFavorite(id);
      favBtn.textContent = "☆ Favoritar";
    } else {
      saveFavorite({ id, name, img, height, weight });
      favBtn.textContent = "★ Remover Favorito";
    }
  };

  container.appendChild(card);
  document.getElementById("back-button").style.display = "inline-block";
  document.getElementById("pagination").style.display = "none";
}

// ---------- BOTÃO VOLTAR ----------
document.getElementById("back-button").onclick = function() {
  document.getElementById("error").innerText = "";

  if (currentView === "detalhes") {
    // Voltar para lista ou favoritos dependendo do estado anterior
    currentView = document.getElementById("view-favorites").clicked ? "favoritos" : "lista";
    if (getFavorites().length > 0 && currentView === "favoritos") {
      mostrarFavoritos();
    } else {
      listarPokemons();
    }
  } else if (currentView === "favoritos") {
    listarPokemons();
  }
};

// ---------- BUSCAR POKÉMON ----------
document.getElementById("fetch-button").onclick = function() {
  currentView = "lista";
  const pokemon_input = document.getElementById("pokemon-input").value.trim().toLowerCase();

  if (!pokemon_input) {
    document.getElementById("error").innerText = "Por favor, insira um nome ou ID.";
    return;
  }

  fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon_input}`)
    .then(res => {
      if (!res.ok) throw new Error("Pokémon não encontrado");
      return res.json();
    })
    .then(exibeDetalhes)
    .catch(() => {
      document.getElementById("error").innerText = "Pokémon não encontrado. Verifique o nome ou ID.";
    });
};

// ---------- PAGINAÇÃO ----------
document.getElementById("next-button").onclick = function() {
  currentView = "lista";
  offset += limit;
  listarPokemons();
};

document.getElementById("prev-button").onclick = function() {
  currentView = "lista";
  if (offset >= limit) {
    offset -= limit;
    listarPokemons();
  }
};

// ---------- VER FAVORITOS ----------
document.getElementById("view-favorites").onclick = mostrarFavoritos;

function mostrarFavoritos() {
  currentView = "favoritos";
  const container = document.getElementById("pokemon-list");
  container.innerHTML = "";

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
  document.getElementById("back-button").style.display = "inline-block";
}

// ---------- CARREGAR AO ABRIR ----------
window.onload = listarPokemons;
