<template>
     <Navbar>
      <template v-slot:navbar-title>AI Guidebook</template>
    </Navbar>
    <main class="background">
       <div v-if="loading" class="cat-spinner-container">
                <div id="wrapper">
                <div id="cat-mask">
                  <div id="cat">
                    <div class="body-up"></div>
                    <div class="body-down"></div>
                    <div class="body-inside"></div>
                    <div class="body-mask"></div>
                    <div class="body-inside-wrapper">
                      <div class="body-inside-fix"></div>
                    </div>
                    <div class="body-inside-wrapper-end">
                      <div class="body-inside-fix end"></div>
                    </div>
                    <div class="inner-mask"></div>

                    <div class="shape-mask"></div>
                    <div class="shape-mask second"></div>
                    <div class="cat-ass-wrapper">
                      <div class="cat-tail"></div>
                      <div class="cat-ass"></div>
                      <div class="cat-leg"></div>
                      <div class="cat-leg right"></div>
                    </div>
                    <div class="cat-head-wrapper">
                      <div class="cat-head">
                        <div class="cat-eye"></div>
                        <div class="cat-eye right"></div>
                        <div class="cat-mouth-wrapper">
                        <div class="cat-mouth"></div>
                        <div class="cat-mouth-up"></div>
                        <div class="cat-mouth-up right"></div>
                          <div class="cat-beard up"></div>
                          <div class="cat-beard"></div>
                          <div class="cat-beard down"></div>
                          <div class="cat-beard right up"></div>
                          <div class="cat-beard right"></div>
                          <div class="cat-beard right down"></div>
                        </div>
                      </div>
                      <div class="cat-ear"></div>
                      <div class="cat-ear right"></div>
                      <div class="cat-hand"></div>
                      <div class="cat-hand right"></div>
                    </div>
                  </div>
                </div>
              </div>
             </div>
          
            <h1 v-if="loading">Your GenAi Guidebook is on its way!</h1>

        <div class="book" ref="bookRef">
        <div class="page" v-for="(page, idx) in pages" :key="idx">
          <!-- Front side -->
          <div
            class="front"
            :class="page.frontClass"
            v-html="page.front"
          :style="page.frontClass === 'cover' && generatedImageUrl
            ? {
                backgroundImage: `radial-gradient(circle farthest-corner at 80% 20%, rgba(150,80,20,0.3) 0%, rgba(170,60,10,0.1) 100%), url(${generatedImageUrl})`
              } 
              : {}"
          ></div>

          <!-- Back side -->
          <div
            class="back"
            :class="page.backClass"
            v-html="page.back"
                :style="page.backClass === 'cover' && catStore.imageData
              ? {
                  backgroundImage: `radial-gradient(circle farthest-corner at 80% 20%, rgba(150,80,20,0.3) 0%, rgba(170,60,10,0.1) 100%), url(${catStore.imageData})`,
                  backgroundSize: 'cover',
                  backgroundPosition: '50% 50%',
                  color: 'hsl(200 30% 98%)'
                }
              : {}"
          ></div>
          </div>
          </div>
    </main>
      
    
 
   


   <BottomFooter />
</template>

<script setup>
import { onMounted, ref } from "vue";
import Navbar from "@/components/resuables/Navbar.vue";
import BottomFooter from "@/components/resuables/BottomFooter.vue";
import { useCatStore } from '@/stores/catDataStore'
import { Client } from "@gradio/client";
import { main } from "@popperjs/core";

const bookRef = ref(null);
const catStore = useCatStore()
const pages = ref([])


const loading = ref(false);
const images = ref([]); 
const generatedImageUrl = ref(null);





// Gemini AI Guidebook (structured cat breed info)
async function getStructuredCatBreedGuide(breedName) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

  const promptText = `Provide detailed information about the cat breed "${breedName}" with these fields: 
  personality, healthConcerns (diet, lifespan, breed-specific issues), groomingNeeds, uniqueFeatures.
  Respond ONLY with JSON matching this structure:
  {
    "personality": "string",
    "healthConcerns": "string",
    "groomingNeeds": "string",
    "uniqueFeatures": "string"
  }`

  const requestBody = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      response_mime_type: 'application/json',
      response_schema: {
        type: 'object',
        properties: {
          personality: { type: 'string' },
          healthConcerns: { type: 'string' },
          groomingNeeds: { type: 'string' },
          uniqueFeatures: { type: 'string' }
        },
        required: ['personality', 'healthConcerns', 'groomingNeeds', 'uniqueFeatures']
      }
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`)
    const data = await response.json()
    const jsonString = data.candidates[0].content.parts[0].text
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Failed to get structured cat breed guide:', error)
    return null
  }
}

//Structuring data from gemini for the flipbook
async function generateGuidebookFromBreed() {
  if (!catStore.breedData) return alert('No breed data found!')

  const guideData = await getStructuredCatBreedGuide(catStore.breedData)
  if (!guideData) return alert('Failed to generate guidebook.')

  loading.value = false;

  pages.value = [
    {
      frontClass: 'cover',
      backClass: '',
      front: ``,
      back: `<p>AI Generated FlipBook</p>`
    },
    {
      frontClass: '',
      backClass: '',
      front: `<h2>Personality / Temperament</h2><p>${guideData.personality}</p>`,
      back: `<img src="${catStore.imageData}" width="400" height="400" alt="Cat Image" />`
    },
    {
      frontClass: '',
      backClass: '',
      front: `<h2>Health Concerns</h2><p>${guideData.healthConcerns}</p>`,
      back: `<p>Keep your cat healthy!</p>`
    },
    {
      frontClass: '',
      backClass: '',
      front: `<h2>Grooming Needs</h2><p>${guideData.groomingNeeds}</p>`,
      back: `<p>Tips for grooming</p>`
    },
    {
      frontClass: '',
      backClass: 'cover',
      front: `<h2>Unique Features</h2><p>${guideData.uniqueFeatures}</p>`,
      back: `<p>Enjoy your AI Guide!</p>`
    }
  ]
}

// Pages content as HTML strings — easier to map (Commented as I still need it as reference)
// const pages = [
//   {
//     frontClass: "cover",
//     backClass: "",
//     front: `
//       <h1>FlipBook</h1>
//       <p>2024.<br>Second edition</p>
//     `,
//     back: `
//       <h2>Responsive</h2>
//       <p>Fully responsive CSS flip book, thanks to the <code>cqmin</code> unit.</p>
//     `,
//   },
//   {
//     frontClass: "",
//     backClass: "",
//     front: `
//       <p>Even more, the book height is dictated by the amount of content in the tallest page.
//       The only thing you need to take care of is how much text you put into a page.</p>
//     `,
//     back: `
//       <img src="https://picsum.photos/id/24/600/600" alt="Img 1" />
//     `,
//   },
//   {
//     frontClass: "",
//     backClass: "",
//     front: `
//       <h2>JS at its minimum</h2>
//       <p>JavaScript is at its minimum. Basically it's only used to set the initial
//       page index and assign click listeners to the pages. Modifies the CSS <b>Var</b>
//       for the <i>current</i> page, and the rest is handled entirely by CSS.</p>
//     `,
//     back: `
//       <p>Additionally JavaScript allows you to click on an anchor link in your
//       text — without turning the page. You can also have multiple independent
//       flip books in a single document. You're all covered.</p>
//     `,
//   },
//   {
//     frontClass: "",
//     backClass: "",
//     front: `
//       <h2>Crafting CSS magic</h2>
//       <p>The opened (<i>viewing</i>) pages of the flip book are always kept at the same elevation.
//       This is necessary if your book has no inclination (is top-down-view).
//       Have you noticed that you can also click on the pages edge? CSS will nicely animate the group
//       of pages to skip with a staggered animation.</p>
//     `,
//     back: `
//       <p>Like in this demo, you can change the perspective of the parent container and change the
//       X axis rotation of the book for extra effect.</p>
//     `,
//   },
//   {
//     frontClass: "",
//     backClass: "",
//     front: `
//       <p>The necessary FlipBook's CSS is barely 30 lines, there is no swipe, natural page flip angling,
//       complex shadows, etc. in order to keep it as simple as possible.</p>
//     `,
//     back: `
//       <p>Feel free to use and abuse this code. Drop me a line if you find it cool or useful, or just
//       want to say <i>hi</i>.</p>
//     `,
//   },
//   {
//     frontClass: "",
//     backClass: "cover",
//     front: `
//       <img src="https://picsum.photos/id/1073/600/600" alt="Img 2" />
//     `,
//     back: `
//       <h3>That's all, folks</h3>
//       <p>FlipBook code and content:<br>
//       <a href="https://stackoverflow.com/users/383904/roko-c-buljan" target="_blank" rel="nofollow">Roko C. Buljan</a>
//       <br>Original idea:<br>
//       <a href="https://stackoverflow.com/a/76978444/383904" target="_blank" rel="nofollow">Stack Overflow answer</a>
//       <br>Images by: picsum.photos</p>
//     `,
//   },
// ];

//initialize flipbook
const initFlipBook = (elBook) => {
  elBook.style.setProperty("--c", 0);
  elBook.querySelectorAll(".page").forEach((page, idx) => {
    page.style.setProperty("--i", idx);
    page.addEventListener("click", (evt) => {
      if (evt.target.closest("a")) return;
      const curr = evt.target.closest(".back") ? idx : idx + 1;
      elBook.style.setProperty("--c", curr);
    });
  });
};

//image generation for flipbook
const generateImage = async () => {
  loading.value = true;
  images.value = [];

  try {
    const client = await Client.connect("black-forest-labs/FLUX.1-schnell");

    const result = await client.predict("/infer", {
      prompt: `Generate a image of ${catStore.breedData} for a book cover` || "Generate a random cat for a book cover",
      seed: 0,
      randomize_seed: true,
      width: 512,
      height: 512,
      num_inference_steps: 4,
    });

    const outputs = Array.isArray(result.data) ? result.data : [result.data];

    images.value = outputs.map((item) => ({
      image: item.url,
      caption: item.orig_name || "Generated image",
    }));

    // 🧠 Store first generated image for flipbook background
    generatedImageUrl.value = images.value[0]?.image || null;

    console.log("Result:", result.data);
  } catch (err) {
    console.error("Error generating image:", err);
  } finally {
   
  }
};


//on page load
onMounted(async () => {
  //Wait for cat image for book cover to be generated
  await generateImage();
  // Wait for the guidebook pages to be generated
  await generateGuidebookFromBreed()

  // Only initialize flipbook after pages are ready
  if (bookRef.value) {
    initFlipBook(bookRef.value)
   
  }
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

/* FlipBook */
body {
  margin: 0;
  display: flex;
  min-height: 100dvh;
  perspective: 1000px;
  font: 1em/1.4 "Poppins", sans-serif;
  overflow: hidden;
  color: hsl(180 68% 5%);
  background-image: radial-gradient(circle farthest-corner at 50% 50%, hsl(187 20% 88%) 30%, hsl(149 20% 94%) 100%);
}

.book {
  position: relative;
  display: flex;
  margin: auto;
  width: 40cqmin;
  pointer-events: none;
  transform-style: preserve-3d;
  transition: translate 1s;
  translate: calc(min(var(--c), 1) * 50%) 0%;
  rotate: 1 0 0 30deg;
}

.page {
  --thickness: 4;
  flex: none;
  display: flex;
  width: 100%;
  font-size: 2cqmin;
  pointer-events: all;
  user-select: none;
  transform-style: preserve-3d;
  transform-origin: left center;
  transition:
    transform 1s,
    rotate 1s ease-in calc((min(var(--i), var(--c)) - max(var(--i), var(--c))) * 50ms);
  translate: calc(var(--i) * -100%) 0px 0px;
  transform: translateZ(calc((var(--c) - var(--i) - 0.5) * calc(var(--thickness) * 0.23cqmin)));
  rotate: 0 1 0 calc(clamp(0, var(--c) - var(--i), 1) * -180deg);
}

.front,
.back {
  position: relative;
  flex: none;
  width: 100%;
  backface-visibility: hidden;
  overflow: hidden;
  background-color: #fff;
  translate: 0px;
}

.back {
  translate: -100% 0;
  rotate: 0 1 0 180deg;
}

/* FlipBook customization styles */
.book {
  counter-reset: page -1;
}

.page {
  box-shadow: 0em 0.5em 1em -0.2em #00000020;
}

.front,
.back {
  display: flex;
  flex-flow: column wrap;
  justify-content: space-between;
  padding: 2em;
  border: 1px solid #0002;
}

.front img,
.back img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.front::after,
.back::after {
  position: absolute;
  bottom: 1em;
  counter-increment: page;
  content: counter(page) ".";
  font-size: 0.8em;
}

.cover::after {
  content: "";
}

.front::after {
  right: 1em;
}

.back::after {
  left: 1em;
}

.front {
  background: linear-gradient(to left, #f7f7f7 80%, #eee 100%);
  border-radius: 0.1em 0.5em 0.5em 0.1em;
}

.back {
  background-image: linear-gradient(to right, #f7f7f7 80%, #eee 100%);
  border-radius: 0.5em 0.1em 0.1em 0.5em;
}

.cover {
  background: radial-gradient(circle farthest-corner at 80% 20%, hsl(150 80% 20% / 0.3) 0%, hsl(170 60% 10% / 0.1) 100%),
    hsl(231, 32%, 29%) url("https://picsum.photos/id/984/800/900") 50% / cover;
  color: hsl(200 30% 98%);
}


/* Cat spinner */
.cat-spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
  height: 350px;
  background: transparent;
}

/*Cat Loading Spinner*/
@keyframes rotating {
  0% {
    transform: rotate(45deg);
  }
  10% {
    transform: rotate(45deg);
  }
  100% {
    transform: rotate(765deg);
  }
}

@keyframes rotating-ass {
  0% {
    transform: rotate(-65deg);
  }
  90% {
    transform: rotate(655deg);
  }
  100% {
    transform: rotate(655deg);
  }
}

@keyframes mouth {
  0% {
    height: 0px;
    border-weight: 0;
  }
  16% {
    height: 0px;
    border-weight: 0;
  }
  30% {
    height: 2px;
    border-weight: 3px;
  }
  50% {
    height: 2px;
    border-weight: 3px;
  }
  100% {
    height: 0px;
    border-weight: 0;
  }
}


#wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  padding: 50px;
  background: var(--pink);
  transform: translate(-50%, -50%);
 
}

#cat-mask {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  height: 250px;
  border-radius: 50%;
}

#cat {
  position: relative;
  width: 250px;
  height: 250px;
  border: 5px solid rgb(50, 50, 70);
  border-radius: 50%;
}
#cat .shape-mask {
  position: absolute;
  width: 270px;
  height: 135px;
  top: -10px;
  left: -10px;
  border-radius: 135px 135px 0 0;
  background: var(--pink);
  transform-origin: center bottom;
  transform: rotate(-65deg);
  animation-name: rotating-ass;
  animation-duration: 2.79s;
  animation-direction: reverse;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
#cat .shape-mask.second {
  transform: rotate(45deg);
  animation-name: rotating;
  animation-duration: 2.79s;
  animation-direction: reverse;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
#cat .body-up,
#cat .body-down {
  width: 250px;
  height: 125px;
  border-radius: 125px 125px 0 0;
  background: rgb(230, 165, 100);
}
#cat .body-down {
  transform: rotate(180deg);
}
#cat .body-inside {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgb(240, 190, 120);
}
#cat .body-inside-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-65deg);
  animation-name: rotating-ass;
  animation-duration: 2.79s;
  animation-direction: reverse;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
#cat .body-inside-wrapper-end {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(45deg);
  animation-name: rotating;
  animation-duration: 2.79s;
  animation-direction: reverse;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
#cat .body-inside-fix {
  position: absolute;
  top: 50%;
  left: 10px;
  width: 50px;
  height: 50px;
  transform: translateY(-50%);
  background: rgb(230, 165, 100);
}
#cat .body-inside-fix.end {
  left: auto;
  right: 10px;
}
#cat .body-inside-fix.end:after {
  left: auto;
  right: 9px;
}
#cat .body-inside-fix:after {
  content: " ";
  position: absolute;
  top: 36px;
  left: 9px;
  display: block;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: rgb(240, 190, 120);
}
#cat .body-mask {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 170px;
  height: 170px;
  border-radius: 50%;
  background: rgb(230, 165, 100);
}
#cat .cat-head-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(45deg);
  animation-name: rotating;
  animation-duration: 2.79s;
  animation-direction: reverse;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
#cat .cat-head {
  position: absolute;
  top: 91px;
  right: -5px;
  width: 55px;
  height: 30px;
  border: 5px solid rgb(50, 50, 70);
  border-bottom: none;
  border-radius: 5px 5px 0 0;
  background: rgb(230, 165, 100);
}
#cat .cat-ear {
  position: absolute;
  top: 81px;
  right: 43px;
  width: 7px;
  height: 10px;
  border: 5px solid rgb(50, 50, 70);
  border-bottom: none;
  border-radius: 5px 20px 0 0;
  background: rgb(230, 165, 100);
}
#cat .cat-ear.right {
  right: -5px;
  border-radius: 20px 5px 0 0;
}
#cat .cat-eye {
  position: absolute;
  top: 10px;
  left: 11px;
  width: 5px;
  height: 6px;
  border-radius: 50%;
  background: rgb(50, 50, 70);
}
#cat .cat-eye.right {
  left: 39px;
}
#cat .cat-mouth-wrapper {
  position: absolute;
  top: 23px;
  left: 23px;
}
#cat .cat-mouth {
  position: absolute;
  top: 0px;
  left: 2px;
  width: 2px;
  height: 3px;
  border: 2px solid rgb(50, 50, 70);
  border-top: none;
  border-radius: 0 0 5px 5px;
  animation-name: mouth;
  animation-duration: 2.79s;
  animation-direction: reverse;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
#cat .cat-mouth-up {
  position: absolute;
  top: -3px;
  left: 0;
  width: 1px;
  height: 2px;
  border: 2px solid rgb(50, 50, 70);
  border-top: none;
  border-radius: 0 0 5px 5px;
}
#cat .cat-mouth-up.right {
  left: 5px;
}
#cat .cat-beard {
  position: absolute;
  top: 0;
  left: -33px;
  height: 1px;
  width: 15px;
  border-top: 2px solid rgb(50, 50, 70);
  border-radius: 15px;
  background: black;
}
#cat .cat-beard.right {
  left: auto;
  right: -43px;
}
#cat .cat-beard.up {
  top: -5px;
  transform: rotate(5deg);
}
#cat .cat-beard.up.right {
  transform: rotate(-5deg);
}
#cat .cat-beard.down {
  top: 5px;
  transform: rotate(-5deg);
}
#cat .cat-beard.down.right {
  transform: rotate(5deg);
}
#cat .cat-hand {
  position: absolute;
  top: 155px;
  right: 5px;
  width: 13px;
  height: 30px;
  transform: rotate(21deg);
  border: 5px solid rgb(50, 50, 70);
  border-top: none;
  border-radius: 0 5px 15px 15px;
  background: rgb(230, 165, 100);
}
#cat .cat-hand.right {
  top: 140px;
  right: 45px;
}
#cat .cat-ass-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-65deg);
  animation-name: rotating-ass;
  animation-duration: 2.79s;
  animation-direction: reverse;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
#cat .cat-leg {
  position: absolute;
  top: 95px;
  left: -5px;
  width: 13px;
  height: 30px;
  border: 5px solid rgb(50, 50, 70);
  border-bottom: none;
  border-radius: 15px 15px 0 0;
  background: rgb(230, 165, 100);
}
#cat .cat-leg.right {
  left: auto;
  right: 190px;
}
#cat .cat-ass {
  position: absolute;
  top: 115px;
  left: 13px;
  width: 18px;
  height: 5px;
  border: 5px solid rgb(50, 50, 70);
  border-bottom: none;
  border-radius: 30px 30px 0 0;
  background: rgb(230, 165, 100);
}
#cat .cat-tail {
  position: absolute;
  top: 75px;
  left: 17px;
  width: 12px;
  height: 40px;
  border: 5px solid rgb(50, 50, 70);
  border-bottom: none;
  border-radius: 20px 20px 0 0;
  background: rgb(190, 130, 80);
}
#cat .inner-mask {
  position: absolute;
  box-sizing: border-box;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  border: 5px solid rgb(50, 50, 70);
  border-radius: 50%;
  background: var(--pink);
}



</style>
