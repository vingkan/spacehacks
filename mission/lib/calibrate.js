// VECTORS

Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
}

Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
}

function areEqualVectors(v1, v2) {
    return v1.rho === v2.rho && v1.theta === v2.theta && v1.phi === v2.phi;
}

function convertToCartesian(rho, theta, phi) {
    var x = rho * Math.cos(Math.radians(theta)) * Math.sin(Math.radians(phi));
    var y = rho * Math.sin(Math.radians(theta)) * Math.sin(Math.radians(phi));
    var z = rho * Math.cos(Math.radians(phi));
    return {x: x, y: y, z: z};
}

function convertToCantor(rho, theta, phi) {
    var a = toCantor(rho, theta / 10);
    var b = toCantor(theta / 10, phi / 10);
    var c = toCantor(phi / 10, rho);
    return {a: a, b: b, c: c};
}

function convertToVector(a, b, c) {
    var rho = invertCantor(a).x;
    var theta = invertCantor(b).x * 10;
    var phi = invertCantor(c).x * 10;
    return {rho: rho, theta: theta, phi: phi};
}

function toCantor(x, y) {
    return ((x+y) * (x+y+1)) / 2 + y;
}

function invertCantor(z) {
    var w = Math.floor((Math.sqrt(8*z+1)-1) / 2);
    var t = (Math.pow(w, 2) + w) / 2;
    var y = z - t;
    var x = w - y;
    return {x: x, y: y};
}

// GRAPHICS

function drawVector(ix, iy, iz, opt){
    var config = opt || {};
    var target = config.id || 'display';
    var lineColor = config.color || 'black';

    var data = new vis.DataSet();
    data.add({x: 0, y: 0, z: 0});
    data.add({x: ix, y: iy, z: iz});

    var options = {
        width: '200px',
        height: '200px',
        style: 'line',
        showPerspective: false,
        showGrid: true,
        keepAspectRatio: true,
        verticalRatio: 1.0,
        xMin: -2,
        xMax: 2,
        yMin: -2,
        yMax: 2,
        zMin: -2,
        zMax: 2,
        dataColor: lineColor
    };

    // create our graph
    var container = document.getElementById(target);
    var graph = new vis.Graph3d(container, data, options);

    graph.setCameraPosition(0.4, undefined, undefined);
}

// GAMEPLAY

function checkAnswer(target, answer) {
    var estimatedVector = convertToVector(answer.a, answer.b, answer.c);
    if (areEqualVectors(estimatedVector, target)) {
        console.log("YOU WIN!");
        MissionLink.unsync();
    }
    else {
        var cartesian = convertToCartesian(estimatedVector.rho, estimatedVector.theta, estimatedVector.phi);
        drawVector(cartesian.x, cartesian.y, cartesian.z, {
            id: 'display',
            color: 'red'
        });
    }
}

function run() {
    var target = {
        rho: Math.floor(Math.random() * 25),
        theta: Math.floor(Math.random() * 36) * 10,
        phi: Math.floor(Math.random() * 18) * 10
    }

    console.log(target);

    var cartesian = convertToCartesian(target.rho, target.theta, target.phi);
    drawVector(cartesian.x, cartesian.y, cartesian.z, {
        id: 'truth',
        color: 'black'
    });

    var answer = {
        a: undefined,
        b: undefined,
        c: undefined
    }

    var currentInputNumber = 0;

    MissionLink.sync();

    MissionLink.alphaCallback = function(data) {
        currentInputNumber += 1;
    }

    MissionLink.betaCallback = function(data) {
        currentInputNumber *= 10;
    }

    MissionLink.gammaCallback = function(data) {
        if (answer.a === undefined) {
            answer.a = currentInputNumber;
        }
        else if (answer.b === undefined) {
            answer.b = currentInputNumber;
        }
        else if (answer.c === undefined) {
            answer.c = currentInputNumber;
            checkAnswer(target, answer);
            answer = {
                a: undefined,
                b: undefined,
                c: undefined
            }
        }

        currentInputNumber = 0;
    }
}

run();
