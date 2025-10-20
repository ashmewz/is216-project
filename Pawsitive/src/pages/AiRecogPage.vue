<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import { onMounted, ref } from 'vue';
import { Client } from "@gradio/client";


//file input
const preview = ref(null);
const fileInput = ref(null);
const selectedFile = ref(null);

//camera
const isCameraOpen = ref(false)
const isPhotoTaken = ref(false)
const isShotPhoto = ref(false)
const isLoading = ref(false)
const link = ref('#')
const camera = ref(null)
const canvas = ref(null)


//file input change
function onFileChange(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    selectedFile.value = files[0];
    preview.value.src = URL.createObjectURL(selectedFile.value);
  }
}


//calling cat breed identifier API
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

//upload button to convert camera screenshot for uploadFile()
function uploadCanvasImage() {
  if (!canvas.value) {
    alert("No photo captured yet!");
    return;
  }

  canvas.value.toBlob((blob) => {
    if (!blob) return;

    // Convert the blob into a File object (optional, can also use blob directly)
    const file = new File([blob], "captured-photo.jpg", { type: "image/jpeg" });

    // Set the selectedFile to this file
    selectedFile.value = file;

    // Now call your existing uploadFile function
    uploadFile();
  }, "image/jpeg");
}



//Gemini AI Guidebook (To be migrated over to GEN AI Guidebook page)
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

//camera
function toggleCamera() {
  
  //close camera
  if (isCameraOpen.value) {
    isCameraOpen.value = false;
    isPhotoTaken.value = false;
    isShotPhoto.value = false;
    stopCameraStream()
  }
  //start camera
  else {
    isCameraOpen.value = true;
    createCameraElement()
  }

}

//starts camera
function createCameraElement() {
  isLoading.value = true

  const constraints = {
    audio: false,
    video: true
  }

  navigator.mediaDevices
  .getUserMedia(constraints)
  .then(stream => {
    isLoading.value = false
    camera.value.srcObject = stream
  })
  .catch(()=> {
    isLoading.value = false;
    alert("Browser may not support camera access or there is an error")
  })
}

//stops camera
function stopCameraStream() {{
  const tracks = camera.value?.srcObject?.getTracks?.()
  if (tracks) {
    tracks.forEach(track => track.stop())
  }
}}

//take a photo
function takePhoto() {
  if (!isPhotoTaken.value) {
    isShotPhoto.value = true
    const FLASH_TIMEOUT = 50
    setTimeout(() => {
      isShotPhoto.value = false
    }, FLASH_TIMEOUT)
  }

  isPhotoTaken.value = !isPhotoTaken.value
  const context = canvas.value.getContext('2d')
  context.drawImage(camera.value,0,0,450,337.5)
}

//download feature
function downloadImage() {
  const download = document.getElementById("downloadPhoto")
  const canvasData = document
  .getElementById("photoTaken")
  .toDataURL("image/jpeg")
  .replace("image/jpeg", "image/octet-stream")

  download.setAttribute("href", canvasData)
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


<div class="main">
  <div id="app" class="web-camera-container">
      <div class="inner-container">
        <div class="camera-button">
      <button type="button" class="button is-rounded" :class="{ 'is-primary' : !isCameraOpen, 'is-danger' : isCameraOpen}" @click="toggleCamera">
        <span v-if="!isCameraOpen">Open Camera</span>
        <span v-else>Close Camera</span>
    </button>
  </div>
  

  
  <div v-if="isCameraOpen" v-show="!isLoading" class="camera-box" :class="{ 'flash' : isShotPhoto }">
    
    <div class="camera-shutter" :class="{'flash' : isShotPhoto}"></div>
      
    <video v-show="!isPhotoTaken" ref="camera" :width="450" :height="337.5" autoplay></video>
    
    <canvas v-show="isPhotoTaken" id="photoTaken" ref="canvas" :width="450" :height="337.5"></canvas>
  </div>
  
  <div v-if="isCameraOpen && !isLoading" class="camera-shoot">
    <div v-if="isPhotoTaken && isCameraOpen" class="camera-download">
    <a id="downloadPhoto" download="my-photo.jpg" class="btn btn-primary" role="button" @click="downloadImage">
      Download
    </a>
  </div>
    <button type="button" class="button" @click="takePhoto">
      <img src="https://img.icons8.com/material-outlined/50/000000/camera--v2.png">
    </button>
     <div v-if="isPhotoTaken && isCameraOpen" class="camera-download">
    <a id="uploadPhoto" class="btn btn-primary" role="button" @click="uploadCanvasImage">
      Upload
    </a>
  </div>
  </div>
  </div>  
</div>
</div>
  <BottomFooter></BottomFooter>
</template>

<style scoped>
body {
  display: block; /* reset if it was flex */
}

/* open / close camera button */
.button.is-rounded {
    border-radius: 290486px;
    padding-left: 1em;
    padding-right: 1em;
}

.button.is-primary {
    background-color: #00d1b2;
    border-color: transparent;
    color: #fff;
}

.button.is-danger {
    background-color: #ff3860;
    border-color: transparent;
    color: #fff;
}

.web-camera-container .camera-button {
  margin-bottom: 2rem;
  margin-top: 2rem;
}
/* end of open / close camera button */


/* outer camera container */
.web-camera-container {
  width: 100%;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* inner camera container black background */
.inner-container {
  width: 600px;           
  background-color: black;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  margin: 0 auto;          
}

/* camera button icon */
.web-camera-container .camera-shoot button {
  height: 60px;
  width: 60px;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
}

.web-camera-container .camera-shoot button img {
  height: 35px;
  object-fit: cover;
}

/* end of camera button icon */

/* row styling for camera button icon and download button */
.camera-shoot {
  display: inline-flex;           
  gap: 1rem;               
  align-items: center;     
}

.camera-shoot .button {
  display: inline-flex;    
  align-items: center;
  justify-content: center;
}

.web-camera-container .camera-shoot {
  margin: 1rem 0;
}
/* end of row styling for camera button icon and download button */





/* .web-camera-container .camera-box .camera-shutter {
  opacity: 0;
  width: 450px;
  height: 337.5px;
  background-color: #fff;
  position: absolute;
} */

/* .web-camera-container .camera-box .camera-shutter.flash {
  opacity: 1;
} */


/* .web-camera-container .camera-loading {
  overflow: hidden;
  height: 100%;
  position: absolute;
  width: 100%;
  min-height: 150px;
  margin: 3rem 0 0 -1.2rem;
}


.web-camera-container .camera-loading ul {
  height: 100%;
  position: absolute;
  width: 100%;
  z-index: 999999;
  margin: 0;
}


.web-camera-container .camera-loading .loader-circle {
  display: block;
  height: 14px;
  margin: 0 auto;
  top: 50%;
  left: 100%;
  transform: translateY(-50%) translateX(-50%);
  position: absolute;
  width: 100%;
  padding: 0;
}


.web-camera-container .camera-loading .loader-circle li {
  display: block;
  float: left;
  width: 10px;
  height: 10px;
  line-height: 10px;
  padding: 0;
  position: relative;
  margin: 0 0 0 4px;
  background: #999;
  animation: preload 1s infinite;
  top: -50%;
  border-radius: 100%;
} */


/* .web-camera-container .camera-loading .loader-circle li:nth-child(2) {
  animation-delay: .2s;
}


.web-camera-container .camera-loading .loader-circle li:nth-child(3) {
  animation-delay: .4s;
} */

/* Keyframes stay the same */
/* @keyframes preload {
  0% {
    opacity: 1;
  }
  50% {
    opacity: .4;
  }
  100% {
    opacity: 1;
  }
} */


</style>