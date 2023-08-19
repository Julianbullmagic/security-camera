import { HfInference } from 'https://cdn.jsdelivr.net/npm/@huggingface/inference@2.6.1/+esm';
// import * as cocoSsd from 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@3.0.0/dist/coco-ssd.esm.js';
// import * as yolo from 'https://cdn.jsdelivr.net/npm/yolov5-tfjs@1.2.0/dist/esm/index.js';
let HF_ACCESS_TOKEN = "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";
const inference = new HfInference(HF_ACCESS_TOKEN);

let cocoSsdModel;

async function loadModels() {
  // Load the COCO-SSD model
  cocoSsdModel = await cocoSsd.load();
  console.log("COCO-SSD model loaded");
}

// Load the models when the page is ready
document.addEventListener("DOMContentLoaded", () => {
  loadModels();
});

// Load the YOLOv5 model
// yolo.load().then((model) => {
//   yoloModel = model;
//   console.log("YOLOv5 model loaded");
// });

async function performObjectDetection(model, imageElement) {
  // Perform object detection on the image using the provided model
  const predictions = await model.detect(imageElement);
  return predictions;
}

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
}
let img = document.getElementById('robotcam');
img.src = `data:image/jpeg;base64,${data}`;
img.onload = async () => {
if (cocoSsdModel) {
const cocoSsdPredictions = await performObjectDetection(cocoSsdModel, img);
console.log("COCO-SSD predictions:", cocoSsdPredictions);
// Handle COCO-SSD predictions, e.g., draw bounding boxes on the image
}

// if (yoloModel) {
// const yoloPredictions = await performObjectDetection(yoloModel, img);
// console.log("YOLOv5 predictions:", yoloPredictions);
// // Handle YOLOv5 predictions, e.g., draw bounding boxes on the image
}
  })();
});
