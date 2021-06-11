'use strict';

const request = require('request').defaults({encoding: null});
const { registerFont, createCanvas, loadImage } = require('canvas')

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
			fontFamily: 'Impact',
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
	registerFont('impact.ttf', { family: 'Impact' })
	const canvas = createCanvas(canvasWidth, canvasHeight)

	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');

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
MemeGenerator.prototype.generateMeme = async function (imageOptions, callback) {
	this.setImageOptions(imageOptions);
	this.canvasImg = await loadImage(this.url)
	this.calculateCanvasSize();
	this.drawMeme();

	return callback(this.canvas.toBuffer());
}

MemeGenerator.prototype.calculateCanvasSize = function () {
	const {canvas} = this;
	canvas.height = canvas.height / canvas.width * canvas.width;
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

	this.ctx.lineWidth  = 2;
	this.ctx.strokeStyle = '#000';
	this.ctx.mutterLine = 2;
	this.ctx.fillStyle = '#fff';
	this.ctx.textAlign = 'center';

	if (topText) {
		y = 0;
		this.ctx.textBaseline = 'top';
		wrapText(this.ctx, topText, x, y, memeWidth, lineHeight, false, fontSize, fontFamily);
	}

	if (bottomText) {
		y = memeHeight;
		this.ctx.textBaseline = 'bottom';
		wrapText(this.ctx, bottomText, x, y, memeWidth, lineHeight, true, fontSize, fontFamily);
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

	context.font = `bold ${fontSize}pt "${fontFamily}"`;

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
