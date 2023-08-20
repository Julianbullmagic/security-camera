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

let modelPromise = cocoSsd.load();

async function performObjectDetection(imageBase64) {
  const imageBuffer = Buffer.from(imageBase64, 'base64');
  const model = await modelPromise;
  const image = tf.node.decodeImage(imageBuffer);
  const predictions = await model.detect(image);
  image.dispose();
  return predictions;
}

io.on("connection", (socket) => {
  console.log(socket.id, "connection");
  socket.on("frame", async (data) => {
    const predictions = await performObjectDetection(data);
    console.log("Object detection predictions:", predictions);
    io.emit("frame", { base64ImageData: data, predictions });
  });

  socket.on("disconnect", () => {
    console.log("disconnect");
  });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
