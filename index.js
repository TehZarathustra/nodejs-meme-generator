'use strict';

const fs = require('fs');
const request = require('request').defaults({encoding: null});
const Canvas = require('canvas');

/**
 * Meme class
 * 
 * @constructor
 * @param {Object} userConfig {canvasOptions, fontOptions}
 */
function MemeGenerator (userConfig = {}) {
	const {canvasOptions, fontOptions} = userConfig;
	const config = Object.assign({
		canvasOptions: {
			canvasWidth: 500,
			canvasHeight: 500
		},
		fontOptions: {
			fontFamily: 'impact',
			fontSize: 46,
			lineHeight: 2
		}
	}, canvasOptions ? {canvasOptions: canvasOptions} : null,
	fontOptions ? {fontOptions: fontOptions} : null);

	this.setCanvas(config.canvasOptions);
	this.setFontOptions(config.fontOptions);
}

/**
 * 
 * @param {Object} options {canvasWidth, canvasHeight}
 */
MemeGenerator.prototype.setCanvas = function (options) {
	const {canvasWidth, canvasHeight} = options;
	const canvas = new Canvas(canvasWidth, canvasHeight);
	const Image = Canvas.Image;

	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');
	this.canvasImg = new Image();

	this.ctx.lineWidth  = 2;
	this.ctx.strokeStyle = 'black';
	this.ctx.mutterLine = 2;
	this.ctx.fillStyle = 'white';
	this.ctx.textAlign = 'center';
}

/**
 * 
 * @param {Object} options {fontFamily, fontSize, lineHeight}
 */
MemeGenerator.prototype.setFontOptions = function (options) {
	const {fontFamily, fontSize, lineHeight} = options;

	this.fontFamily = fontFamily;
	this.fontSize = fontSize;
	this.lineHeight = lineHeight;
}

/**
 * Set meme canvas
 * 
 * @param {Object} options {topText, bottomText, url}
 */
MemeGenerator.prototype.setImageOptions = function (options) {
	const {topText, bottomText, url} = options;

	this.url = url;
	this.topText = topText;
	this.bottomText = bottomText;
}

/**
 * Set meme canvas
 * 
 * @param {Object} imageOptions {topText, bottomText, url}
 */
MemeGenerator.prototype.generateMeme = function (imageOptions) {
	this.setImageOptions(imageOptions);

	return new Promise((resolve, reject) => {
		if (fs.existsSync(this.url)) {
			this.canvasImg.src = this.url;

			this.calculateCanvasSize();
			this.drawMeme();

			resolve(this.canvas.toBuffer());
		}
		else
		request.get(this.url, (error, response, body) => {
			if (!error && response.statusCode === 200) {
				this.canvasImg.src = new Buffer(body);

				this.calculateCanvasSize();
				this.drawMeme();

				resolve(this.canvas.toBuffer());
			} else {
				reject(new Error('The image could not be loaded.'));
			}
		});
	});
}

MemeGenerator.prototype.calculateCanvasSize = function () {
	const {canvas, canvasImg} = this;

	canvas.height = canvasImg.height / canvasImg.width * canvas.width;

	this.memeWidth = canvas.width;
	this.memeHeight = canvas.height;
}

MemeGenerator.prototype.drawMeme = function () {
	const {
		canvas,
		canvasImg,
		memeWidth,
		memeHeight,
		topText,
		bottomText,
		fontSize,
		fontFamily,
		lineHeight,
		ctx,
		wrapText
	} = this;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(canvasImg, 0, 0, memeWidth, memeHeight);

	let x = memeWidth / 2;
	let y;

	if (topText) {
		y = 0;
		this.ctx.textBaseline = 'top';
		wrapText(ctx, topText, x, y, memeWidth, lineHeight, false, fontSize, fontFamily);
	}

	if (bottomText) {
		y = memeHeight;
		this.ctx.textBaseline = 'bottom';
		wrapText(ctx, bottomText, x, y, memeWidth, lineHeight, true, fontSize, fontFamily);
	}
}

/**
 * 
 * @param {Object} context
 * @param {String} text
 * @param {Number} x
 * @param {Number} y
 * @param {Number} maxWidth
 * @param {Number} lineHeightRatio
 * @param {Boolean} fromBottom
 * @param {Number} fontSize
 * @param {String} fontFamily
 */
MemeGenerator.prototype.wrapText = function (
	context, text, x, y, maxWidth, lineHeightRatio, fromBottom, fontSize, fontFamily) {

	if (!text) {
		return;
	}

	context.font = `bold ${fontSize}pt ${fontFamily}`;

	const pushMethod = fromBottom ? 'unshift' : 'push';
	const lineHeight = lineHeightRatio * fontSize;

	let lines = [];
	let line = '';
	let words = text.split(' ');

	for (let n = 0; n < words.length; n++) {
		const testLine = line + ' ' + words[n];
		const metrics = context.measureText(testLine);
		const testWidth = metrics.width;

		if (testWidth > maxWidth) {
			lines[pushMethod](line);
			line = words[n] + ' ';
		} else {
			line = testLine;
		}
	}

	lines[pushMethod](line);

	if (lines.length > 2) {
		MemeGenerator.prototype.wrapText(
			context, text, x, y, maxWidth, lineHeightRatio, fromBottom, fontSize - 10, fontFamily);
	} else {
		for (let k in lines) {
			if (fromBottom) {
				context.strokeText(lines[k], x, y - lineHeight * k);
				context.fillText(lines[k], x, y - lineHeight * k);
			} else {
				context.strokeText(lines[k], x, y + lineHeight * k);
				context.fillText(lines[k], x, y + lineHeight * k);
			}
		}
	}
}

module.exports = MemeGenerator;
