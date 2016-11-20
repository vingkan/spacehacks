function getPossibleEdges(nNodes) {
    var nodes = ['a', 'b', 'c', 'd', 'e'];
    nodes = nodes.slice(0, nNodes);

    var edges = [];
    for (var i = 0; i < nodes.length - 1; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
            edges.push({
                node1: nodes[i],
                node2: nodes[j]
            })
        }
    }
    return edges;
}

function generateCircuit() {
    // Randomly choose number of nodes
    var nNodes = Math.floor(Math.random() * 4) + 2;

    // Randomly choose wires
    var possibleEdges = getPossibleEdges(nNodes);
    var edges = [];
    for (var i = 0; i < possibleEdges.length; i++) {
        if (Math.random() >= 0.5) {
            var edge = possibleEdges[i];
            edge.broken = Math.random() >= 0.5 ? true : false;
            edges.push(edge);
        }
    }

    // Randomly choose LED color
    var possibleColors = ['red', 'blue', 'green', 'yellow'];
    var color = possibleColors[Math.floor(Math.random() * 4)];

    var circuit = {
        nodes: {
            a: nNodes >= 1,
            b: nNodes >= 2,
            c: nNodes >= 3,
            d: nNodes >= 4,
            e: nNodes >= 5
        },
        led: color,
        wires: edges,
        number: -1
    }
    return circuit;
}

function getNeighbors(circuit) {
    var listOfNeighbors = {};
    for (var node in circuit.nodes) {
        if (!circuit.nodes[node]) {
            continue;
        }
        var neighbors = [];
        for (var j = 0; j < circuit.wires.length; j++) {
            var wire = circuit.wires[j];

            if (wire.node1 === node && !wire.broken) {
                neighbors.push(wire.node2);
            }
            if (wire.node2 === node && !wire.broken) {
                neighbors.push(wire.node1);
            }
        }
        listOfNeighbors[node] = neighbors;
    }
    return listOfNeighbors;
}

function countCycles(circuit) {
    var listOfNeighbors = getNeighbors(circuit);
    var count = 0;
    var visited = [];

    function visit(node, parent) {
        visited.push(node);
        for (var i = 0; i < listOfNeighbors[node].length; i++) {
            var neighbor = listOfNeighbors[node][i];
            if (neighbor === parent) {
                continue;
            }
            if (visited.indexOf(neighbor) === -1) {
                visit(neighbor, node);
            }
            else {
                count++;
            }
        }
    }

    for (var node in circuit.nodes) {
        if (circuit.nodes[node] && visited.indexOf(node) === -1) {
            visit(node, undefined);
        }
    }

    return Math.round(count / 2);
}

function countNodes(circuit) {
    var count = 0;
    for (var key in circuit.nodes) {
        if (circuit.nodes[key]) {
            count++;
        }
    }
    return count;
}

function countCutWires(circuit) {
    var count = 0;
    for (var i = 0; i < circuit.wires.length; i++) {
        var wire = circuit.wires[i];
        if (wire.broken) {
            count++;
        }
    }
    return count;
}

function checkCircuit(original, replacement) {
    // The lights on the original board and the replacement board are both red
    if (original.led === 'red' && replacement.led === 'red') {
        // There are 4 or more nodes on the replacement board
        if (countNodes(replacement) >= 4) {
            // No wires are cut on the replacement board
            if (countCutWires(replacement) === 0) {
                // There are at least 2 cycles on the replacement
                if (countCycles(replacement) >= 2) {
                    return true;
                }
            }
        }
        // The number of nodes on both boards is between 3 and 5
        if (countNodes(original) >= 3 && countNodes(original) <= 5 &&
                countNodes(replacement) >= 3 && countNodes(replacement) <= 5) {
            // At least 1 wire is cut on the replacement board
            if (countCutWires(replacement) >= 1) {
                // There is exactly 1 cycle on the replacement board
                if (countCycles(replacement) === 1) {
                    return true;
                }
            }
        }
    }
    // The original board light is blue or green, and the replacement board is red
    if ((original.led === 'blue' || original.led === 'green') && replacement.led === 'red') {
        // There are exactly 3 nodes on the original board
        if (countNodes(original) === 3) {
            // There are exactly 2 cut wires on the replacement board
            if (countCutWires(replacement) === 2) {
                // There are no cycles on either board
                if (countCycles(original) === 0 && countCycles(replacement) === 0) {
                    return true;
                }
            }
            // There is no cut wire on either board
            if (countCutWires(original) === 0 && countCutWires(replacement) === 0) {
                // There is at least 1 cycle on the replacement board
                if (countCycles(replacement) >= 1) {
                    return true;
                }
            }
        }
        // There are exactly 2 nodes on the original board
        if (countNodes(original) === 2) {
            // There are no cut wires on the original board
            if (countCutWires(original) === 0) {
                // There is exactly 1 cycle on replacement board
                if (countCycles(replacement) === 1) {
                    return true;
                }
            }
            // The wire is cut on the original board
            if (countCutWires(original) === 1) {
                // There are no cycles on the replacement board
                if (countCycles(replacement) === 0) {
                    return true;
                }
            }
        }
    }
    // The lights on the original board and the replacement board are both blue
    if (original.led === 'blue' && replacement.led === 'blue') {
        // There are 5 nodes on both boards
        if (countNodes(original) === 5 && countNodes(replacement) === 5) {
            // There are no cut wires on the original board
            if (countCutWires(original) === 0) {
                // There are at least 2 cycles on the replacement board
                if (countCycles(replacement) >= 2) {
                    return true;
                }
            }
            // There are 2 cut wires on the original board
            if (countCutWires(original) === 2) {
                // There is only 1 or no cycles on the original board
                if (countCycles(original) <= 1) {
                    return true;
                }
            }
        }
        // There are between 2 and 4 nodes on the replacement board
        if (countNodes(replacement) >= 2 && countNodes(replacement) <= 4) {
            // There exists only 1 wire on the replacement board
            if (replacement.wires.length === 1) {
                return true;
            }
            // All wires are cut on the replacement board
            if (replacement.wires.length === countCutWires(replacement)) {
                return true;
            }
        }
    }
    // The replacement board is any color BUT red
    if (replacement.led !== 'red') {
        // The replacement board has more nodes than the original board
        if (countNodes(replacement) > countNodes(original)) {
            // The replacement board and original board have no cut wires
            if (countCutWires(original) === 0 && countCutWires(replacement) === 0) {
                // For both boards, the number of cycles is equal to 2
                if (countCycles(original) === 2 && countCycles(replacement) === 2) {
                    return true;
                }
                // For the replacement board, there is exactly 1 cycle
                if (countCycles(replacement) === 1) {
                    return true;
                }
            }
            // The original board has at least 1 cut wire and the replacement board has more cut wires than the original
            if (countCutWires(original) >= 1 && countCutWires(replacement) > countCutWires(original)) {
                // There are no cycles on either board
                if (countCycles(original) === 0 && countCycles(replacement) === 0) {
                    return true;
                }
                // There is 1 cycle on the replacement board
                if (countCycles(replacement) === 1) {
                    return true;
                }
            }
        }
        // The original board and replacement board both have 3 nodes
        if (countNodes(original) === 3 && countNodes(replacement) === 3) {
            // Both the boards have 2 wires, and the wires are cut
            if (original.wires.length === 2 && replacement.wires.length === 2 &&
                    countCutWires(original) === 2 && countCutWires(replacement) === 2) {
                return true;
            }
            // The original board has 3 wires
            if (original.wires.length === 3) {
                return true;
            }
        }
    }
    return false;
}

function checkCircuits(target, circuits) {
    for (var i = 0; i < circuits.length; i++) {
        if (checkCircuit(target, circuits[i])) {
            return true;
        }
    }
    return false;
}

function generateCircuits(original, answer, nCircuits) {
    var circuits = [];
    for (var i = 0; i < nCircuits; i++) {
        var circ = generateCircuit();
        circ.number = (i+1);
        circuits.push(circ);
    }

    var randIndex = Math.floor(Math.random() * nCircuits);
    answer.number = (randIndex+1);
    circuits[randIndex] = answer;
    return circuits;
}

function setNNodes(circuit, nNodes) {
    // Randomly choose wires
    var possibleEdges = getPossibleEdges(nNodes);
    var edges = [];
    for (var i = 0; i < possibleEdges.length; i++) {
        if (Math.random() >= 0.5) {
            var edge = possibleEdges[i];
            edge.broken = Math.random() >= 0.5 ? true : false;
            edges.push(edge);
        }
    }

    var newCircuit = {
        nodes: {
            a: nNodes >= 1,
            b: nNodes >= 2,
            c: nNodes >= 3,
            d: nNodes >= 4,
            e: nNodes >= 5
        },
        led: circuit.led,
        wires: edges
    }
    return newCircuit;
}

function setRandomWires(circuit) {
    var newCircuit = circuit;
    var possibleEdges = getPossibleEdges(countNodes(circuit));
    var edges = [];
    for (var i = 0; i < possibleEdges.length; i++) {
        if (Math.random() >= 0.5) {
            var edge = possibleEdges[i];
            edge.broken = false;
            edges.push(edge);
        }
    }
    newCircuit.wires = edges;
    return newCircuit;
}

function setCutWires(circuit, nCutWires) {
    var newCircuit = circuit;
    var possibleEdges = getPossibleEdges(countNodes(circuit));
    for (var i = 0; i < circuit.wires.length; i++) {
        var wire = circuit.wires[i];
        function isEqualEdge(edge) {
            return edge.node1 === wire.node1 && edge.node2 === wire.node2;
        }
        var matchingIndex = possibleEdges.findIndex(isEqualEdge);
        possibleEdges.splice(matchingIndex, 1);
    }
    for (var i = 0; i < nCutWires; i++) {
        if (possibleEdges.length <= 0) {
            // FAIL, TOO MANY WIRES ALREADY TAKEN
            return newCircuit;
        }
        var edge = possibleEdges.pop();
        newCircuit.wires.push({
            node1: edge.node1,
            node2: edge.node2,
            broken: true
        });
    }
    return newCircuit;
}

function setWires(circuit, nCutWires, nCycles) {
    var newCircuit = circuit;
    if (nCutWires === undefined && nCycles === undefined) {
        var possibleEdges = getPossibleEdges(countNodes(newCircuit));
        var edges = [];
        for (var i = 0; i < possibleEdges.length; i++) {
            if (Math.random() >= 0.5) {
                var edge = possibleEdges[i];
                edge.broken = Math.random() >= 0.5 ? true : false;
                edges.push(edge);
            }
        }
        newCircuit.wires = edges;
        return newCircuit;
    }
    if (nCycles === undefined) {
        while (countCutWires(newCircuit) !== nCutWires) {
            newCircuit = setRandomWires(newCircuit);
            newCircuit = setCutWires(newCircuit, nCutWires);
        }
        return newCircuit;
    }
    while (countCutWires(newCircuit) !== nCutWires || countCycles(newCircuit) !== nCycles) {
        newCircuit = setRandomWires(newCircuit);
        newCircuit = setCutWires(newCircuit, nCutWires);
    }
    return newCircuit;
}

function setNWires(circuit, nWires) {
    var newCircuit = circuit;
    var possibleEdges = getPossibleEdges(countNodes(circuit));
    var edges = [];
    for (var i = 0; i < nWires; i++) {
        var edge = possibleEdges[i];
        edge.broken = false;
        edges.push(edge);
    }
    newCircuit.wires = edges;
    return newCircuit;
}

function generateSolutionPair() {
    var original = generateCircuit();
    var answer = generateCircuit();

    // 16 solution types
    var brokenCases = [2, 7, 9, 14, 15];
    var solutionType = 15;
    while (brokenCases.indexOf(solutionType) !== -1) {
        solutionType = Math.floor(Math.random()*14);
    }

    if (solutionType === 0) {
        original.led = 'red';
        answer.led = 'red';
        answer = setNNodes(answer, Math.floor(Math.random()*2)+4);
        answer = setWires(answer, 0, 2);
    }
    else if (solutionType === 1) {
        original.led = 'red';
        answer.led = 'red';
        original = setNNodes(original, Math.floor(Math.random()*3)+3);
        original = setWires(original, undefined, undefined);
        answer = setNNodes(answer, Math.floor(Math.random()*2)+4);
        answer = setWires(answer, 1, 1);
    }
    else if (solutionType === 2) {
        original.led = Math.random() >= 0.5 ? 'blue' : 'green';
        answer.led = 'red';
        original = setNNodes(original, 3);
        original = setWires(original, undefined, undefined);
        answer = setNNodes(answer, Math.floor(Math.random()*3)+3);
        answer = setWires(answer, 2, 0);
    }
    else if (solutionType === 3) {
        original.led = Math.random() >= 0.5 ? 'blue' : 'green';
        answer.led = 'red';
        original = setNNodes(original, 3);
        original = setWires(original, 0, undefined);
        answer = setNNodes(answer, Math.floor(Math.random()*3)+3);
        answer = setWires(answer, 0, 1);
    }
    else if (solutionType === 4) {
        original.led = Math.random() >= 0.5 ? 'blue' : 'green';
        answer.led = 'red';
        original = setNNodes(original, 2);
        original = setWires(original, 0, 0);
        answer = setNNodes(answer, Math.floor(Math.random()*3)+3);
        answer = setWires(answer, 0, 1);
    }
    else if (solutionType === 5) {
        original.led = Math.random() >= 0.5 ? 'blue' : 'green';
        answer.led = 'red';
        original = setNNodes(original, 2);
        original = setWires(original, 1, 0);
        answer = setNNodes(answer, Math.floor(Math.random()*3)+3);
        answer = setWires(answer, Math.floor(Math.random()*3), 0);
    }
    else if (solutionType === 6) {
        original.led = 'blue';
        answer.led = 'blue';
        original = setNNodes(original, 5);
        original = setWires(original, 0, undefined);
        answer = setNNodes(answer, 5);
        answer = setWires(answer, 0, 2);
    }
    else if (solutionType === 7) {
        original.led = 'blue';
        answer.led = 'blue';
        original = setNNodes(original, 5);
        original = setWires(original, 2, undefined);
        answer = setNNodes(answer, 5);
        answer = setWires(answer, 0, 1);
    }
    else if (solutionType === 8) {
        original.led = 'blue';
        answer.led = 'blue';
        answer = setNNodes(answer, Math.floor(Math.random()*3)+2);
        answer = setNWires(answer, 1);
    }
    else if (solutionType === 9) {
        original.led = 'blue';
        answer.led = 'blue';
        answer = setNNodes(answer, Math.floor(Math.random()*3)+2);
        answer = setCutWires(answer, Math.floor(Math.random()*3));
    }
    else if (solutionType === 10) {
        answer.led = Math.random() < 0.33 ? 'blue' : Math.random() < 0.5 ? 'green' : 'yellow';
        original = setNNodes(original, 4);
        original = setWires(original, 0, 2);
        answer = setNNodes(answer, 5);
        answer = setWires(answer, 0, 2);
    }
    else if (solutionType === 11) {
        answer.led = Math.random() < 0.33 ? 'blue' : Math.random() < 0.5 ? 'green' : 'yellow';
        original = setNNodes(original, 4);
        original = setWires(original, 0, undefined);
        answer = setNNodes(answer, 5);
        answer = setWires(answer, 0, 1);
    }
    else if (solutionType === 12) {
        answer.led = Math.random() < 0.33 ? 'blue' : Math.random() < 0.5 ? 'green' : 'yellow';
        original = setNNodes(original, 3);
        original = setWires(original, 1, 0);
        answer = setNNodes(answer, Math.floor(Math.random()*2)+4);
        answer = setWires(answer, Math.floor(Math.random()*2)+2, 0);
    }
    else if (solutionType === 13) {
        answer.led = Math.random() < 0.33 ? 'blue' : Math.random() < 0.5 ? 'green' : 'yellow';
        original = setNNodes(original, 3);
        original = setWires(original, 1, undefined);
        answer = setNNodes(answer, Math.floor(Math.random()*2)+4);
        answer = setWires(answer, Math.floor(Math.random()*2)+2, 1);
    }
    else if (solutionType === 14) {
        answer.led = Math.random() < 0.33 ? 'blue' : Math.random() < 0.5 ? 'green' : 'yellow';
        original = setNNodes(original, 3);
        original = setCutWires(original, 2);
        answer = setNNodes(answer, 3);
        answer = setCutWires(answer, 2);
    }
    else if (solutionType === 15) {
        answer.led = Math.random() < 0.33 ? 'blue' : Math.random() < 0.5 ? 'green' : 'yellow';
        original = setNNodes(original, 3);
        original = setNWires(original, 3);
    }

    return {original: original, answer: answer};
}

function generateChallenge() {
    var solutionPair = generateSolutionPair();
    var options = generateCircuits(solutionPair.original, solutionPair.answer, 9);
    return {original: solutionPair.original, options: options};
}

// for (var i = 0; i < 100; i++) {
//     var solutionPair = generateSolutionPair();
//     if (!checkCircuit(solutionPair.original, solutionPair.answer)) {
//         console.log('FALSE');
//         renderCircuit(solutionPair.original);
//     }
//     if (i === 99) {
//         console.log('DONE');
//     }
// }
