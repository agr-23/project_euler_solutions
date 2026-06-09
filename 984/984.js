// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/984.py

const MODVAL = 1_000_000_007n;
const TARGET_N = 10n ** 18n;

const EVEN_POLY = [
    [31n, 40320n, 8],
    [31n, 3360n, 7],
    [67n, 1440n, 6],
    [41n, 320n, 5],
    [313n, 1440n, 4],
    [-5699n, 240n, 3],
    [16049n, 420n, 2],
    [29413n, 140n, 1],
];

function modpow(base, exp, mod) {
    let result = 1n;
    base = ((base % mod) + mod) % mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) result = result * base % mod;
        base = base * base % mod;
        exp = exp / 2n;
    }
    return result;
}

function computeEvenMod(n, mod) {
    const powers = [1n];
    const x = ((n % mod) + mod) % mod;
    for (let i = 0; i < 8; i++) {
        powers.push((powers[powers.length - 1] * x) % mod);
    }
    let total = -419n;
    for (const [numerator, denominator, power] of EVEN_POLY) {
        total += numerator * powers[power] * modpow(denominator, mod - 2n, mod);
        total = ((total % mod) + mod) % mod;
    }
    return total;
}

function gcd(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    while (b !== 0n) {
        [a, b] = [b, a % b];
    }
    return a;
}

function computeEvenInt(n) {
    let numTotal = -419n;
    let denTotal = 1n;
    for (const [numerator, denominator, power] of EVEN_POLY) {
        const termNum = numerator * (n ** BigInt(power));
        const termDen = denominator;
        numTotal = numTotal * termDen + termNum * denTotal;
        denTotal = denTotal * termDen;
        const g = gcd(numTotal < 0n ? -numTotal : numTotal, denTotal < 0n ? -denTotal : denTotal);
        numTotal = numTotal / g;
        denTotal = denTotal / g;
    }
    if (denTotal !== 1n && denTotal !== -1n) {
        throw new Error("Expected integral closed-form value");
    }
    return denTotal === -1n ? -numTotal : numTotal;
}

function runSolve() {
    const check1 = computeEvenInt(100n);
    console.assert(check1 === 8658918531876n, `Expected 8658918531876 got ${check1}`);
    const check2 = computeEvenMod(10000n, MODVAL);
    console.assert(check2 === 377956308n, `Expected 377956308 got ${check2}`);
    return computeEvenMod(TARGET_N, MODVAL);
}

console.log(runSolve().toString());
