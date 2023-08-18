const { createServer } = require("http");
const express = require("express");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;
app.use(express.static("public"));

let activeUsers = [];
let robot=""
io.on("connection", (socket) => {
  console.log(socket.id,"connection")
    socket.on("frame", (data) => {
        io.emit("frame",data);
    });
    socket.on("disconnect", () => {
      console.log("disconnect")
    });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));


module.exports = {
  image_to_text: function(imagePath, model) {
    return require("@xenova/transformers").image_to_text(imagePath, model);
  }
};

// Import the module
const imageToText = require("./image-to-text");
const imagePath = "parkingranger.jpg";

const caption = image_to_text(imagePath, model="Salesforce/blip-image-captioning-base");

console.log(caption);
