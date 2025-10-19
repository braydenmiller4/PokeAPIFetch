//setup a custom event listener on pokemon-info
document.addEventListener('whosThatPokemon', showTheMon);
document.addEventListener('pokemonTypeFinished', handlePokemonType);

document.addEventListener('DOMContentLoaded', (event) => { 
  setupSearchForm();
})

function setupSearchForm() {
  const searchForm = document.getElementById('pokemon-search');
  const clearLocalStorageButton = document.getElementById('clear-local-storage-button');
  searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    /*
    Grab search form data
    https://developer.mozilla.org/en-US/docs/Web/API/FormData
    */
    const searchFormData = new FormData(event.target);
    const pokemonSearchName = searchFormData.get('pokemonName');
    const pokemonFetch = getPokemon(pokemonSearchName);
    event.target.reset();
    })

  clearLocalStorageButton.addEventListener("click", function(event){
    localStorage.clear();
  })
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
  
  //Ask for type
  const pokemonTypes = [];
  event.detail.types.forEach(function(pokemonType) {
    pokemonTypes.push(getPokemonType(pokemonType.type.name));
  });
  
  storePokemonResult(event.detail);
}

/**
Callback function for the custom pokemonTypeFinished event
**/
function handlePokemonType(event) {
  storePokemonType(event.detail);

  //Grab Display Elements
  const pokemonTypeSection = document.getElementById('pokemon-types');
  const doubleDamageFrom = pokemonTypeSection.querySelector('#double-damage-from');
  const doubleDamageTo = pokemonTypeSection.querySelector('#double-damage-to');
  const halfDamageFrom = pokemonTypeSection.querySelector('#double-damage-from');
  const halfDamageTo = pokemonTypeSection.querySelector('#double-damage-to');
  
  //Render types to page
  event.detail.damage_relations.double_damage_from.forEach(function(typeName) {
    console.log(typeName);
    renderTag(doubleDamageFrom, typeName.name);
  });
  
  event.detail.damage_relations.double_damage_to.forEach(function(typeName) {
    console.log(typeName);
    renderTag(doubleDamageTo, typeName.name);
  })

  event.detail.damage_relations.half_damage_from.forEach(function(typeName) {
    console.log(typeName);
    renderTag(halfDamageFrom, typeName.name);
  })

  event.detail.damage_relations.half_damage_to.forEach(function(typeName) {
    console.log(typeName);
    renderTag(halfDamageTo, typeName.name);
  })

  
}

function renderTag(parentType, type) {
  const typeTag = document.createElement('span');
  typeTag.classList.add(`type-box`, `${type}`);
  typeTag.innerHTML = type;
  console.log("Rendering this type", type);
  parentType.append(typeTag);
}

function storePokemonResult(result) {
  const storageKey = `pokemon_${result.name.toLowerCase()}`;
  localStorage.setItem(storageKey, JSON.stringify(result));
}

function getPokemonResult(name) {
  const storageKey = `pokemon_${name}`;
  return JSON.parse(localStorage.getItem(storageKey));
}

function storePokemonType(result) {
  const storageKey = `type_${result.name.toLowerCase()}`;
  localStorage.setItem(storageKey, JSON.stringify(result));
}

function getPokemonType(name) {
  const storageKey = `type_${name}`;
  return JSON.parse(localStorage.getItem(storageKey));
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
  const requestTimeout = setTimeout(() => abortController.abort(), timeout);
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
  }
  } else {
     console.log("Pulled from localStorage");
      const pokeAlert = new CustomEvent('whosThatPokemon', {
        detail: localPokemon
      });
      document.dispatchEvent(pokeAlert);
      return localPokemon;
  }
}

/* Get Type */
async function getPokemonType(typeName) {
   //Supply headers for the request
  const headers = {
    Accept: "application/json"
  };

  /* Create an AbortController, that we will use to timeout 
  the request if it runs too long */
  const abortController = new AbortController();
  const timeout = 15000;
  const requestTimeout = setTimeout(() => abortController.abort(), timeout);
  //const localPokemon = getPokemonResult(pokemonName);
  
    try {
      const pokeApiUrl = `https://pokeapi.co/api/v2/type/${typeName}`;
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
        console.log("PokeAPI for type", returnData);
        const pokeAlert = new CustomEvent('pokemonTypeFinished', {
          detail: returnData
        });
        document.dispatchEvent(pokeAlert);
        return returnData;
      }
    } catch (error) {
      throw error;
    } finally {
      clearTimeout(requestTimeout);
    }
  }