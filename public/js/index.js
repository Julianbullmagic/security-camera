const socket = io("/");

let detectingObjects=false

socket.on("frame", (data) => {
let img=document.getElementById('robotcam')
img.src = `${data}`
detect(img)
});
