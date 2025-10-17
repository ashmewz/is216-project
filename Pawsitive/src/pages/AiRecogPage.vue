<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import { onMounted, ref } from 'vue';
import { Client } from "@gradio/client";

const video = ref(null);
const streamRef = ref(null); // 👈 store camera stream reference
const preview = ref(null);
const fileInput = ref(null);
const selectedFile = ref(null);

onMounted(async () => {
  await startCamera();
});

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.value = stream;
    if (video.value) {
      video.value.srcObject = stream;
    }
  } catch (err) {
    alert('Camera access denied or not supported.');
  }
}

// --- 👇 NEW: Stop camera function ---
function stopCamera() {
  if (streamRef.value) {
    const tracks = streamRef.value.getTracks();
    tracks.forEach(track => track.stop());
    streamRef.value = null;
    if (video.value) video.value.srcObject = null;
    alert('Camera stopped.');
  } else {
    alert('No active camera to stop.');
  }
}
// --- 👆 END NEW ---

// --- 👇 Capture snapshot from camera ---
function captureSnapshot() {
  if (!video.value) return alert('Camera not ready.');
  const canvas = document.createElement('canvas');
  canvas.width = video.value.videoWidth;
  canvas.height = video.value.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video.value, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (!blob) return;
    selectedFile.value = new File([blob], "snapshot.jpg", { type: "image/jpeg" });
    preview.value.src = URL.createObjectURL(blob);
  }, 'image/jpeg');
}
// --- 👆 END snapshot function ---

function onFileChange(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    selectedFile.value = files[0];
    preview.value.src = URL.createObjectURL(selectedFile.value);
  }
}

async function uploadFile() {
  if (!selectedFile.value) {
    alert('Please select or capture an image first.');
    return;
  }

  const imageBlob = selectedFile.value;

  try {
    const client = await Client.connect("kevansoon/cat-breed-detector");
    const result = await client.predict("/predict", { image: imageBlob });

    if (result.data) {
      console.log("Prediction result:", result.data);
      document.getElementById("catBreedInfo").innerText = result.data;
      getStructuredCatBreedInfo(result.data);
    }
  } catch (error) {
    alert('Upload and prediction failed.');
    console.error(error);
  }
}

async function getStructuredCatBreedInfo(breedName) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const promptText = `Provide detailed information about the cat breed "${breedName}" with these fields: name, origin, characteristics, temperament, and careTips. Respond only with JSON matching this structure.`;

  const requestBody = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      response_mime_type: "application/json",
      response_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          origin: { type: "string" },
          characteristics: { type: "string" },
          temperament: { type: "string" },
          careTips: { type: "string" }
        },
        required: ["name", "origin", "characteristics", "temperament", "careTips"]
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);
    const data = await response.json();
    const jsonString = data.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(jsonString);

    const descriptionBox = document.getElementById("catBreedGenAiInfo");
    descriptionBox.innerHTML = `
      <br><b>Gen AI GuideBook Response</b><br><br>
      Name: ${parsedData.name}<br><br>
      Origin: ${parsedData.origin}<br><br>
      Care Tips: ${parsedData.careTips}<br><br>
      Characteristics: ${parsedData.characteristics}<br><br>
      Temperament: ${parsedData.temperament}
    `;
  } catch (error) {
    console.error("Failed to get structured cat breed info:", error);
  }
}
</script>


<template>
  <Navbar>
    <template v-slot:navbar-title>
      AI Recognition
    </template>
  </Navbar>

  <div>
    <input type="file" ref="fileInput" @change="onFileChange" accept="image/*" />
    <button @click="uploadFile">Run cat prediction</button>
    <button @click="captureSnapshot">📸 Capture from camera</button>
    <button @click="startCamera">▶️ Start camera</button>
    <button @click="stopCamera">⏹️ Stop camera</button>
  </div>

  <div>
    <img ref="preview" alt="Cat Preview" style="height: 200px; width: 200px; object-fit: cover;" />
  </div>

  <div>
    <span id="catBreedInfo">--The cat breed will be replaced here--</span>
  </div>

  <div>
    <span id="catBreedGenAiInfo">--GenAI information about Cat Breed will be replaced here--</span>
  </div>

  <div>
    <video ref="video" autoplay playsinline width="400"></video>
  </div>

  <BottomFooter></BottomFooter>
</template>



<style scoped></style>