<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import { onMounted, ref } from 'vue';
import { Client } from "@gradio/client";

// File input
const preview = ref(null);
const fileInput = ref(null);
const selectedFile = ref(null);

// Camera
const isCameraOpen = ref(false);
const isPhotoTaken = ref(false);
const isShotPhoto = ref(false);
const isLoading = ref(false);
const link = ref('#');
const camera = ref(null);
const canvas = ref(null);

// File input change
function onFileChange(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    selectedFile.value = files[0];
    preview.value.src = URL.createObjectURL(selectedFile.value);
  }
}

// Calling cat breed identifier API
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

// Upload button to convert camera screenshot for uploadFile()
function uploadCanvasImage() {
  if (!canvas.value) {
    alert("No photo captured yet!");
    return;
  }

  canvas.value.toBlob((blob) => {
    if (!blob) return;
    const file = new File([blob], "captured-photo.jpg", { type: "image/jpeg" });
    selectedFile.value = file;
    uploadFile();
  }, "image/jpeg");
}

// Gemini AI Guidebook (structured cat breed info)
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
      <div class="breed-info-content">
        <h3 class="breed-info-title">Gen AI GuideBook Response</h3>
        <div class="breed-info-item"><strong>Name:</strong> ${parsedData.name}</div>
        <div class="breed-info-item"><strong>Origin:</strong> ${parsedData.origin}</div>
        <div class="breed-info-item"><strong>Care Tips:</strong> ${parsedData.careTips}</div>
        <div class="breed-info-item"><strong>Characteristics:</strong> ${parsedData.characteristics}</div>
        <div class="breed-info-item"><strong>Temperament:</strong> ${parsedData.temperament}</div>
      </div>
    `;
  } catch (error) {
    console.error("Failed to get structured cat breed info:", error);
  }
}

// Camera controls
function toggleCamera() {
  if (isCameraOpen.value) {
    isCameraOpen.value = false;
    isPhotoTaken.value = false;
    isShotPhoto.value = false;
    stopCameraStream();
  } else {
    isCameraOpen.value = true;
    createCameraElement();
  }
}

function createCameraElement() {
  isLoading.value = true;
  const constraints = { audio: false, video: true };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      isLoading.value = false;
      camera.value.srcObject = stream;
    })
    .catch(() => {
      isLoading.value = false;
      alert("Browser may not support camera access or there is an error");
    });
}

function stopCameraStream() {
  const tracks = camera.value?.srcObject?.getTracks?.();
  if (tracks) {
    tracks.forEach(track => track.stop());
  }
}

function takePhoto() {
  if (!isPhotoTaken.value) {
    isShotPhoto.value = true;
    const FLASH_TIMEOUT = 50;
    setTimeout(() => {
      isShotPhoto.value = false;
    }, FLASH_TIMEOUT);
  }

  isPhotoTaken.value = !isPhotoTaken.value;
  const context = canvas.value.getContext('2d');
  context.drawImage(camera.value, 0, 0, 450, 337.5);
}

function downloadImage() {
  const download = document.getElementById("downloadPhoto");
  const canvasData = document
    .getElementById("photoTaken")
    .toDataURL("image/jpeg")
    .replace("image/jpeg", "image/octet-stream");

  download.setAttribute("href", canvasData);
}
</script>

<template>
  <Navbar>
    <template v-slot:navbar-title>AI Recognition</template>
  </Navbar>

  <div class="page-wrapper">
    <div class="stream-layout">
      <!-- Left: Main Frame -->
      <div class="main-display">
       <h3>Webcam</h3>
        <video ref="camera" autoplay></video>
        <button class="btn camera-toggle" @click="toggleCamera" :disabled="isLoading">
          <span v-if="isLoading">Starting...</span>
          <span v-else>{{ isCameraOpen ? "Turn Off Camera" : "Turn On Camera" }}</span>
        </button>
        <br></br>
        <!-- Take Photo Button: only visible when camera is on -->
        <button v-if="isCameraOpen" class="btn" @click="takePhoto">Take Photo</button>

    
      </div>

      <!-- Right: Webcam + Chat -->
      <div class="side-panels">
        <div class="panel webcam">
        <!-- Canvas to show captured photo -->
          <canvas ref="canvas" id="photoTaken" width="450" height="337.5" style="display: block; margin-top: 1rem;"></canvas>
          <button v-if="isPhotoTaken" class="btn" @click="uploadCanvasImage" style="margin-top: 1rem;">
            Detect Cat Breed!
          </button>
        </div>
        <div class="panel live-chat">
          <h3>What is the cat breed?</h3>
          <div id="catBreedInfo">Waiting for prediction...</div>
        </div>
      </div>
    </div>

    <!-- Bottom Buttons -->
    <div class="bottom-buttons">
      <button class="btn">Generate GenAI Cat Guide</button>
    </div>
  </div>

  <BottomFooter />
</template>

<style scoped>
.page-wrapper {
  background: linear-gradient(135deg, #c1cfe6, #f8e1e1); /* light blue -> pink */
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stream-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-gap: 2rem;
  width: 100%;
  max-width: 1200px;
  align-items: start;
}

.main-display {
  background: #6982B5 ; /* purple */
  border-radius: 20px;
  padding: 1rem;
  border: 3px solid #FFFDF7; /* off white */
  color: #FFFDF7; /* off white text */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-preview {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid #FFFDF7; /* optional border for preview */
}

.side-panels {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel {
  background: #6982B5; /* dark blue */
  border: 3px solid #FFFDF7; /* off white */
  border-radius: 20px;
  color: #FFFDF7; /* off white text */
  padding: 1rem;
  text-align: center;
}

.webcam video {
  width: 100%;
  border-radius: 12px;
  border: 2px solid #99b4da; /* lighter blue border */
}

.btn {
  background:  #806E83  ;
  color: #FFFDF7; /* off white text */
  border: 2px solid #FFFDF7; /* off white border */
  padding: 0.75rem 1.5rem;
  border-radius: 30px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn:hover {
  background: #FFFDF7; /* off white hover bg */
  color: #806E83; /* purple text on hover */
}

.camera-toggle {
  margin-top: 1rem;
  border-color: #f8e1e1; /* pink */
  color: #f8e1e1; /* pink text */
}

.camera-toggle:hover {
  background: #f8e1e1; /* pink hover bg */
  color: #6982B5; /* dark blue text */
}

.bottom-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

/* Optional: cat breed info cards */
#catBreedInfo, #catBreedGenAiInfo {
  background: #99b4da; /* lighter blue for info panel */
  color: #FFFDF7;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
}

</style>
