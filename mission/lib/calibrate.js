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

// Converts formula output given by engineer to a 3D vector
function convertToVector(a, b, c) {
    var rho = invertCantor(a).x;
    var theta = invertCantor(b).x * 10;
    var phi = invertCantor(c).x * 10;
    return {rho: rho, theta: theta, phi: phi};
}

function toCantor(x, y) {
    return ((x+y) * (x+y+1)) / 2 + y;
}

// Inverts the Cantor pairing function
function invertCantor(z) {
    var w = Math.floor((Math.sqrt(8*z+1)-1) / 2);
    var t = (Math.pow(w, 2) + w) / 2;
    var y = z - t;
    var x = w - y;
    return {x: x, y: y};
}

function checkAnswer(target, answer) {
    var estimatedVector = convertToVector(answer.a, answer.b, answer.c);
    if (areEqualVectors(estimatedVector, target)) {
        console.log("YOU WIN!");
        MissionLink.unsync();
    }
    else {
        var cartesian = convertToCartesian(estimatedVector.rho, estimatedVector.theta, estimatedVector.phi);
        console.log('Drawing red: ', cartesian.x, ' ', cartesian.y, ' ', cartesian.z);
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
    //drawBaseVector()
    console.log('Drawing black: ', cartesian.x, ' ', cartesian.y, ' ', cartesian.z);

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
