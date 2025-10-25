<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import { onMounted, ref } from 'vue';
import { Client } from "@gradio/client";
import { useCatStore } from '@/stores/catDataStore'
import { useRouter } from 'vue-router'

const catStore = useCatStore()


//Routes to AI Guide Book Passing the image
const router = useRouter()
function goToGuidebook() {
  if (!catStore.imageData || !catStore.breedData) {
    alert('Please run the prediction first!')
    return
  }

  router.push({ name: 'AiGuideBook' })
}

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
  if (!selectedFile.value && !canvas.value) {
    alert('Please select or capture an image first.')
    return
  }

  const imageBlob = selectedFile.value || await new Promise((resolve) =>
    canvas.value.toBlob(resolve, 'image/jpeg')
  )

  try {
    const client = await Client.connect("kevansoon/cat-breed-detector")
    const result = await client.predict("/predict", { image: imageBlob })

    if (result.data) {
      console.log("Prediction result:", result.data)

      // Store data in Pinia
      catStore.setCatData(canvas.value.toDataURL('image/jpeg'), result.data)
      document.getElementById("catBreedInfo").innerText = result.data;

      
    }
  } catch (error) {
    alert('Upload and prediction failed.')
    console.error(error)
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

  <div class="page-wrapper background">
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
            <!-- Cat Spinner UI-->
             
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
          
           <!-- END: Cat Spinner UI-->
        </div>
      </div>
    </div>

    <!-- Bottom Buttons -->
    <div class="bottom-buttons">
      <button class="btn" @click="goToGuidebook" >Generate GenAI Cat Guide</button>
    </div>
  </div>

  <BottomFooter />
</template>

<style scoped>
.page-wrapper {
  /* background: linear-gradient(135deg, #c1cfe6, #f8e1e1); */
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

.panel.live-chat {
  display: flex;
  flex-direction: column;
  align-items: center; /* centers horizontally */
  justify-content: center; /* centers vertically */
  min-height: 350px; /* optional: ensures there's enough height for centering */
  position: relative; /* ensures it doesn’t affect other positioning */
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

#information {
position: fixed;
right: 2em;
bottom: 2em;
font-size: 14px;
font-family: 'Open Sans Condensed', sans-serif;
text-align: right;
}
#information a {
color: #9e6024;
text-decoration: none;
}
#information p {
margin: 0;
margin-top: 0.5em;
}

/* #wrapper {
position: absolute;
top: 50%;
left: 50%;
width: 300px;
height: 300px;
padding: 50px;
background: rgb(230, 220, 220);
transform: translate(-50%, -50%);
} */

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
margin-top: 1rem; 
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
background: #6982B5;
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
background: #6982B5;
}


/* Responsive Design for Mobile Devices */
@media (max-width: 768px) {
  .stream-layout {
    grid-template-columns: 1fr; /* stack main + side panels */
    grid-gap: 1rem;
  }

  .main-display,
  .panel {
    width: 100%;
    padding: 1rem;
  }

  video,
  canvas {
    width: 100% !important; /* make sure they don’t overflow */
    height: auto;
    border-radius: 12px;
  }

  #cat {
    width: 180px;
    height: 180px;
  }

  .bottom-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .btn {
    width: 100%;
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
  }

  .page-wrapper {
    padding: 1rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  #catBreedInfo, #catBreedGenAiInfo {
    font-size: 0.9rem;
  }
}

/* Extra small devices */
@media (max-width: 480px) {
  #cat {
    width: 140px;
    height: 140px;
  }

  .panel.live-chat {
    min-height: 250px;
  }

  h3 {
    font-size: 1rem;
  }
}





</style>
