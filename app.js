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
        io.emit("frame",Buffer.from(data, 'base64').toString());
    });
    socket.on("disconnect", () => {
      console.log("disconnect")
    });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
