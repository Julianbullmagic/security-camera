const { createServer } = require("http");
const express = require("express");
const { Server } = require("socket.io");
const tf = require('@tensorflow/tfjs-node');
const cocoSsd = require('@tensorflow-models/coco-ssd');

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;
app.use(express.static("public"));

let model;

async function loadModel() {
  model = await cocoSsd.load();
  console.log("COCO-SSD model loaded");
}

async function performObjectDetection(base64ImageData) {
  const buffer = Buffer.from(base64ImageData, 'base64');
  const image = await tf.node.decodeImage(buffer);
  const predictions = await model.detect(image);
  image.dispose();
  return predictions;
}

io.on("connection", (socket) => {
  loadModel().then(() => {
    console.log(socket.id, "connection");

    socket.on("frame", async (data) => { // Added async here
      const predictions = await performObjectDetection(data); // Use data instead of base64ImageData
      console.log("Object detection predictions:", predictions);
      io.emit("frame", data);
    });

    socket.on("disconnect", () => {
      console.log("disconnect");
    });
  });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
