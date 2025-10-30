<template>
  <div class="admin-page container p-4">
    <h2 class="text-xl font-bold mb-4">Add New Cat</h2>

    <!-- MANUAL ADD FORM -->
    <form @submit.prevent="addCat" class="flex flex-col gap-3 mb-10">
      <input v-model="cat.name" placeholder="Name" class="input" required />
      <input v-model="cat.age" type="number" min="0" placeholder="Age (leave empty for unknown)" class="input" />
      <input v-model="cat.color" placeholder="Color" class="input" />
      <input v-model="cat.species" placeholder="Species" class="input" />

      <!-- GENDER -->
      <label>Gender:</label>
      <select v-model="cat.gender" class="input">
        <option value="unknown">Unknown</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <!-- NEUTERED -->
      <label>Neutered:</label>
      <select v-model="cat.neutered" class="input">
        <option value="unknown">Unknown</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>

      <!-- LOCATION -->
      <div class="flex gap-2">
        <input v-model.number="location.lat" type="number" step="0.000001" placeholder="Latitude" class="input w-1/2" />
        <input v-model.number="location.lng" type="number" step="0.000001" placeholder="Longitude"
          class="input w-1/2" />
      </div>

      <!-- OTHER FIELDS -->
      <input v-model="cat.status" placeholder="Status" class="input" />
      <textarea v-model="photoInput" placeholder="Photo URLs (comma separated)" class="input"></textarea>

      <!-- SUBMIT -->
      <button type="submit" class="btn bg-blue-600 text-white mt-4">Add Cat</button>
    </form>

    <p v-if="message" class="mt-4 text-green-600">{{ message }}</p>

    <!-- AUTO GENERATOR -->
    <div class="mt-10">
      <h2 class="text-xl font-bold mb-4">Generate Random Cats</h2>

      <form @submit.prevent="generateAndAddCats" class="flex flex-col gap-3">
        <div class="flex gap-2">
          <input v-model.number="gen.lat" type="number" step="0.000001" placeholder="Latitude" class="input w-1/2"
            required />
          <input v-model.number="gen.lng" type="number" step="0.000001" placeholder="Longitude" class="input w-1/2"
            required />
        </div>
        <input v-model.number="gen.zoomLevel" type="number" min="1" max="20" placeholder="Zoom Level (1–20)"
          class="input" required />
        <button type="submit" class="btn bg-green-600 text-white mt-2">Generate & Add Cats</button>
      </form>

      <p v-if="genMessage" class="mt-4 text-green-600">{{ genMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp, GeoPoint } from "firebase/firestore";

const cat = ref({
  name: "",
  age: "", // left blank = unknown
  color: "",
  gender: "unknown",
  neutered: "unknown",
  species: "unknown",
  status: "",
});

const location = ref({ lat: null, lng: null });
const photoInput = ref("");
const message = ref("");

// Random generation form
const gen = ref({
  lat: null,
  lng: null,
  zoomLevel: 16,
});
const genMessage = ref("");

// -------------------- ADD MANUAL CAT --------------------
async function addCat() {
  try {
    const photos = photoInput.value
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url);

    const payload = {
      name: cat.value.name || "Unknown",
      age: cat.value.age || "unknown",
      color: cat.value.color || "",
      gender: cat.value.gender || "unknown",
      neutered: cat.value.neutered || "unknown",
      species: cat.value.species || "unknown",
      status: cat.value.status || "",
      photos,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      last_seen: new Date(),
      last_location:
        location.value.lat && location.value.lng
          ? new GeoPoint(location.value.lat, location.value.lng)
          : null,
    };

    await addDoc(collection(db, "cats"), payload);
    message.value = "✅ Cat added successfully!";

    Object.keys(cat.value).forEach((k) => (cat.value[k] = ""));
    cat.value.gender = "unknown";
    cat.value.neutered = "unknown";
    cat.value.species = "unknown";
    location.value.lat = null;
    location.value.lng = null;
    photoInput.value = "";
  } catch (err) {
    console.error("Error adding cat:", err);
    message.value = "❌ Failed to add cat.";
  }
}

// -------------------- RANDOM GENERATION --------------------
function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function generateSimulatedData(lat, lng, zoomLevel) {
  const MAX_POINTS = 20;
  const MIN_POINTS = 2;
  const MAX_ZOOM = 17;
  const MIN_ZOOM = 15;

  const numPoints = Math.min(
    MAX_POINTS,
    Math.max(
      MIN_POINTS,
      Math.floor((MAX_ZOOM - zoomLevel) * (MAX_POINTS / (MAX_ZOOM - MIN_ZOOM)))
    )
  );

  const randomCatNames = [
    "Whiskers",
    "Shadow",
    "Oreo",
    "Luna",
    "Tiger",
    "Misty",
    "Smokey",
    "Jasper",
    "Socks",
    "Cleo",
    "Finn",
    "Nala",
    "Ziggy",
    "Winston",
    "Mittens"
  ];

  const imgLinks = [
    "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg",
    "https://cataas.com/cat",
    "https://cataas.com/cat/gif",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Six_weeks_old_cat_%28aka%29.jpg/1200px-Six_weeks_old_cat_%28aka%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/250px-Cat_November_2010-1a.jpg",
    "https://img.freepik.com/free-photo/portrait-beautiful-purebred-pussycat-with-shorthair-orange-collar-neck-sitting-floor-reacting-camera-flash-scared-looking-light-indoor_8353-12551.jpg?semt=ais_hybrid&w=740&q=80",
    "https://i.guim.co.uk/img/media/327aa3f0c3b8e40ab03b4ae80319064e401c6fbc/377_133_3542_2834/master/3542.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=34d32522f47e4a67286f9894fc81c863",
    "https://marketplace.canva.com/8-1Kc/MAGoQJ8-1Kc/1/tl/canva-ginger-cat-with-paws-raised-in-air-MAGoQJ8-1Kc.jpg",
    "https://f.ptcdn.info/002/048/000/oidav7m4nF0JGvXz44Y-o.jpg",
  ];

  const catColours = [
    "Black",
    "White",
    "Ginger",
    "Gray",
    "Cream",
    "Brown",
    "Black & White",
    "Black & Gray",
    "Calico",
    "Tortie",
    "Tabby",
    "Tuxedo",
    "Smoke"
  ];

  const domesticCatBreeds = [
    "Persian",
    "Siamese",
    "Maine Coon",
    "Ragdoll",
    "Sphynx",
    "British Shorthair",
    "Abyssinian",
    "Scottish Fold",
    "Bengal",
    "Burmese",
    "Devon Rex",
    "American Shorthair",
    "Norwegian Forest Cat",
    "Russian Blue",
    "Siberian"
  ];

  const markers = [];
  for (let i = 0; i < numPoints; i++) {
    const offsetLat = (Math.random() - 0.5) * (0.25 / zoomLevel);
    const offsetLng = (Math.random() - 0.5) * (0.25 / zoomLevel);
    let curName = randomCatNames[i % randomCatNames.length]
    let curImgArr = [imgLinks[i % imgLinks.length], imgLinks[getRandomInt(0, imgLinks.length)]]
    let curAge = "unknown"
    let curCol = catColours[getRandomInt(0, catColours.length)]
    if (Math.random() < 0.75) {
      curAge = getRandomInt(1, 21);
    }
    if (i == 0) {
      curName = "Mew";
      curImgArr = [
        "https://www.shutterstock.com/image-photo/good-quality-pokemon-mew-image-260nw-2566695683.jpg",
        "https://unite.pokemon.com/images/pokemon/mew/stat/stat-mew.png",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKrvFmWP35NzSP_xpyjd2_QQ4-fJwCCJsElw&s",
      ];
    }

    markers.push({
      name: curName,
      age: curAge,
      color: curCol,
      gender: ["male", "female", "unknown"][getRandomInt(0, 3)],
      coords: [lat + offsetLat, lng + offsetLng],
      neutered: ["true", "false", "unknown"][getRandomInt(0, 3)],
      species: domesticCatBreeds[getRandomInt(0, domesticCatBreeds.length)],
      images: curImgArr,
      desc: `Randomly generated nearby cat profile.`,
    });
  }
  return markers;
}

async function generateAndAddCats() {
  try {
    const { lat, lng, zoomLevel } = gen.value;
    const generatedCats = generateSimulatedData(lat, lng, zoomLevel);
    const batch = generatedCats.map((c) =>
      addDoc(collection(db, "cats"), {
        name: c.name,
        age: c.age,
        color: c.color,
        gender: c.gender,
        neutered: c.neutered,
        species: c.species,
        status: "generated",
        photos: c.images,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        last_seen: new Date(),
        last_location: new GeoPoint(c.coords[0], c.coords[1]),
        description: c.desc,
      })
    );

    await Promise.all(batch);
    genMessage.value = `✅ Added ${generatedCats.length} random cats successfully!`;
  } catch (err) {
    console.error("Error generating cats:", err);
    genMessage.value = "❌ Failed to generate cats.";
  }
}
</script>

<style scoped>
.input {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px;
  width: 100%;
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;

  border: none;
  background-color: #2563eb !important;
  color: white !important;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #1d4ed8 !important;
}
</style>
