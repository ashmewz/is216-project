<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import { onMounted, ref } from 'vue';
import { Client } from "@gradio/client";


const video = ref(null);
onMounted(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (video.value) {
      video.value.srcObject = stream;
    }
  } catch (err) {
    alert('Camera access denied or not supported.');
  }
});

// File input and image display refs
const fileInput = ref(null);
const preview = ref(null);
const selectedFile = ref(null);

// Listen for file selection changes
function onFileChange(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    selectedFile.value = files[0];
    // Preview the image using object URL
    preview.value.src = URL.createObjectURL(selectedFile.value);
  }
}

async function uploadFile() {
  if (!selectedFile.value) {
    alert('Please select a file first.');
    return;
  }

  // Convert selected file to Blob (already a Blob)
  const imageBlob = selectedFile.value;

  try {
    // Connect to your client
    const client = await Client.connect("kevansoon/cat-breed-detector");
    // Predict using your API endpoint, passing the image Blob
    const result = await client.predict("/predict", { image: imageBlob });

    // Handle the response, update preview with possibly a returned image URL or prediction data
    if (result.data) {
    
      // Or handle prediction result as needed
      console.log("Prediction result:", result.data);
      document.getElementById("catBreedInfo").innerText = result.data

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
    contents: [
      {
        parts: [
          {
            text: promptText
          }
        ]
      }
    ],
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
        required: ["name", "origin", "characteristics", "temperament", "careTips"],
        propertyOrdering: ["name", "origin", "characteristics", "temperament", "careTips"]
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

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
      const jsonString = data.candidates[0].content.parts[0].text;

  // Parse the JSON string to an object
    const parsedData = JSON.parse(jsonString);

    console.log(parsedData);
    // Now you can access properties like
    console.log(parsedData.name);
    console.log(parsedData.origin);
    console.log(parsedData.careTips);
    console.log(parsedData.characteristics);
    console.log(parsedData.temperament);

    const descriptionBox = document.getElementById("catBreedGenAiInfo");
    descriptionBox.innerHTML = 
    `
    <br>
    Gen AI GuideBook Response
    <br>
    <br>
    Name: ${parsedData.name} <br>
    <br>
    Origin: ${parsedData.origin} <br>
    <br>
    Care Tips: ${parsedData.careTips} <br>
    <br>
    Characteristics ${parsedData.characteristics} <br>
    <br>
    Temperament: ${parsedData.temperament}
    `


    return parsedData; // optionally return the parsed data

  } catch (error) {
    console.error("Failed to get structured cat breed info:", error);
    throw error;
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
      </div>

      <div>
        <img ref="preview" alt="Cat Preview" style="height: 200px; width: 200px;"/>
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