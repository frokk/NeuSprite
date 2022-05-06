var is = {
	CtrlDown: false,
	LMouseDown: false,
	SpaceDown: false
};
var CanvasObj = {}
var canvasHolder = document.getElementById("canvasHolder");
var tool = 'b'; // B - Brush, E - Eraser, I - Ink Dropper.
var toolSize = 2; // Holds the size of brush and eraser.

CanvasObj.element = document.createElement("canvas");
CanvasObj.ctx = CanvasObj.element.getContext("2d");
CanvasObj.width = 60;
CanvasObj.height = 40;

CanvasObj.element.height = CanvasObj.height;
CanvasObj.element.width = CanvasObj.width;
canvasHolder.appendChild(CanvasObj.element);
CanvasObj.ctx.imageSmoothingEnabled = true;
CanvasObj.panzoom = panzoom(CanvasObj.element, {
	maxZoom: 50, // Maximum Zoom Size
	minZoom: 0.5, // Minimum Zoom Size
	zoomSpeed: 1, // Zoom Speed
	smoothScroll: false, // Smooth Scroll
	transformOrigin: null, // Position From Which To Tranform From.
	initialZoom: 8, // Initial Zoom Size.
	onTouch: (e) => { return false; }, // Disable Touch Response.
	onDoubleClick: (e) => { return false; }, // Disable Double Click Zoom On Element
	beforeWheel: (e) => { return !is.CtrlDown; }, // Only Zoom When Ctrl Key is Pressed.
	beforeMouseDown: function(e) {
		return !is.SpaceDown;
	}
});

// Returns A Object Containing X, Y Position Clicked On the Canvas
function getCursorPosition(e) {
	var rect = e.target.getBoundingClientRect(),
	scaleX = e.target.width / rect.width,
	scaleY = e.target.height / rect.height;

	let x = ~~((e.clientX - rect.left) * scaleX);
	let y = ~~((e.clientY - rect.top) * scaleY);
	return { x: x, y: y };
}

// Called When The Window is Closed, Do all the cleanup and stuff here.
function onWindowClose() {
	Neutralino.app.exit();
}

// Called When Websocket Connection is established.
function onNeutralinoReady() {
	Neutralino.window.setTitle("NeuSprite - " + NL_APPVERSION);
}

Neutralino.init();
Neutralino.events.on("windowClose", onWindowClose);
Neutralino.events.on("ready", onNeutralinoReady);

CanvasObj.element.addEventListener('mouseup', function(e) {
	is.MouseDown = false;
});

// Custom Color Picker Button
var colorPicker = document.getElementById("colorPicker");
var colorPickerWrapper = document.getElementById("colorPickerWrapper");
colorPicker.onchange = function() {
	colorPickerWrapper.style.backgroundColor = colorPicker.value;
}
colorPickerWrapper.style.backgroundColor = colorPicker.value;
var selectedToolText = document.getElementById("selectedTool");

Mousetrap.bind('b', function(e) {
	selectedToolText.innerText = "Brush";
	tool = 'b';
});

Mousetrap.bind('e', function(e) {
	selectedToolText.innerText = "Eraser";
	tool = 'e';
});

Mousetrap.bind('i', function(e) {
	selectedToolText.innerText = "Ink Dropper";
	tool = 'i';
});

Mousetrap.bind('space', function(e) {
	is.SpaceDown = true;
}, 'keydown');

Mousetrap.bind('space', function(e) {
	is.SpaceDown = false;
}, 'keyup');

Mousetrap.bind('ctrl', function(e) {
	is.CtrlDown = true;
}, 'keydown');

Mousetrap.bind('ctrl', function(e) {
	is.CtrlDown = false;
}, 'keyup');

function brushTool(x, y, color) {
	if (color.length != 4) return;
	CanvasObj.ctx.fillStyle = colorPicker.value;
	CanvasObj.ctx.fillRect(x, y, toolSize, toolSize);
}

function eraserTool(x, y) {
	CanvasObj.ctx.clearRect(x, y, toolSize, toolSize);
}

// Draw on Mouse Click
CanvasObj.element.addEventListener('mousedown', function(e) {
	is.MouseDown = true;
	if (is.SpaceDown == false) {
		processEvents(e);
	}
});

// Draw On Mouse Move
CanvasObj.element.addEventListener('mousemove', function(e) {
	if (is.MouseDown == true && is.SpaceDown == false) {
		processEvents(e);
	}
})

function InkDropperTool(x, y) {
	pixels = CanvasObj.ctx.getImageData(x, y, 1, 1).data;
	hexCode = ((pixels[0] << 16) | (pixels[1] << 8) | pixels[2]).toString(16)
	console.log("#" + hexCode)
}

function processEvents(event) {
	var mPos = getCursorPosition(event);
	if (tool == 'b') {
		brushTool(mPos.x, mPos.y, [255, 255, 255, 255]);
	} else if (tool == 'e') {
		eraserTool(mPos.x, mPos.y);
	} else if (tool == 'i') {
		InkDropperTool(mPos.x, mPos.y);
	}
}
