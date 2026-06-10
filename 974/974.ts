// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/974.py

const DIGITS_ARR: number[] = [1, 3, 5, 7, 9];
const BIT_MAP: { [key: number]: number } = { 1: 0, 3: 1, 5: 2, 7: 3, 9: 4 };
const ALL_MASK: number = (1 << 5) - 1;

function countLen(L: number): bigint {
    const memo: Map<string, bigint> = new Map();
    function dp(pos: number, mod3: number, mod7: number, mask: number): bigint {
        if (pos === L) {
            return (mod3 === 0 && mod7 === 0 && mask === ALL_MASK) ? 1n : 0n;
        }
        const key = `${pos},${mod3},${mod7},${mask}`;
        if (memo.has(key)) return memo.get(key)!;
        const choices: number[] = (pos === L - 1) ? [5] : DIGITS_ARR;
        let total: bigint = 0n;
        for (const d of choices) {
            total += dp(
                pos + 1,
                (mod3 * 10 + d) % 3,
                (mod7 * 10 + d) % 7,
                mask ^ (1 << BIT_MAP[d])
            );
        }
        memo.set(key, total);
        return total;
    }
    return dp(0, 0, 0, 0);
}

function unrank(L: number, k: bigint): string {
    const memo: Map<string, bigint> = new Map();
    function dp(pos: number, mod3: number, mod7: number, mask: number): bigint {
        if (pos === L) {
            return (mod3 === 0 && mod7 === 0 && mask === ALL_MASK) ? 1n : 0n;
        }
        const key = `${pos},${mod3},${mod7},${mask}`;
        if (memo.has(key)) return memo.get(key)!;
        const choices: number[] = (pos === L - 1) ? [5] : DIGITS_ARR;
        let total: bigint = 0n;
        for (const d of choices) {
            total += dp(
                pos + 1,
                (mod3 * 10 + d) % 3,
                (mod7 * 10 + d) % 7,
                mask ^ (1 << BIT_MAP[d])
            );
        }
        memo.set(key, total);
        return total;
    }
    let mod3: number = 0, mod7: number = 0, mask: number = 0;
    const out: string[] = [];
    let remaining: bigint = k;
    for (let pos = 0; pos < L; pos++) {
        const choices: number[] = (pos === L - 1) ? [5] : DIGITS_ARR;
        let found: boolean = false;
        for (const d of choices) {
            const cnt: bigint = dp(
                pos + 1,
                (mod3 * 10 + d) % 3,
                (mod7 * 10 + d) % 7,
                mask ^ (1 << BIT_MAP[d])
            );
            if (remaining > cnt) {
                remaining -= cnt;
            } else {
                out.push(String(d));
                mod3 = (mod3 * 10 + d) % 3;
                mod7 = (mod7 * 10 + d) % 7;
                mask ^= (1 << BIT_MAP[d]);
                found = true;
                break;
            }
        }
        if (!found) throw new Error("RuntimeError");
    }
    return out.join("");
}

function theta(n: bigint, maxL: number = 200): string {
    let cum: bigint = 0n;
    for (let L = 1; L <= maxL; L += 2) {
        const c: bigint = countLen(L);
        if (cum + c >= n) {
            return unrank(L, n - cum);
        }
        cum += c;
    }
    throw new Error("ValueError");
}

const r1: string = theta(1n, 40);
if (r1 !== "1117935") throw new Error(`assert failed: ${r1}`);
const r2: string = theta(1000n, 40);
if (r2 !== "11137955115") throw new Error(`assert failed: ${r2}`);
console.log(theta(10000000000000000n, 200));
