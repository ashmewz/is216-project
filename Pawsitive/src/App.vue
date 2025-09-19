<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import { predictCatBreedFromPublicImage } from "./api/catBreedApi";

async function runPrediction(catFilePath) {
  const result = await predictCatBreedFromPublicImage(catFilePath);
  console.log(result);
  if (catFilePath == "../../cat1.png") {
  document.getElementById('breed-1').innerHTML = result;
  }
  else {
    document.getElementById('breed-2').innerHTML = result;
  }
  
}

</script>

<template>
  <header>
    <!-- <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" /> -->

    <div class="wrapper">
      <!-- <HelloWorld msg="You did it!" /> -->
      
    </div>
  </header>

  <main>
    <!-- <TheWelcome /> -->
     <div style="display: grid">
      <img src="../../cat1.png" style="height: 200px; width: 200px;" alt="Cat" /> 
     <span>Click here to check cat breed</span>
     <button @click="runPrediction('../../cat1.png')">Run API Cat Prediction</button>
     <span id="breed-1">Breed will be shown here</span>
     </div>

      <div style="display: grid">
      <img src="../../cat2.png" style="height: 200px; width: 200px;" alt="Cat" /> 
     <span>Click here to check cat breed</span>
     <button @click="runPrediction('../../cat2.png')">Run API Cat Prediction</button>
     <span id="breed-2">Breed will be shown here</span>
     </div>
      
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
