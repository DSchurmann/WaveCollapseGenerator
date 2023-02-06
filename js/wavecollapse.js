const ROADTILES = [];
const grid = [];
const DIMX = 3;
const DIMY = 3;

//rules for using the road tiles
const ROADRULES = {
	BLANK: {
		up: 0,
		down: 0,
		left: 0,
		right: 0
	},
	UP: {
		up: 1,
		down: 0,
		left: 1,
		right: 1	
	},
	DOWN: {
		up: 0,
		down: 1,
		left: 1,
		right: 1
	},
	LEFT: {
		up: 1,
		down: 1,
		left: 1,
		right: 0
	},
	RIGHT: {
		up: 1,
		down: 1,
		left: 0,
		right: 1
	}
};

//function to always have reference to the canvas
function getCanvas() {
	return document.getElementById("canvas");
}

function loadRoadTiles() {
	ROADTILES[0] = new Image();
	ROADTILES[0].src = "images/blank.png";
	ROADTILES[1] = new Image();
	ROADTILES[1].src = "images/up.png";
	ROADTILES[2] = new Image();
	ROADTILES[2].src = "images/down.png";
	ROADTILES[3] = new Image();
	ROADTILES[3].src = "images/left.png";
	ROADTILES[4] = new Image();
	ROADTILES[4].src = "images/right.png";
	console.log("LOAD CALLED");
}

function generate() {
	if(!ROADTILES.length) {
		loadRoadTiles();
	}
	setup();
}

//setup a blank canvas
function setup() {
	//loading images doesn't work on first attempt - works on second -> last outline doesn't draw for some reason
	//loadRoadTiles();
	canvas = getCanvas();
	canvas.width = 200;
	canvas.height = 200;

	for(let i = 0; i < DIMX*DIMY; i++) {
		grid[i] = {
			collapsed: false
		};
	}

	draw();
}

//draw the canvas
function draw() {
	canvas = getCanvas();

	const w = canvas.width / DIMX;
	const h = canvas.height / DIMY;

	for(let i = 0; i < DIMX; i++) {
		for(let j = 0; j < DIMY; j++) {
			let cell = grid[i+j];
			if(cell.collapsed) {

			}
			else {
				let ctx = canvas.getContext("2d");
				//draws the outline of each cell
				ctx.rect(i * w, j * h, w, h);
				ctx.stroke();
				//draws the image - this probably should happen if collapsed
				ctx.drawImage(ROADTILES[1], i * w, j * h, w, h);
			}
		}
	}
}