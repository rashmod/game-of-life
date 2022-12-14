// get canvas element
const canvas = document.querySelector('#canvas');
// get play button element
const playBtn = document.querySelector('#play-btn');
// get random button element
const randomBtn = document.querySelector('#random-btn');
// get reset button element
const resetBtn = document.querySelector('#reset-btn');
// get button container element
const container = document.querySelectorAll('.container')[0];
// get body element
const body = document.querySelectorAll('body')[0];
// get context of the canvas
const ctx = canvas.getContext('2d');

// get height of container
const containerHeight = container.getBoundingClientRect().height;

// get padding of body element
// "10px 20px"
// remove "px"
// turn string to array
const bodyPadding = window
	.getComputedStyle(body)
	.getPropertyValue('padding')
	.replace(/px/g, '')
	.split(' ');

let bodyPaddingX, bodyPaddingY;

if (bodyPadding.length < 2) {
	// if x and y padding is same bodyPadding will have only one value
	// make both x and y same
	[bodyPaddingY] = bodyPadding;
	bodyPaddingX = bodyPaddingY;
} else {
	[bodyPaddingY, bodyPaddingX] = bodyPadding;
}

// calculate height for canvas
const height = Math.floor(
	window.innerHeight - containerHeight - bodyPaddingY * 2
);
// calculate width for canvas
const width = Math.floor(window.innerWidth - bodyPaddingX * 2);
// change canvas height and width
canvas.height = height;
canvas.width = width;

// setting size of grid cell
const RESOLUTION = 15;
// setting the no of col based on window width
const COLS = Math.floor(width / RESOLUTION);
// setting the no of row based on window height
const ROWS = Math.floor(height / RESOLUTION);
// global var to track state of app
let RUNNING = false;
// current frame id
let frameId;
// for updating at proper fps
let now, elapsed;
let then = Date.now();
// set fps
const FPS = 10;
// calc time between each frame
const fpsInterval = 1000 / FPS;

// initializing the grid
let grid = make2DArray(ROWS, COLS);
// displaying the grid
render(grid);

// event listener for play and pause btn
playBtn.addEventListener('click', handlePlayButton);
// event listener for random btn
randomBtn.addEventListener('click', Randomize);
// event listener for reset btn
resetBtn.addEventListener('click', Reset);
// event listener for canvas click
canvas.addEventListener('mousemove', handleMouseMove);
// event listener for canvas click
canvas.addEventListener('mousedown', handleMouseDown);

// make a 2d array filled with 0
function make2DArray(rows, cols) {
	// initializing an array of length cols with null values
	// filling that array with sub arrays of length rows with 0 values
	return new Array(cols)
		.fill(null)
		.map(() =>
			new Array(rows).fill(null).map(() => Math.floor(Math.random() * 2))
		);
	// return new Array(cols).fill(null).map(() => new Array(rows).fill(0));
}

function handlePlayButton() {
	if (!RUNNING) {
		// if the app is not running start updating
		// update();
		console.log('playing');
		// change button text to show function
		playBtn.innerText = 'Pause';
		// start updating
		requestAnimationFrame(update);
	} else {
		console.log('paused');
		// change button text to show function
		playBtn.innerText = 'Play';
		// if the app not running stop using the frame id
		cancelAnimationFrame(frameId);
	}
	// change app state to opposite
	RUNNING = !RUNNING;
}

function Randomize() {
	for (let col = 0; col < grid.length; col++) {
		for (let row = 0; row < grid[col].length; row++) {
			// loop through grid and set cell value to 0 or 1
			grid[col][row] = Math.floor(Math.random() * 2);
		}
	}
	console.log('randomizing');
	// render the grid
	render(grid);
}

function Reset() {
	for (let col = 0; col < grid.length; col++) {
		for (let row = 0; row < grid[col].length; row++) {
			// loop through grid and set cell value to 0
			grid[col][row] = 0;
		}
	}
	console.log('resetting');
	// render the grid
	render(grid);
}

function clear() {
	// clear canvas function
	ctx.clearRect(0, 0, width, height);
}

function render(grid) {
	// init function for app
	for (let col = 0; col < grid.length; col++) {
		for (let row = 0; row < grid[col].length; row++) {
			// loop through the column then row to get cell
			const cell = grid[col][row];
			// set x and y position for cells
			// multiply col and row with resolution for x and y position
			const x = col * RESOLUTION;
			const y = row * RESOLUTION;

			ctx.beginPath();
			// draw a rectangle at position x and y with width resolution
			ctx.rect(x, y, RESOLUTION, RESOLUTION);
			// if cell value is 1 fill with yellow other white
			ctx.fillStyle = cell ? '#FFE066' : '#f4faff';
			ctx.strokeStyle = '#60495A';
			ctx.fill();
			ctx.stroke();
			// display empty rectangles
			// ctx.strokeRect(x, y, RESOLUTION, RESOLUTION);
		}
	}
}

// updating function
function update() {
	// clear the canvas before every frame is rendered
	clear();

	// set now = current time
	now = Date.now();
	// store time diff between last render and this render
	elapsed = now - then;
	// is time diff is greater than time between frames then play next frame
	if (elapsed > fpsInterval) {
		// change last frame time
		then = now;
		// set value of grid
		grid = nextGen(grid);
	}
	render(grid);
	// use builtin api to recursively call itself
	// save frame id to global variable
	frameId = requestAnimationFrame(update);
}

// calculate next gen
function nextGen(grid) {
	// copy grid to temp grid
	const nextGenGrid = grid.map((arr) => [...arr]);

	for (let col = 0; col < grid.length; col++) {
		for (let row = 0; row < grid[col].length; row++) {
			const cell = grid[col][row];
			// count num of neighbors
			const neighbors = countNeighbors(grid, col, row);
			if (cell && neighbors < 2) nextGenGrid[col][row] = 0;
			else if (cell && neighbors > 3) nextGenGrid[col][row] = 0;
			else if (!cell && neighbors === 3) nextGenGrid[col][row] = 1;
		}
	}

	return nextGenGrid;
}

function countNeighbors(arr, col, row) {
	let count = 0;
	for (let i = -1; i < 2; i++) {
		for (let j = -1; j < 2; j++) {
			// loop through subgrid of 3 x 3 around cell
			// skip itself
			if (i === 0 && j === 0) continue;
			// make canvas edges act as if connected
			const x = (col + i + COLS) % COLS;
			const y = (row + j + ROWS) % ROWS;
			count += arr[x][y];
		}
	}
	return count;
}

// get canvas element size
const canvasRect = canvas.getBoundingClientRect();
function changeCellOnClick(event) {
	// get mouse position
	const mouseY = event.clientY;
	const mouseX = event.clientX;
	// calc mouse position in grid
	const x = Math.floor((mouseX - canvasRect.x) / RESOLUTION);
	const y = Math.floor((mouseY - canvasRect.y) / RESOLUTION);

	return [x, y];
}

// function to draw
function handleMouseMove(event) {
	// if not left clicked do nothing
	if (event.buttons !== 1) return;
	const [x, y] = changeCellOnClick(event);

	grid[x][y] = 1;
	render(grid);
}

// function for individual clicks
function handleMouseDown(event) {
	const [x, y] = changeCellOnClick(event);

	// switch from alive to dead
	grid[x][y] = grid[x][y] ? 0 : 1;
	render(grid);
}
