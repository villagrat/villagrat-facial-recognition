const express = require('express');
const fs = require('fs');
const PImage = require('pureimage');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(cors());

// Create the Service Object
// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient({
  keyFilename: '../villagrat-face-recognition-ea085fb34511.json',
});

// Local files usage
// const fileName = '../../../Downloads/harold.jpg';

// Send a face detection request
// Building a request to the Vision API
// we will be asking the 'images' resource to 'annotate' the image we send
// Request should be an Obj {} w/ a requests list []
// Each item @ list should have:
//    1. base 64-encoded image data
//    2. List of features we want annotated about that img
const getBase64FromUrl = async (url) => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
  });
};

// find Will Smith face
// https://images.ecestaticos.com/YWaVq4WLt4muHY0DswWN1smYUPE=/74x10:2275x2944/560x747/filters:fill(white):format(jpg)/f.elconfidencial.com%2Foriginal%2F409%2Fb87%2F445%2F409b87445e3d24fdee606a8a8e26595c.jpg

app.get('/api/detect-faces', async (req, res) => {
  // inputFile should be inside the request...
  const { content } = req.body;
  console.log('THIS IS THE CONTENT THAT ARRIVES AT THE BE: ', content);
  // get 64-encoded image data from URL
  const base64 = getBase64FromUrl(content);
  const inputFile = {
    content: base64,
    source: {
      imageUri: content,
    },
  };

  outputFile = 'highlighted-faces.png';
  const faces = await detectFaces(inputFile);
  console.log('Highlighting...');
  await highlightFaces(inputFile, faces, outerHeight, PImage);
  console.log('Finished!');
  res.send({});
});

// Make a call to the Vision API to detect the faces
async function detectFaces(inputFile) {
  const request = { image: { source: { fileName: inputFile } } };
  const results = await client.faceDetection(request);
  const faces = results[0].faceAnnotations;
  const numFaces = faces.length;
  console.log(`Found ${numFaces} face${numFaces === 1 ? '' : 's'}.`);
  return faces;
}
// The response should contain a polygon that lets us draw a rectangle around the found face!

// Draws a polygon around the faces, then saves to outputFile
async function highlightFaces(inputFile, faces, outputFile, PImage) {
  // Open the original image
  const stream = fs.createReadStream(inputFile);
  let promise;
  if (inputFile.match(/\.jpg$/)) {
    promise = PImage.decodeJPEGFromStream(stream);
  } else if (inputFile.match(/\.png$/)) {
    promise = PImage.decodePNGFromStream(stream);
  } else {
    throw new Error(`Unknown filename extension ${inputFile}`);
  }
  const img = await promise;
  const context = img.getContext('2d');
  context.drawImage(img, 0, 0, img.width, img.height, 0, 0);

  // Now draw boxes around all the faces
  context.strokeStyle = 'rgba(0,255,0,0.8)';
  context.lineWidth = '5';

  faces.forEach((face) => {
    context.beginPath();
    let origX = 0;
    let origY = 0;
    face.boundingPoly.vertices.forEach((bounds, i) => {
      if (i === 0) {
        origX = bounds.x;
        origY = bounds.y;
        context.moveTo(bounds.x, bounds.y);
      } else {
        context.lineTo(bounds.x, bounds.y);
      }
    });
    context.lineTo(origX, origY);
    context.stroke();
  });

  // Write the result to a file
  console.log(`Writing to file ${outputFile}`);
  const writeStream = fs.createWriteStream(outputFile);
  await PImage.encodePNGToStream(img, writeStream);
}

app.listen(5000, '127.0.0.1', () => {
  console.log('Listening on port 5000...');
});
