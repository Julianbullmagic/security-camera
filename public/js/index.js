const socket = io("/");

let detectingObjects=false

socket.on("frame", (data) => {
  console.log(data)
let img=document.getElementById('robotcam')
img.src = `data:image/jpeg;base64,${data}`
});
