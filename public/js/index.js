const { image_to_text } = require("@xenova/transformers");
const imagePath = "parkingranger.jpg";
const caption = image_to_text(imagePath, model="Salesforce/blip-image-captioning-base");
console.log(caption,"caption")
const socket = io("/");
let detectingObjects=false

socket.on("frame", (data) => {
let img=document.getElementById('robotcam')
img.src = `data:image/jpeg;base64,${data}`
});
