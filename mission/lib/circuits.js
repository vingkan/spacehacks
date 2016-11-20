var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function clearCanvas(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawRect(r, fill){
	ctx.beginPath();
	ctx.rect(r.x, r.y, r.width, r.height);
	ctx.stroke();
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
	{x: 250, y: 800, node: 'EMPTY'},
	{x: 750, y: 200, node: 'EMPTY'},
	{x: 750, y: 400, node: 'EMPTY'},
	{x: 750, y: 600, node: 'EMPTY'},
	{x: 750, y: 800, node: 'EMPTY'}
];

var LETTER_POS = ['a', 'b', 'c', 'd', 'e'];

var BASE_COLOR = '#20221f';
var CIRCUIT_GREEN = '#0cdc56';
var LED_COLOR = {
	red: '#eb5c1f',
	blue: '#0bebe5',
	green: '#0cdc56',
	yellow: '#d3eb37'
}

function renderCircuit(c, opt){
	var opt = opt || {};
	var s = {
		showNumber: opt.showNumber || true
	}

	drawRect({
		x: 0,
		y: 0,
		width: canvas.width,
		height: canvas.height,
	}, BASE_COLOR);

	drawRect({
		x: 75,
		y: 50,
		width: 100,
		height: 100,
	}, LED_COLOR[c.led]);

	drawRect({
		x: 85,
		y: 60,
		width: 80,
		height: 80,
	}, BASE_COLOR);

	drawRect({
		x: 100,
		y: 75,
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

	var USED_IDX = [];

	/*for(var n in c.nodes){
		var node = c.nodes[n];
		if(node){
			var placed = false;
			while(!placed){
				var idx = Math.floor((NODE_POS.length * Math.random()));
				if(USED_IDX.indexOf(idx) > -1){

				}
				else{
					USED_IDX.push(idx);
					placed = true;
					c.nodes[n] = {pos: NODE_POS[idx]};
					
				}
			}
		}
	}*/

	var WIRE_INCREMENT = 1;
	var WIRE_COLORS = ['purple', 'brown', 'blue', 'green', 'white', 'pink', 'red', 'orange', 'yellow', 'turquoise'];

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
		console.log(c)
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
		drawText(cidx, [850, 100], {
			size: 80
		});
	}

	var dataURI = canvas.toDataURL();
	db.ref('modules/circuits/data-uri').set(dataURI);

}