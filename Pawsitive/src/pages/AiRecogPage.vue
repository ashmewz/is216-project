<script setup>
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'
import { ref, watch } from 'vue'
import { Client } from "@gradio/client"
import { useCatStore } from '@/stores/catDataStore'
import { useRouter } from 'vue-router'

const catStore = useCatStore()
const router = useRouter()

// --- Reactive States ---
const selectedFile = ref(null)
const imagePreview = ref('') // Displays preview (upload or photo)
const isCameraOpen = ref(false)
const isPhotoTaken = ref(false)
const isLoading = ref(false)
const camera = ref(null)
const canvas = ref(null)
const breedResult = ref('Waiting for prediction...')

// --- Watch for file change ---
watch(selectedFile, async (newFile) => {
  if (newFile) {
    imagePreview.value = URL.createObjectURL(newFile)
    await identifyBreed(newFile)
  }
})

// --- Identify Cat Breed ---
async function identifyBreed(imageBlob) {
  try {
    isLoading.value = true
    const client = await Client.connect("kevansoon/cat-breed-detector")
    const result = await client.predict("/predict", { image: imageBlob })
    if (result.data) {
      console.log("Prediction result:", result.data)
      breedResult.value = result.data
      catStore.setCatData(imageBlob, result.data)
    }
  } catch (err) {
    console.error("Prediction failed:", err)
    breedResult.value = "Upload or prediction failed."
    alert("Failed to process the image.")
  } finally {
    isLoading.value = false
  }
}

// --- Handle File Upload ---
function onFileChange(event) {
  const file = event.target.files[0]
  if (file) selectedFile.value = file
}

// --- Toggle Camera ---
async function toggleCamera() {
  try {
    if (!isCameraOpen.value) {
      isLoading.value = true
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      camera.value.srcObject = stream
      isCameraOpen.value = true
    } else {
      const stream = camera.value.srcObject
      if (stream) stream.getTracks().forEach(track => track.stop())
      isCameraOpen.value = false
    }
  } catch (err) {
    console.error("Camera access denied:", err)
    alert("Unable to access camera.")
  } finally {
    isLoading.value = false
  }
}

// --- Take Photo ---
function takePhoto() {
  if (!camera.value || !canvas.value) return
  const context = canvas.value.getContext('2d')
  context.drawImage(camera.value, 0, 0, canvas.value.width, canvas.value.height)

  // Convert canvas to file
  canvas.value.toBlob(blob => {
    if (blob) {
      const photoFile = new File([blob], "captured-photo.jpg", { type: "image/jpeg" })
      selectedFile.value = photoFile
      isPhotoTaken.value = true
    }
  }, "image/jpeg")
}

// --- Navigate to Guidebook ---
function goToGuidebook() {
  router.push("/cat-guide")
}
</script>

<template>
  <Navbar>
    <template #navbar-title>AI Recognition</template>
  </Navbar>

  <div class="page-wrapper background">
    <div class="stream-layout">
      <!-- ===== Left Panel ===== -->
      <div class="main-display">
        <h3>Upload or Take a Photo</h3>

        <!-- Upload Area -->
        <div
          class="drag-drop-area"
          @click="$refs.fileInput.click()"
        >
          <p v-if="!imagePreview">Click to upload or use camera below</p>
          <img v-if="imagePreview" :src="imagePreview" alt="Preview" class="preview-img" />
        </div>

        <!-- Hidden Input -->
        <input
          type="file"
          accept="image/*"
          ref="fileInput"
          @change="onFileChange"
          style="display:none"
        />

        <!-- Camera Controls -->
        <div class="camera-section mt-4">
          <h3>Camera</h3>
          <video ref="camera" autoplay v-show="isCameraOpen" class="camera-feed"></video>

          <button class="btn camera-toggle mt-2" @click="toggleCamera" :disabled="isLoading">
            <span v-if="isLoading">Loading...</span>
            <span v-else>{{ isCameraOpen ? "Turn Off Camera" : "Turn On Camera" }}</span>
          </button>

          <button v-if="isCameraOpen" class="btn mt-2" @click="takePhoto">📸 Take Photo</button>
        </div>
      </div>

      <!-- ===== Right Panel ===== -->
      <div class="side-panels">
        <div class="panel webcam">
          <canvas ref="canvas" width="450" height="337.5" class="photo-canvas"></canvas>

          <h3 class="mt-3 mb-2">Cat Breed Prediction</h3>
          <div id="catBreedInfo" class="breed-info">
            {{ isLoading ? "Detecting breed..." : breedResult }}
          </div>
        </div>
      </div>
    </div>

    <!-- Generate Button -->
    <div class="bottom-buttons">
      <button class="btn" @click="goToGuidebook">Generate GenAI Cat Guide</button>
    </div>
  </div>

  <BottomFooter />
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.stream-layout {
  display: flex;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
}

.main-display {
  flex: 1;
  text-align: center;
}

.drag-drop-area {
  border: 2px dashed #99b4da;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.drag-drop-area:hover {
  background: #eef4ff;
}

.preview-img {
  max-width: 100%;
  border-radius: 12px;
  border: 2px solid #99b4da;
  margin-top: 0.5rem;
}

.camera-feed {
  width: 100%;
  max-width: 450px;
  border-radius: 12px;
  border: 2px solid #99b4da;
}

.photo-canvas {
  display: block;
  margin-top: 1rem;
  border-radius: 8px;
  border: 2px solid #99b4da;
}

.breed-info {
  padding: 1rem;
  background: #f6f8ff;
  border-radius: 8px;
  font-weight: 500;
}

.btn {
  background: #99b4da;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn:hover {
  opacity: 0.8;
}
.bottom-buttons {
  margin-top: 1rem;
}
</style>
