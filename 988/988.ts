// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/988.py

function frogSum(aIn: number, bIn: number): bigint {
    if (aIn <= 0 || bIn <= 0) {
        throw new Error("a and b must be positive");
    }
    let a = aIn, b = bIn;
    if (a > b) {
        [a, b] = [b, a];
    }
    if (a === 1) {
        return 0n;
    }
    const aBig = BigInt(a);
    const bBig = BigInt(b);
    const width = bBig - 1n;
    const h: bigint[] = new Array(Number(width) + 1).fill(0n);
    for (let i = 1; i <= Number(width); i++) {
        h[i] = (aBig * bBig - aBig * BigInt(i) - 1n) / bBig;
    }
    let dp: Map<bigint, [bigint, bigint]> = new Map();
    for (let t = 0n; t <= h[1]; t++) {
        dp.set(t, [1n, 0n]);
    }
    for (let i = 2; i <= Number(width); i++) {
        const nextDp: Map<bigint, [bigint, bigint]> = new Map();
        for (const [prevHeight, [count, total]] of dp.entries()) {
            const limit = prevHeight < h[i] ? prevHeight : h[i];
            for (let curHeight = 0n; curHeight <= limit; curHeight++) {
                let add = 0n;
                if (prevHeight > curHeight && prevHeight > 0n) {
                    add = aBig * bBig - aBig * (BigInt(i) - 1n) - bBig * prevHeight;
                }
                const existing = nextDp.get(curHeight) || [0n, 0n];
                nextDp.set(curHeight, [
                    existing[0] + count,
                    existing[1] + total + count * add,
                ]);
            }
        }
        dp = nextDp;
    }
    let answer = 0n;
    const lastColumn = width;
    for (const [prevHeight, [count, total]] of dp.entries()) {
        let add = 0n;
        if (prevHeight > 0n) {
            add = aBig * bBig - aBig * lastColumn - bBig * prevHeight;
        }
        answer += total + count * add;
    }
    return answer;
}

function solve(): void {
    console.assert(frogSum(3, 5) === 23n, "frogSum(3,5) should be 23");
    console.assert(frogSum(5, 13) === 16336n, "frogSum(5,13) should be 16336");
    console.log(frogSum(19, 53).toString());
}

solve();
