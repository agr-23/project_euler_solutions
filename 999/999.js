// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/999.py

const MOD = 1_234_567_891n;
const INV_TWO = (MOD + 1n) / 2n;

const SMALL_W = [0n, 1n, 2n, -4n, -32n, -192n, 3584n, 77824n, 262144n];

function smallW(index) {
    if (index < 0n) {
        const pos = smallW(-index);
        return (MOD - pos % MOD) % MOD;
    }
    const v = SMALL_W[Number(index)];
    if (v < 0n) {
        return ((v % MOD) + MOD) % MOD;
    }
    return v % MOD;
}

function powMod(base, exp, modulus) {
    let result = 1n;
    base = base % modulus;
    while (exp > 0n) {
        if (exp % 2n === 1n) {
            result = result * base % modulus;
        }
        exp /= 2n;
        base = base * base % modulus;
    }
    return result;
}

function edsBlock(n) {
    if (n <= 4n) {
        const result = [];
        for (let i = 0n; i < 8n; i++) {
            result.push(smallW(n - 3n + i));
        }
        return result;
    }

    const middle = n / 2n;
    const source = edsBlock(middle);
    const sourceStart = middle - 3n;

    function get(index) {
        return source[Number(index - sourceStart)];
    }

    function odd(index) {
        const a = get(index + 1n);
        const b = powMod(get(index - 1n), 3n, MOD);
        const c = get(index - 2n);
        const d = powMod(get(index), 3n, MOD);
        return (a * b % MOD + MOD - c * d % MOD) % MOD;
    }

    function even(index) {
        const a = get(index);
        const b = get(index + 2n);
        const c = powMod(get(index - 1n), 2n, MOD);
        const d = get(index - 2n);
        const e = powMod(get(index + 1n), 2n, MOD);
        const inner = (b * c % MOD + MOD - d * e % MOD) % MOD;
        return a * INV_TWO % MOD * inner % MOD;
    }

    if (n % 2n === 0n) {
        return [
            odd(middle - 1n),
            even(middle - 1n),
            odd(middle),
            even(middle),
            odd(middle + 1n),
            even(middle + 1n),
            odd(middle + 2n),
            even(middle + 2n),
        ];
    }

    return [
        even(middle - 1n),
        odd(middle),
        even(middle),
        odd(middle + 1n),
        even(middle + 1n),
        odd(middle + 2n),
        even(middle + 2n),
        odd(middle + 3n),
    ];
}

function wMod(n) {
    if (n < 0n) {
        const pos = wMod(-n);
        return (MOD - pos % MOD) % MOD;
    }
    return edsBlock(n)[3];
}

function aMod(n) {
    console.assert(n >= 1n, "n must be >= 1");
    const rem = n % 4n;
    const signPositive = rem === 1n || rem === 2n;
    const exp = n * n / 4n;
    const inverseScale = powMod(INV_TWO, exp, MOD);
    const wval = wMod(n);
    if (signPositive) {
        return wval * inverseScale % MOD;
    } else {
        return (MOD - wval * inverseScale % MOD) % MOD;
    }
}

function main() {
    console.assert(aMod(1n) === 1n);
    console.assert(aMod(2n) === 1n);
    console.assert(aMod(3n) === 1n);
    console.assert(aMod(4n) === 2n);
    console.assert(aMod(13n) === 23321n);
    console.assert(aMod(1003n) === 231906014n);

    console.log(aMod(1_000_000_000_000_000_003n).toString());
}

main();