const express = require('express');
const fs = require('fs');
const PImage = require('pureimage');
const app = express();

// Create the Service Object
// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient({
  keyFilename: '../villagrat-face-recognition-ea085fb34511.json',
});

// Send a face detection request
// Uses the Vision API to detect faces in the given file
let faces = {};
app.get('/api/detect-faces', async (req, res) => {
  const [result] = await client.faceDetection(fileName);
  faces = result.faceAnnotations;
  console.log('Faces:');
  faces.forEach((face, i) => {
    console.log(`  Face #${i + 1}:`);
    console.log(`    Joy: ${face.joyLikelihood}`);
    console.log(`    Anger: ${face.angerLikelihood}`);
    console.log(`    Sorrow: ${face.sorrowLikelihood}`);
    console.log(`    Surprise: ${face.surpriseLikelihood}`);
  });

  highlightFaces(fileName, faces, 'highlighted-faces.jpg', PImage);

  res.send({});
});

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
