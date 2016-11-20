var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function sendCanvasImage(){
	var dataURI = canvas.toDataURL();
	db.ref(MissionLink.getRoomKey() + '/modules/circuits/data-uri').set(dataURI);
}

function clearCanvas(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawRect({
		x: 0,
		y: 0,
		width: canvas.width,
		height: canvas.height,
	}, BASE_COLOR);
}

function drawRect(r, fill){
	ctx.beginPath();
	ctx.rect(r.x, r.y, r.width, r.height);
	//ctx.stroke();
	if(fill){
		ctx.fillStyle = fill;
		ctx.fill();
	}
	ctx.closePath();
}

function drawCircle(c, opt){
	var s = {
		fill: opt.fill || false,
		stroke: opt.stroke || false,
		dashes: opt.dashes || [0, 0]
	}
	ctx.beginPath();
	ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI, false);
	if(s.fill){
		ctx.fillStyle = s.fill;
		ctx.fill();
	}
	if(s.stroke){
		ctx.setLineDash(s.dashes);
		ctx.strokeStyle = s.stroke;
		ctx.stroke();
	}
	ctx.closePath();
	ctx.setLineDash([0, 0]);
}

function drawLine(i, f, opt){
	var s = {
		stroke: opt.stroke || 'white',
		offset: opt.offset || 0
	}
	ctx.beginPath();
	ctx.moveTo(i[0] + s.offset, i[1] + s.offset);
	ctx.lineTo(f[0] + s.offset, f[1] + s.offset);
	if(s.stroke){
		ctx.strokeStyle = s.stroke;
	}
	ctx.lineWidth = 5;
	ctx.stroke();
	ctx.closePath();
}

function drawText(text, i, opt){
	var s = {
		size: opt.size || 20,
		font: opt.font || 'Consolas',
		fill: opt.fill || 'white'
	}
	ctx.beginPath();
	ctx.font = s.size + 'px ' + s.font;
	if(s.fill){
		ctx.fillStyle = s.fill;
	}
	ctx.fillText(text, i[0] - (s.size * 0.25), i[1] + (s.size * 0.30));
	ctx.closePath();
}

var NODE_POS = [
	{x: 250, y: 200, node: 'EMPTY'},
	{x: 250, y: 400, node: 'EMPTY'},
	{x: 250, y: 600, node: 'EMPTY'},
	//{x: 250, y: 800, node: 'EMPTY'},
	{x: 750, y: 200, node: 'EMPTY'},
	//{x: 750, y: 400, node: 'EMPTY'},
	{x: 750, y: 600, node: 'EMPTY'},
	//{x: 750, y: 800, node: 'EMPTY'}
];

var LETTER_POS = ['a', 'b', 'c', 'd', 'e'];

var WIRE_COLORS = ['purple', 'brown', 'blue', 'green', 'white', 'pink', 'red', 'orange', 'yellow', 'turquoise'];

var BASE_COLOR = '#20221f';
var CIRCUIT_GREEN = '#0cdc56';
var LED_COLOR = {
	red: '#eb5c1f',
	blue: '#0bebe5',
	green: '#0cdc56',
	yellow: '#d3eb37'
}

var PATHS = {
    a: {
        b: [{x: 250, y: 200}, {x: 250, y: 400}],
        c: [{x: 250, y: 200}, {x: 100, y: 200}, {x: 100, y: 600}, {x: 250, y: 600}],
        d: [{x: 250, y: 200}, {x: 325, y: 200}, {x: 325, y: 125}, {x: 750, y: 125}, {x: 750, y: 200}],
        e: [{x: 250, y: 200}, {x: 250, y: 50}, {x: 900, y: 50}, {x: 900, y: 600}, {x: 750, y: 600}]
    },
    b: {
        c: [{x: 250, y: 400}, {x: 175, y: 400}, {x: 175, y: 525}, {x: 250, y: 525}, {x: 250, y: 600}],
        d: [{x: 250, y: 400}, {x: 400, y: 400}, {x: 400, y: 200}, {x: 750, y: 200}],
        e: [{x: 250, y: 400}, {x: 250, y: 450}, {x: 600, y: 450, bridged: true}, {x: 600, y: 600}, {x: 750, y: 600}]
    },
    c: {
        d: [{x: 250, y: 600}, {x: 500, y: 600}, {x: 500, y: 400}, {x: 750, y: 400}, {x: 750, y: 200}],
        e: [{x: 250, y: 600}, {x: 250, y: 700}, {x: 750, y: 700}, {x: 750, y: 600}]
    },
    d: {
        e: [{x: 750, y: 200}, {x: 825, y: 200}, {x: 825, y: 500}, {x: 750, y: 500}, {x: 750, y: 600}]
    }
}

// Intersection at x: 500, y: 450

function getMidpoint(s1, s2){
	// Assumes vertical or horizontal line segments
	if(s1.x === s2.x){
		var hi = (s2.y > s1.y) ? s2.y : s1.y;
		var lo = (s2.y < s1.y) ? s2.y : s1.y;
		return {x: s1.x, y: (hi + lo) / 2};
	}
	else{
		var hi = (s2.x > s1.x) ? s2.x : s1.x;
		var lo = (s2.x < s1.x) ? s2.x : s1.x;
		return {x: (hi + lo) / 2, y: s1.y};
	}
}

function drawCircuitPath(pathList, breakPath, wireColor){
	var needsBreaking = breakPath;
	var breakPoint = pathList.length - 1;
	var i = false;
	for(var p = 0; p < pathList.length; p++){
		var f = pathList[p];
		if(i){
			if(f.bridged){
				// ASSUMES BRIDGE IS ON HORIZONTAL SEGMENT
				var mid = getMidpoint(i, f);
					mid.x += 75;
				var bridgeSize = 50;
				// Stop before bridge
				drawLine([i.x, i.y], [mid.x - bridgeSize, f.y], {
					stroke: wireColor
				});
				// Bridge
				drawLine([mid.x - bridgeSize, f.y], [mid.x - bridgeSize, f.y + bridgeSize], {
					stroke: wireColor
				});
				drawLine([mid.x - bridgeSize, f.y + bridgeSize], [mid.x + bridgeSize, f.y + bridgeSize], {
					stroke: wireColor
				});
				drawLine([mid.x + bridgeSize, f.y + bridgeSize], [mid.x + bridgeSize, f.y], {
					stroke: wireColor
				});
				// Exit after bridge
				drawLine([mid.x + bridgeSize, f.y], [f.x, f.y], {
					stroke: wireColor
				});
				// Fuck Königsberg.
			}
			else{
				drawLine([i.x, i.y], [f.x, f.y], {
					stroke: wireColor
				});
			}
			if(breakPath && needsBreaking && p === breakPoint){
				var mid = getMidpoint(i, f);
					mid.r = 20;
				drawCircle(mid, {
					fill: BASE_COLOR,
					stroke: wireColor,
					dashes: [5, 15]
				});
				needsBreaking = false;
			}
		}
		i = f;
	}
}

function renderCircuit(c, opt){
	var opt = opt || {};
	var s = {
		showNumber: opt.showNumber || true
	}

	/*drawRect({
		x: 0,
		y: 0,
		width: canvas.width,
		height: canvas.height,
	}, BASE_COLOR);*/

	clearCanvas();

	drawRect({
		x: 75,
		y: 775 + 50,
		width: 100,
		height: 100,
	}, LED_COLOR[c.led]);

	drawRect({
		x: 85,
		y: 775 + 60,
		width: 80,
		height: 80,
	}, BASE_COLOR);

	drawRect({
		x: 100,
		y: 775 + 75,
		width: 50,
		height: 50,
	}, LED_COLOR[c.led]);

	/*drawLine([0, 200], [1000, 200], {
		stroke: 'gray'
	});
	drawLine([0, 400], [1000, 400], {
		stroke: 'gray'
	});
	drawLine([0, 600], [1000, 600], {
		stroke: 'gray'
	});
	drawLine([0, 800], [1000, 800], {
		stroke: 'gray'
	});

	drawLine([250, 0], [250, 1000], {
		stroke: 'gray'
	});
	drawLine([750, 0], [750, 1000], {
		stroke: 'gray'
	});*/


	for(var w = 0; w < c.wires.length; w++){
		var wire = c.wires[w];
		var pathList = PATHS[wire.node1][wire.node2];
		var wireColor = WIRE_COLORS.pop();
		drawCircuitPath(pathList, wire.broken, wireColor);
	}

	for(var n in c.nodes){
		var node = c.nodes[n];
		if(node){
			var pos = NODE_POS[LETTER_POS.indexOf(n)];
			drawCircle({
				x: pos.x,
				y: pos.y,
				r: 35
			}, {
				fill: CIRCUIT_GREEN
			});
			drawText(n.toUpperCase(), [pos.x, pos.y], {
				size: 35,
				fill: BASE_COLOR
			});
		}
	}

	if(s.showNumber){
		var cidx = c.number + '';
		if(c.number){
			if(c.number === -1){
				cidx = '#'
			}
			else{
				cidx = c.number + '';
			}
		}
		else{
			cidx = '#';
		}
		drawText(cidx, [850, 875], {
			size: 80
		});
	}

	sendCanvasImage();

}

/*renderCircuit({
	nodes: {
		a: true,
		b: true,
		c: true,
		d: true,
		e: true
	},
	wires: [
		{node1: 'a', node2: 'b', broken: true},
		{node1: 'a', node2: 'c', broken: true},
		{node1: 'a', node2: 'd', broken: true},
		{node1: 'a', node2: 'e', broken: true},
		{node1: 'b', node2: 'c', broken: true},
		{node1: 'b', node2: 'd', broken: true},
		{node1: 'b', node2: 'e', broken: true},
		{node1: 'c', node2: 'd', broken: true},
		{node1: 'c', node2: 'e', broken: true},
		{node1: 'd', node2: 'e', broken: true},
	],
	led: 'red',
	number: '42'
});*/

// OLD WIRE DRAWING METHOD

/*var WIRE_INCREMENT = 1;

for(var w = 0; w < c.wires.length; w++){
	var DW = WIRE_INCREMENT * 10;
	var wireColor = WIRE_COLORS.pop();
	var path = c.wires[w];
	var i = NODE_POS[LETTER_POS.indexOf(path.node1)];
	var f = NODE_POS[LETTER_POS.indexOf(path.node2)];
	var brk = {
		x: 0,
		y: 0
	}

	if(!path.broken){

		if(i.x === f.x || i.y == f.y){
			drawLine([i.x, i.y], [f.x, f.y], {
				stroke: wireColor
			});
			if(i.x === f.x){
				var diff = f.y - i.y;
				var dir = diff / Math.abs(diff);
				brk.x = i.x;
				brk.y = i.y + (WIRE_INCREMENT * 15 * dir);
			}
			else{
				var diff = f.x - i.x;
				var dir = diff / Math.abs(diff);
				brk.x = i.x + (WIRE_INCREMENT * 15 * dir);
				brk.y = i.y;
			}
		}
		else{
			drawLine([i.x, i.y], [i.x, f.y], {
				stroke: wireColor
			});
			drawLine([i.x, f.y], [f.x, f.y], {
				stroke: wireColor
			});
			brk.x = i.x;
			brk.y = f.y;
		}

	}

	drawCircle({
		x: i.x,
		y: i.y,
		r: 40 + (WIRE_INCREMENT * 20)
	}, {
		stroke: wireColor,
		dashes: path.broken ? [5, 15] : false
	});

	drawCircle({
		x: f.x,
		y: f.y,
		r: 40 + (WIRE_INCREMENT * 20)
	}, {
		stroke: wireColor,
		dashes: path.broken ? [5, 15] : false
	});

	WIRE_INCREMENT++;
}*/