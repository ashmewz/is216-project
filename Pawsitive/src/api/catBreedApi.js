import { Client } from "@gradio/client";

export async function predictCatBreedFromPublicImage(imagePath) {
  // Fetch image from public folder as Blob
  const response = await fetch(imagePath); // e.g., "/images/bus.png"
  const imageBlob = await response.blob();

						
  const client = await Client.connect("kevansoon/cat-breed-detector");
  const result = await client.predict("/predict", { 
          image: imageBlob, 
  });

  return result.data
}


export async function runPrediction(catFilePath) {
    const result = await predictCatBreedFromPublicImage(catFilePath);
    console.log(result);
    if (catFilePath == "../../../cat1.png") {
        document.getElementById('breed-1').innerHTML = result;
    }
    else {
        document.getElementById('breed-2').innerHTML = result;
    }

}
