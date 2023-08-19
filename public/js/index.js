import { HfInference } from 'https://cdn.jsdelivr.net/npm/@huggingface/inference@2.6.1/+esm';
let HF_ACCESS_TOKEN="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"
const inference = new HfInference(HF_ACCESS_TOKEN);

async function getCaption(base64Image){
  // Decode the base64 string into binary data
  const binaryData = atob(base64Image);
  // Convert the binary data to a Uint8Array
  const byteArray = new Uint8Array(binaryData.length);
  for (let i = 0; i < binaryData.length; i++) {
    byteArray[i] = binaryData.charCodeAt(i);
  }
  const imageBlob = new Blob([byteArray.buffer], { type: 'image/jpeg' }); // Adjust the type if needed
  let text = await inference.imageToText({
    data: imageBlob,
    model: 'Salesforce/blip-image-captioning-base',
  });
  console.log(text)
  return text
}

const socket = io("/");
let detectingObjects=false

socket.on("frame", (data) => {
let caption=getCaption(data)
console.log(caption)
let img=document.getElementById('robotcam')
img.src = `data:image/jpeg;base64,${data}`
});
