# nodejs-meme-generator
Nodejs promise-based meme generator, it takes an image as url and top/bottom text to generate meme as Buffer

## example
```javascript
const express = require('express');
const app = express();
const PORT = 3001;
const memeLib = require('nodejs-meme-generator');

const memeGenerator = new memeLib({
  canvasOptions: {
    canvasWidth: 500,
    canvasHeight: 500
  },
  fontOptions: {
    fontSize: 50,
    fontFamily: 'impact'
  }
});

app.get('/', function (req, res) {
  memeGenerator.generateMeme({
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
