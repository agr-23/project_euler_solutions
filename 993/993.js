// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/993.py

const PERIOD_START = 514n;
const PERIOD = 71n;
const DELTA_PATTERN = [
    17n, -2n, -8n, -2n, -2n, -14n, -2n, -2n, -17n, -8n, -5n, -8n, -5n, -2n, -2n, -5n, -8n,
    50n, -8n, 23n, -13n, -2n, 67n, -5n, -2n, -2n, -5n, -8n, -5n, 21n, 29n, -11n, -2n, -2n,
    6n, -11n, 31n, -2n, -11n, 17n, -2n, -8n, -2n, -2n, -14n, -2n, -2n, -17n, -8n, -5n, -8n,
    -8n, 8n, -13n, -5n, -2n, -2n, -5n, -2n, -11n, -8n, -8n, -5n, -2n, -11n, -8n, -8n, -5n,
    -2n, -11n, 216n,
];
const PATTERN_SUM = DELTA_PATTERN.reduce((a, b) => a + b, 0n);

function setKey(s) {
    return Array.from(s).sort((a, b) => Number(a - b)).join(',');
}

function stepState(pos, carry, bananas) {
    const hasX = bananas.has(pos);
    const hasX1 = bananas.has(pos + 1n);
    if (hasX && hasX1) {
        const nb = new Set(bananas);
        nb.delete(pos + 1n);
        return [pos - 1n, carry + 1n, nb];
    }
    if (hasX && !hasX1) {
        const nb = new Set(bananas);
        nb.delete(pos);
        return [pos + 2n, carry + 1n, nb];
    }
    if (!hasX && hasX1) {
        const nb = new Set(bananas);
        nb.delete(pos + 1n);
        nb.add(pos);
        return [pos + 2n, carry, nb];
    }
    if (carry >= 3n) {
        const nb = new Set(bananas);
        nb.add(pos - 1n);
        nb.add(pos);
        nb.add(pos + 1n);
        return [pos - 2n, carry - 3n, nb];
    }
    return null;
}

function simulateSteps(initialBananas, steps) {
    let pos = 0n;
    let carry = BigInt(initialBananas);
    let bananas = new Set();
    for (let i = 0; i < steps; i++) {
        const nxt = stepState(pos, carry, bananas);
        if (nxt === null) break;
        [pos, carry, bananas] = nxt;
    }
    return [pos, carry, bananas];
}

function simulateBbValues(limit) {
    const bb = [0n];
    let pos = 0n;
    let carry = 0n;
    let bananas = new Set();
    for (let n = 1n; n <= BigInt(limit); n++) {
        carry += 1n;
        while (true) {
            const nxt = stepState(pos, carry, bananas);
            if (nxt === null) {
                bb.push(pos);
                break;
            }
            [pos, carry, bananas] = nxt;
        }
    }
    return bb;
}

function buildPrefix() {
    return simulateBbValues(PERIOD_START + PERIOD);
}

function bbFunc(n, bbPrefix) {
    n = BigInt(n);
    if (n <= PERIOD_START) return bbPrefix[Number(n)];
    const remaining = n - PERIOD_START;
    const wholePeriods = remaining / PERIOD;
    const tail = Number(remaining % PERIOD);
    let tailSum = 0n;
    for (let i = 0; i < tail; i++) tailSum += DELTA_PATTERN[i];
    return bbPrefix[Number(PERIOD_START)] + wholePeriods * PATTERN_SUM + tailSum;
}

function setsEqual(a, b) {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
}

const bbPrefix = buildPrefix();

let [pos, carry, bananas] = simulateSteps(3, 1);
console.assert(pos === -2n, "pos should be -2");
console.assert(carry === 0n, "carry should be 0");
console.assert(setsEqual(bananas, new Set([-1n, 0n, 1n])), "bananas mismatch");

[pos, carry, bananas] = simulateSteps(5, 5);
console.assert(pos === -1n, "pos should be -1");
console.assert(carry === 0n, "carry should be 0");
console.assert(setsEqual(bananas, new Set([-2n, -1n, 0n, 1n, 2n])), "bananas mismatch");

console.assert(bbFunc(1000n, bbPrefix) === 1499n, "bb(1000) should be 1499");

const deltas = [];
for (let i = 0; i < bbPrefix.length - 1; i++) deltas.push(bbPrefix[i + 1] - bbPrefix[i]);
for (let i = 0; i < DELTA_PATTERN.length; i++) {
    console.assert(deltas[Number(PERIOD_START) + i] === DELTA_PATTERN[i], `delta mismatch at ${i}`);
}

console.log(bbFunc(10n ** 18n, bbPrefix).toString());
