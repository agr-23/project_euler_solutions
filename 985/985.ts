// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/985.py

const EPS: number = 1e-12;
const PI: number = Math.PI;

function clampVal(x: number): number {
    if (x < -1.0) return -1.0;
    if (x > 1.0) return 1.0;
    return x;
}

function computeTriangleAngles(a: number, b: number, c: number): [number, number, number] {
    const af: number = a;
    const bf: number = b;
    const cf: number = c;

    const cosA: number = clampVal((bf * bf + cf * cf - af * af) / (2.0 * bf * cf));
    const cosB: number = clampVal((af * af + cf * cf - bf * bf) / (2.0 * af * cf));
    const cosC: number = clampVal((af * af + bf * bf - cf * cf) / (2.0 * af * bf));

    const angleA: number = Math.acos(cosA);
    const angleB: number = Math.acos(cosB);
    const angleC: number = Math.acos(cosC);

    if (!(Math.abs((angleA + angleB + angleC) - PI) < 1e-7)) {
        throw new Error("Angle sum is not pi; check input or numerics.");
    }

    return [angleA, angleB, angleC];
}

function advanceAngles(angleA: number, angleB: number, angleC: number): [number, number, number] {
    return [
        PI - 2.0 * angleB,
        PI - 2.0 * angleC,
        PI - 2.0 * angleA,
    ];
}

function countValidSteps(a: number, b: number, c: number, maxSteps: number): number {
    let [angleA, angleB, angleC] = computeTriangleAngles(a, b, c);
    let steps: number = 0;
    for (let i = 0; i < maxSteps; i++) {
        [angleA, angleB, angleC] = advanceAngles(angleA, angleB, angleC);
        if (angleA <= EPS || angleB <= EPS || angleC <= EPS) {
            break;
        }
        steps += 1;
    }
    return steps;
}

function searchMinPerimeter(targetSteps: number, maxPerimeter: number): [number | null, number[][]] {
    let bestPerimeter: number | null = null;
    let bestTriangles: string[] = [];

    for (let p = 3; p <= maxPerimeter; p++) {
        if (bestPerimeter !== null && p > bestPerimeter) {
            break;
        }
        for (let a = 1; a <= Math.floor(p / 3); a++) {
            for (let b = a; b <= Math.floor((p - a) / 2); b++) {
                const c: number = p - a - b;
                if (c < b) continue;
                if (a + b <= c) continue;
                const steps: number = countValidSteps(a, b, c, targetSteps + 2);
                if (steps === targetSteps) {
                    const triple: number[] = [a, b, c].sort((x, y) => x - y);
                    const key: string = triple.join(',');
                    if (bestPerimeter === null || p < bestPerimeter) {
                        bestPerimeter = p;
                        bestTriangles = [key];
                    } else if (p === bestPerimeter) {
                        bestTriangles.push(key);
                    }
                }
            }
        }
    }

    const uniqueSorted: string[] = [...new Set(bestTriangles)].sort();
    const result: number[][] = uniqueSorted.map((k: string) => k.split(',').map(Number));
    return [bestPerimeter, result];
}

function solveProblem(targetSteps: number): [number, number[]] {
    let bestPerimeter: number | null = null;
    let bestTriangle: number[] | null = null;
    let n: number = 2;

    while (true) {
        const candidates: [number, number, number][] = [
            [n, n, n + 1],
            [n, n + 1, n + 1],
        ];
        for (const [a, b, c] of candidates) {
            const steps: number = countValidSteps(a, b, c, targetSteps + 2);
            if (steps === targetSteps) {
                const p: number = a + b + c;
                if (bestPerimeter === null || p < bestPerimeter) {
                    bestPerimeter = p;
                    bestTriangle = [a, b, c];
                }
            }
        }
        n += 1;
        if (bestPerimeter !== null) {
            if (3 * n + 1 > bestPerimeter) {
                break;
            }
        }
        if (n > 5000000) {
            throw new Error("Search did not converge; check logic.");
        }
    }

    return [bestPerimeter as number, bestTriangle as number[]];
}

function main(): void {
    const steps8910: number = countValidSteps(8, 9, 10, 10);
    console.assert(steps8910 === 2, `Expected 2 steps for (8,9,10), got ${steps8910}`);

    const [minP2, tris2] = searchMinPerimeter(2, 50);
    console.assert(minP2 === 10, `Expected perimeter 10 for target_steps=2, got ${minP2}`);
    const has334: boolean = tris2.some((t: number[]) => t[0] === 3 && t[1] === 3 && t[2] === 4);
    console.assert(has334, "Expected triangle (3,3,4) to be among minimisers for target_steps=2");

    const [bestPerimeter, _bestTriangle] = solveProblem(20);
    console.log(bestPerimeter);
}

main();
