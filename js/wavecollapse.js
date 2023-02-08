const ROADTILES = [];
const grid = [];
DIMX = 3;
DIMY = 3;
WHITE = true;
WIDTH = 400;
HEIGHT = 400;

//rules for using the road tiles - 1 = a connector, 0 = blank
const ROADRULES = [
	//[up, down, left, right]
	[0,0,0,0], //blank 
	[1,0,1,1], //up
	[0,1,1,1], //down
	[1,1,1,0], //left
	[1,1,0,1]  //right
];

//set the initial page settings
function setPageSettings() {
	loadRoadTiles();

	document.getElementById("dimx").value = DIMX;
	document.getElementById("dimy").value = DIMY;
	document.getElementById("white").checked = WHITE;
	document.getElementById("width").value = WIDTH;
	document.getElementById("height").value = HEIGHT;
}

//function to always have reference to the canvas
function getCanvas() {
	return document.getElementById("canvas");
}

//get the settings from the page
function getSettings(){
	DIMX = document.getElementById("dimx").value;
	DIMY = document.getElementById("dimy").value;
	WHITE = document.getElementById("white").checked;
	WIDTH = document.getElementById("width").value;
	HEIGHT = document.getElementById("height").value;
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
}

function generate() {
	//load road tiles if they haven't been loaded yet
	if(!ROADTILES.length) {
		loadRoadTiles();
	}
	//get settings before doing anything
	getSettings();
	//clear the grid to be empty
	clearGrid();
	//assign options to each tile
	collapse();
	//draw the tiles
	drawCanvas();
}

//setup a blank canvas
function clearGrid() {
	//loading images doesn't work on first attempt - works on second -> last outline doesn't draw for some reason
	//loadRoadTiles();
	let canvas = getCanvas();
	//in case I want to change canvas dims here
	canvas.width = WIDTH;
	canvas.height = HEIGHT;

	for(let i = 0; i < DIMX*DIMY; i++) {
		grid[i] = {
			collapsed: false,
			options: [0, 1, 2, 3, 4], //[BLANK, UP, DOWN, LEFT, RIGHT]
			index: i
		};
	}
	//grid[4].options = [1];
}

//function for collapsing tiles
function collapse() {
	//entropy, find minimum viable options for each tile
	//get copy of grid to not directly alter grid itself
	const gridCopy = []//grid.slice();

	//remove all cells that have been collapsed
	for(let i = 0; i < grid.length; i++) {
		if(!grid[i].collapsed) {
			gridCopy.push(grid[i]);
		}
	}

	//sort by length
	gridCopy.sort(function(a,b) {
		return a.options.length - b.options.length;
	});

	let len = gridCopy[0].options.length;
	let stop = 0;
	//find all the lowest value options
	for(let  i = 0; i < gridCopy.length; i++) {
		if(gridCopy[i].options.length > len) { //found stopping point
			stop = i;
			break;
		}
	}
	
	//loop has been broken => not all tiles have the same amount of options
	if(stop != 0) {
		gridCopy.splice(stop);
	}

	//pick a random option to start
	const cell = gridCopy[Math.floor(Math.random() * gridCopy.length)];
	cell.collapsed = true;
	const tileChoice = cell.options[Math.floor(Math.random() * cell.options.length)];
	cell.options = [tileChoice];
	//update cell options surrounding this cell
	updateNeighbours(cell, cell.index);

	//recursion :)
	//at the moment this could result in an infinite loop as a tile may not 0 valid options - probably shouldn't... probably
	if(!isAllCollapsed()) {
		collapse();
	}
}

//check to see if all tiles are collapsed
function isAllCollapsed() {
	for(let i = 0; i < grid.length; i++) {
		if(!grid[i].collapsed) {
			return false;
		}
	}
	return true;
}

//update the neighbouring tiles given a cell - when calling this the cell should be collapsed
function updateNeighbours(cell, index) {
	//steps format - [connector to look at from cell, connector to compare to other options, index of cell to compare to]
	let steps = [
		[ROADRULES[cell.options[0]][0], 1, index - DIMY], //[value on top edge of cell, rule for the bottom edge of cell to be updated, index of the cell to be updated]
		[ROADRULES[cell.options[0]][1], 0, +index + +DIMY], //^ but reverese top and bottom
		[ROADRULES[cell.options[0]][2], 3, index - 1], //^^ but have the first item be right and second left - [right edge, left edge, index]
		[ROADRULES[cell.options[0]][3], 2, index + 1] //^ but swap left and right
	];
	

	/*RULES FOR CHECKING
		Cell being checked cannot be already collapsed

		Cell above
			above cell's index must be >= 0 - else out of bounds
		Cell below
			below cell's index must be < grid.length - else out of bounds
		Cell left
			left cell's index must be >= 0 - else out of bounds
			cell's index % X dimension cannot = 0 - if 0 it would be on the left edge of the grid
		Cell right
			right cell's index must be < grid.length - else out of bounds
			cell's index % X dimension cannot = (XDIM-1) - in the case of XDIM = 3, index 2 would be on the right edge	0 1 2
																														3 4 5
																														6 7 8
	*/

	//neighbour above
	if(steps[0][2] >= 0 && !grid[steps[0][2]].collapsed) {
		updateOptions(steps[0][0], steps[0][1], grid[steps[0][2]]);
	}
	//neighbour below
	if(steps[1][2] < grid.length && !grid[steps[1][2]].collapsed) {
		updateOptions(steps[1][0], steps[1][1], grid[steps[1][2]]);
	}
	//neighbour to left
	if(steps[2][2] >= 0 && cell.index % DIMX != 0 && !grid[steps[2][2]].collapsed) {
		updateOptions(steps[2][0], steps[2][1], grid[steps[2][2]]);
	}
	//neighbour to right
	if(steps[3][2] < grid.length && cell.index % DIMX != DIMX - 1 && !grid[steps[3][2]].collapsed) {
		updateOptions(steps[3][0], steps[3][1], grid[steps[3][2]]);
	}
}

//update the options of a cell based on the current cell being looked at and a single adjacent cell
function updateOptions(current, ruleIndex,otherCell) {
	//if there is 1 option, no point updating
	if(otherCell.options.length == 1) {
		return;
	}

	//array for options to be removed
	let optionsToRemove = [];
	//soft copy just in case
	let options = otherCell.options.slice();

	//find all options that aren't valid, given the options available, and rule that must be followed
	for(let i = 0; i < options.length; i++) {
		if(ROADRULES[options[i]][ruleIndex] != current) {
			optionsToRemove.push(options[i]);
		}
	}

	//remove invalid options from soft copy
	for(let i = 0; i < optionsToRemove.length; i++) {
		let index = options.indexOf(optionsToRemove[i]);
		options.splice(index, 1);
	}
	//make the soft copy hard
	otherCell.options = options;
}


//draw the grid onto the canvas
function drawCanvas() {
	//get canvas
	let canvas = getCanvas();
	//set variables for splitting canvas into rows and columns - when DIMX != DIMY, things get stretched, but it still works
	const w = WIDTH / DIMX;
	const h = HEIGHT / DIMY;
	let ctx = canvas.getContext("2d");

	//draw all cells
	for(let i = 0; i < DIMX; i++) {
		for(let j = 0; j < DIMY; j++) {
			let cell = grid[i+j * DIMX];
			if(cell.collapsed) {
				//draws the image of collapsed cell
				let index = cell.options[0]; //at this point all cells should only have 1 option they can be
				if(index == 0 && !WHITE) {
					ctx.fillRect(i * w, j * h, w, h);
				}
				else {
					ctx.drawImage(ROADTILES[index], i * w, j * h, w, h);
				}
			}
			else { //shouldn't come to this but its good to be safe
				//draws the outline of each cell
				ctx.rect(i * w, j * h, w, h);
				ctx.stroke();
			}
		}
	}
}