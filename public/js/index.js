import { HfInference } from 'https://cdn.jsdelivr.net/npm/@huggingface/inference@2.6.1/+esm';

let HF_ACCESS_TOKEN = "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";
const inference = new HfInference(HF_ACCESS_TOKEN);

// Convert base64 image string to caption
async function getCaption(base64Image) {
  const binaryData = atob(base64Image);
  const byteArray = new Uint8Array(binaryData.length);
  for (let i = 0; i < binaryData.length; i++) {
    byteArray[i] = binaryData.charCodeAt(i);
  }
  const imageBlob = new Blob([byteArray.buffer], { type: 'image/jpeg' });

  const text = await inference.imageToText({
    data: imageBlob,
    model: 'Salesforce/blip-image-captioning-base',
  });

  return text;
}

const socket = io("/");
let captionPromise = Promise.resolve(); // Initialize with a resolved promise

socket.on("frame", async (data) => {
  // Wait for the previous caption processing to complete before starting the next one
  await captionPromise;

  // Process the caption
  captionPromise = (async () => {
    const caption = await getCaption(data);
    console.log(caption);

    let img = document.getElementById('robotcam');
    img.src = `data:image/jpeg;base64,${data}`;
  })();
});
