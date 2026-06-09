// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/978.py

function skewnessAt(t: number): string {
    if (t < 0) throw new Error("t must be non-negative");
    if (t === 0) throw new Error("Skewness at t=0 is undefined (variance 0).");
    if (t === 1) throw new Error("Skewness at t=1 is undefined (variance 0).");

    let a0 = 0n, a1 = 1n;
    let m0 = 0n, m1 = 1n;

    for (let i = 2; i <= t; i++) {
        [a0, a1] = [a1, a1 + a0];
        [m0, m1] = [m1, m1 + 3n * m0];
    }

    const a_t = a1;
    const m_t = m1;
    const mu = 1n;
    const varVal = a_t - mu * mu;

    if (varVal <= 0n) throw new Error("Variance is non-positive; skewness undefined.");

    const central3 = m_t - 3n * a_t + 2n;

    const PREC = 110;
    const SCALE = 10n ** BigInt(PREC);

    function bigSqrt(n: bigint, scale: bigint): bigint {
        const target = n * scale * scale;
        let x = BigInt(Math.ceil(Math.sqrt(Number(n)))) * scale;
        while (true) {
            const xnew = (x + target / x) / 2n;
            if (xnew >= x) break;
            x = xnew;
        }
        return x;
    }

    const sqrtVar = bigSqrt(varVal, SCALE);
    const numerator = central3 * SCALE;
    const denominator = varVal * sqrtVar;
    const resultScaled = (numerator * SCALE) / denominator;

    const str = resultScaled.toString();
    const isNeg = str.startsWith('-');
    const absStr = isNeg ? str.slice(1) : str;

    let intPart: string, fracPart: string;
    if (absStr.length <= PREC) {
        intPart = '0';
        fracPart = absStr.padStart(PREC, '0');
    } else {
        intPart = absStr.slice(0, absStr.length - PREC);
        fracPart = absStr.slice(absStr.length - PREC);
    }

    const fracDigits = fracPart.slice(0, 8);
    const nextDigit = parseInt(fracPart[8] || '0');
    let fracNum = BigInt(fracDigits);
    if (nextDigit >= 5) fracNum += 1n;

    let intNum = BigInt(intPart);
    let fracStr = fracNum.toString().padStart(8, '0');
    if (fracStr.length > 8) {
        intNum += 1n;
        fracStr = fracStr.slice(1);
    }

    return (isNeg ? '-' : '') + intNum.toString() + '.' + fracStr;
}

function main(): void {
    const sk5 = skewnessAt(5);
    if (sk5 !== '0.75000000') throw new Error(`Assert failed: sk5=${sk5}`);

    const sk10 = skewnessAt(10);
    const sk10num = parseFloat(sk10);
    if (Math.abs(sk10num - 2.50997097) >= 0.00000001) throw new Error(`Assert failed: sk10=${sk10}`);

    const sk50 = skewnessAt(50);
    console.log(sk50);
}

main();
