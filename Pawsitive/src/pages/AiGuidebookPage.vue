<template>
     <Navbar>
      <template v-slot:navbar-title>AI Guidebook</template>
    </Navbar>
  <div class="book" ref="bookRef">
    <div class="page" v-for="(page, idx) in pages" :key="idx">
      <div class="front" :class="page.frontClass" v-html="page.front"></div>
      <div class="back" :class="page.backClass" v-html="page.back"></div>
    </div>
  </div>

    <div class="guidebook">
    <h2>AI Cat Guidebook</h2>

    <div v-if="catStore.imageData">
      <img :src="catStore.imageData" alt="Captured cat" style="max-width: 300px; border-radius: 8px;" />
    </div>

    <div v-if="catStore.breedData" style="margin-top: 16px;">
      <h3>Breed Information:</h3>
      <pre>{{ catStore.breedData }}</pre>
    </div>

    <div v-else>
      <p>No breed data found.</p>
    </div>
  </div>
   <BottomFooter />
</template>

<script setup>
import { onMounted, ref } from "vue";
import Navbar from "@/components/resuables/Navbar.vue";
import BottomFooter from "@/components/resuables/BottomFooter.vue";
import { useCatStore } from '@/stores/catDataStore'

const bookRef = ref(null);
const catStore = useCatStore()

// Pages content as HTML strings — easier to map
const pages = [
  {
    frontClass: "cover",
    backClass: "",
    front: `
      <h1>FlipBook</h1>
      <p>2024.<br>Second edition</p>
    `,
    back: `
      <h2>Responsive</h2>
      <p>Fully responsive CSS flip book, thanks to the <code>cqmin</code> unit.</p>
    `,
  },
  {
    frontClass: "",
    backClass: "",
    front: `
      <p>Even more, the book height is dictated by the amount of content in the tallest page.
      The only thing you need to take care of is how much text you put into a page.</p>
    `,
    back: `
      <img src="https://picsum.photos/id/24/600/600" alt="Img 1" />
    `,
  },
  {
    frontClass: "",
    backClass: "",
    front: `
      <h2>JS at its minimum</h2>
      <p>JavaScript is at its minimum. Basically it's only used to set the initial
      page index and assign click listeners to the pages. Modifies the CSS <b>Var</b>
      for the <i>current</i> page, and the rest is handled entirely by CSS.</p>
    `,
    back: `
      <p>Additionally JavaScript allows you to click on an anchor link in your
      text — without turning the page. You can also have multiple independent
      flip books in a single document. You're all covered.</p>
    `,
  },
  {
    frontClass: "",
    backClass: "",
    front: `
      <h2>Crafting CSS magic</h2>
      <p>The opened (<i>viewing</i>) pages of the flip book are always kept at the same elevation.
      This is necessary if your book has no inclination (is top-down-view).
      Have you noticed that you can also click on the pages edge? CSS will nicely animate the group
      of pages to skip with a staggered animation.</p>
    `,
    back: `
      <p>Like in this demo, you can change the perspective of the parent container and change the
      X axis rotation of the book for extra effect.</p>
    `,
  },
  {
    frontClass: "",
    backClass: "",
    front: `
      <p>The necessary FlipBook's CSS is barely 30 lines, there is no swipe, natural page flip angling,
      complex shadows, etc. in order to keep it as simple as possible.</p>
    `,
    back: `
      <p>Feel free to use and abuse this code. Drop me a line if you find it cool or useful, or just
      want to say <i>hi</i>.</p>
    `,
  },
  {
    frontClass: "",
    backClass: "cover",
    front: `
      <img src="https://picsum.photos/id/1073/600/600" alt="Img 2" />
    `,
    back: `
      <h3>That's all, folks</h3>
      <p>FlipBook code and content:<br>
      <a href="https://stackoverflow.com/users/383904/roko-c-buljan" target="_blank" rel="nofollow">Roko C. Buljan</a>
      <br>Original idea:<br>
      <a href="https://stackoverflow.com/a/76978444/383904" target="_blank" rel="nofollow">Stack Overflow answer</a>
      <br>Images by: picsum.photos</p>
    `,
  },
];

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

onMounted(() => {
  if (bookRef.value) initFlipBook(bookRef.value);
});
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
</style>
