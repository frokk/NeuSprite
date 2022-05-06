var is = {
	CtrlDown: false,
	LMouseDown: false,
	SpaceDown: false
};
var M_Pos = { x: null, y: null }
var CanvasObj = {
	element: document.getElementById("drawingCanvas"),
	ctx: document.getElementById("drawingCanvas").getContext("2d"),
	width: 60,
	height: 40,
}
CanvasObj.element.height = CanvasObj.height;
CanvasObj.element.width = CanvasObj.width;
CanvasObj.ctx.imageSmoothingEnabled = false;

var canvasPanArea = document.getElementById("canvasPanArea");
var tool = 'b'; // B - Brush, E - Eraser, I - Ink Dropper.
var toolSize = 2; // Holds the size of brush and eraser.
var zoomSize = 10;
var lastMPos = { x: null, y: null };

var PanZoom = panzoom(document.getElementById("canvasWrapper"), {
	maxZoom: 50, // Maximum Zoom Size
	minZoom: 0.5, // Minimum Zoom Size
	zoomSpeed: 0.5, // Zoom Speed
	smoothScroll: false, // Smooth Scroll
	transformOrigin: null, // Position From Which To Tranform From.
	initialZoom: zoomSize, // Initial Zoom Size.
	onTouch: (e) => { return false; }, // Disable Touch Response.
	// Disable Double Click Zoom
	onDoubleClick: (e) => { return false; },
	zoomDoubleClickSpeed: 1,
	beforeWheel: (e) => { return is.CtrlDown; }, // Only Zoom When Ctrl Key is Pressed.
	beforeMouseDown: function(e) { return !is.SpaceDown; } // Only if Space Key is not Pressed.
});

var PreviewCanvas = {
	element: document.getElementById("brushPreview"),
	ctx: document.getElementById("brushPreview").getContext("2d"),
}
PreviewCanvas.height = CanvasObj.height;
PreviewCanvas.width = CanvasObj.width;
PreviewCanvas.element.height = PreviewCanvas.height;
PreviewCanvas.element.width = PreviewCanvas.width;
PreviewCanvas.ctx.imageSmoothingEnabled = false;

// Returns A Object Containing X, Y Position Clicked On the Canvas
function UpdateCursorPosition(e) {
	var rect = e.target.getBoundingClientRect(),
	scaleX = e.target.width / rect.width,
	scaleY = e.target.height / rect.height;

	let x = ~~((e.clientX - rect.left) * scaleX);
	let y = ~~((e.clientY - rect.top) * scaleY);

	lastMPos = M_Pos;
	M_Pos = { x: x, y: y };
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

function RGB2Hex(RGB) {
	var hex = null
	if (RGB) {
		hex = (RGB[0] | 1 << 8).toString(16).slice(1) +
			  (RGB[1] | 1 << 8).toString(16).slice(1) +
			  (RGB[2] | 1 << 8).toString(16).slice(1);
	}

	return "#" + hex;
}

function previewBrush(x, y, color) {
	PreviewCanvas.ctx.clearRect(0, 0, PreviewCanvas.width, PreviewCanvas.height);
	PreviewCanvas.ctx.fillStyle = colorPicker.value;
	PreviewCanvas.ctx.fillRect(x, y, toolSize, toolSize);
}

function brushTool(x, y) {
	CanvasObj.ctx.fillStyle = colorPicker.value;
	CanvasObj.ctx.fillRect(x, y, toolSize, toolSize);
}

function eraserTool(x, y) {
	CanvasObj.ctx.clearRect(x, y, toolSize, toolSize);
}

window.addEventListener("resize", function(e) {
	PanZoom.moveTo(0, 0);
});

PreviewCanvas.element.addEventListener('mouseup', function(e) {
	is.LMouseDown = false;
});

// Draw on Mouse Click
PreviewCanvas.element.addEventListener('mousedown', function(e) {
	if (e.button == 0) {
		is.LMouseDown = true;
	}
	if (is.SpaceDown == false) {
		processEvents(e);
	}
});

// Clear The Preview Canvas On Leave
PreviewCanvas.element.addEventListener('mouseleave', function(e) {
	PreviewCanvas.ctx.clearRect(0, 0, PreviewCanvas.width, PreviewCanvas.height);
});

// Draw On Mouse Move
PreviewCanvas.element.addEventListener('mousemove', function(e) {
	UpdateCursorPosition(e);
	if (is.LMouseDown == true && is.SpaceDown == false) {
		processEvents(e);
	} else {
		if (tool == 'b') {
			previewBrush(M_Pos.x, M_Pos.y);
		}
	}
})

function InkDropperTool(x, y) {
	pixels = CanvasObj.ctx.getImageData(x, y, 1, 1).data;
	hexCode = RGB2Hex([pixels[0], pixels[1], pixels[2]]);
	colorPicker.value = hexCode;
	colorPickerWrapper.style.backgroundColor = hexCode;
}

function processEvents(event) {
	UpdateCursorPosition(event);
	if (tool == 'b') {
		brushTool(M_Pos.x, M_Pos.y, [255, 255, 255, 255]);
	} else if (tool == 'e') {
		eraserTool(M_Pos.x, M_Pos.y);
	} else if (tool == 'i') {
		InkDropperTool(M_Pos.x, M_Pos.y);
	}
}
