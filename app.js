const { createServer } = require("http");
const express = require("express");
const { Server } = require("socket.io");
const tf = require('@tensorflow/tfjs-node');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const ffmpeg = require('ffmpeg');
const cloudinary = require('cloudinary');
require('dotenv').config();
const nodemailer = require('nodemailer');
const frameRate = 0.25;

cloudinary.config({
  cloud_name: 'dfksh5mnb',
  api_key: '797557927636935',
  api_secret: process.env.CLOUDINARYSECRET
});
let images = [];
const outputFile = 'output.mp4';

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;
app.use(express.static("public"));
let modelPromise = cocoSsd.load();
let personviewed=false

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
    let thereisaperson=false
    for (prediction of predictions){
      if(prediction.class=="person"){
        thereisaperson=true
      }
    }
    if (thereisaperson){
      if(personviewed=false){
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAILEMAIL,
            pass: process.env.GMAILPASSWORD
          }
        })
        let mailOptions = {
          from: process.env.GMAILEMAIL,
          to: process.env.GMAILEMAIL,
          subject:"Person Viewed",
          text: `A person has entered your area.`
        };

          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.error(error);
            } else {
              console.log('Email sent: ' + info.response)
            }
          })

      }
      personviewed=true
       if(images.length<30){
        images.push(data)
        console.log(images.length,"images length")
      }
      if(images.length>=30){
        ffmpeg.concat(images, outputFile, {
          frameRate: frameRate
        });
        images=[]
        cloudinary.uploader.upload(outputFile, (error, result) => {
          if (error) {
            console.log(error);
          } else {
            console.log('Video uploaded successfully');
          }
        });
      }
    }
    io.emit("frame", { base64ImageData: data, predictions });
  });

  socket.on("disconnect", () => {
    console.log("disconnect");
  });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
