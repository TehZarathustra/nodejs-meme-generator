# nodejs-meme-generator
Nodejs promise-based meme generator, it takes an image as url and top/bottom text to generate meme as Buffer

## Installation
```
$ npm install nodejs-meme-generator
```
or
```
$ yarn add nodejs-meme-generator
```

## Requirements
Unless previously installed you'll need Cairo and Pango
```
brew install pkg-config cairo pango libpng jpeg giflib
```

## Example
```javascript
const express = require('express');
const app = express();
const PORT = 3001;
const memeLib = require('nodejs-meme-generator');

const memeGenerator = new memeLib({
  canvasOptions: { // optional
    canvasWidth: 500,
    canvasHeight: 500
  },
  fontOptions: { // optional
    fontSize: 46,
    fontFamily: 'impact',
    lineHeight: 2
  }
});

app.get('/', function (req, res) {
  memeGenerator.generateMeme({
      // you can use either topText or bottomText
      // or both of them at the same time
      topText: 'Meme',
      bottomText: 'Generator',
      url: 'https://i.imgur.com/7FHoSIG.png'
    })
    .then(function(data) {
      res.set('Content-Type', 'image/png');
      res.send(data);
    })
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
```
The `url` field can be a web link (e.g. `url: 'https://i.imgur.com/7FHoSIG.png'`) or a local image file (e.g. `url: 'img/folder/image.jpg'`)
