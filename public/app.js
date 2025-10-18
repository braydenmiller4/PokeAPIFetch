//setup a custom event listener on pokemon-info
document.addEventListener('whosThatPokemon', showTheMon);

document.addEventListener('DOMContentLoaded', (event) => { 
  setupSearchForm();
})

function setupSearchForm() {
  const searchForm = document.getElementById('pokemon-search');
  
  searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    /*
    Grab search form data
    https://developer.mozilla.org/en-US/docs/Web/API/FormData
    */
    const searchFormData = new FormData(event.target);
    const pokemonSearchName = searchFormData.get('pokemonName');
    const pokemonFetch = getPokemon(pokemonSearchName);
    
  });
}

function showTheMon(event) {
  console.log("Showing the mon", event);
  const pokemonInfo = document.getElementById('pokemon-info');
  const pokemonImage = pokemonInfo.querySelector('img');
  const pokemonBackImage = document.getElementById('pokemon-back-image');
  const pokemonName = pokemonInfo.querySelector('strong');
  
  pokemonInfo.classList.add('show');
  pokemonName.innerText = `#${event.detail.id}: ${event.detail.name.toUpperCase()}`;
  pokemonImage.src = event.detail.sprites.front_default;
  pokemonBackImage.src = event.detail.sprites.back_default;

  storePokemonResult(event.detail);
}

function storePokemonResult(result){
    const storageKey = `pokemon_${result.id}`;
    localStorage.setItem(storageKey, JSON.stringify(result));
}

function getPokemonResult(name){
    const storageKey = `pokemon_${name}`;
    return JSON.parse(localStorage.getitem(storageKey));
}

/*
Setup an asynchronous function that reaches out to PokeAPI and returns the result. We want to use this request generically, so we will reach for the same url each time, but supply different options.
*/
async function getPokemon(pokemonName) {
  //Supply headers for the request
  const headers = {
    Accept: "application/json"
  };

  /* Create an AbortController, that we will use to timeout 
  the request if it runs too long */
  const abortController = new AbortController();
  const timeout = 15000;
  const requestTimeout = setTimeout(() => controller.abort(), timeout);
  const localPokemon = getPokemonResult(pokemonName);

  if(!localPokemon) {
  try {
    const pokeApiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
    const pokeRequest = await fetch(pokeApiUrl, {
      headers,
      signal: abortController.signal
    });
    
    if(!pokeRequest.ok) {
      const requestError = new Error(`Not Effective! ${pokeRequest.status} ${pokeRequest.statusText}`);
      throw requestError;
    }
    
    //Parse JSON when it arrives. But check for it
    //Get the content type from the requesrt
    const contentType = pokeRequest.headers.get('content-type') || '';
    
    if(contentType.includes('application/json')) {
      const returnData = await pokeRequest.json();
      console.log("PokeAPI", returnData);
      const pokeAlert = new CustomEvent('whosThatPokemon', {
        detail: returnData
      });
      document.dispatchEvent(pokeAlert);
      return returnData;
    }
  } catch (error) {
     throw error;
  } finally {
    clearTimeout(requestTimeout);
  }else{
    console.log("Pulled from localStorage");
    const pokeAlert = new CustomEvent('whosThatPokemon', {
        detail: localPokemon
    });
    
  }
}
}

