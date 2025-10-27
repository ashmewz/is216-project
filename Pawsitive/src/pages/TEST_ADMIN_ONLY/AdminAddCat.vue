<template>
  <div class="admin-page container p-4">
    <h2 class="text-xl font-bold mb-4">Add New Cat</h2>

    <form @submit.prevent="addCat" class="flex flex-col gap-3">
      <!-- BASIC INFO -->
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
        <input v-model.number="location.lng" type="number" step="0.000001" placeholder="Longitude" class="input w-1/2" />
      </div>

      <!-- OTHER FIELDS -->
      <input v-model="cat.status" placeholder="Status" class="input" />
      <textarea v-model="photoInput" placeholder="Photo URLs (comma separated)" class="input"></textarea>

      <!-- SUBMIT -->
      <button type="submit" class="btn bg-blue-600 text-white mt-4">Add Cat</button>
    </form>

    <p v-if="message" class="mt-4 text-green-600">{{ message }}</p>
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

const location = ref({
  lat: null,
  lng: null,
});

const photoInput = ref("");
const message = ref("");

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

    // reset
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
