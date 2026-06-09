// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/980.py

using System;

class Program980 {
    static int[][] BuildMulTableQ8() {
        int[][] baseArr = new int[4][];
        int[][] sgnArr = new int[4][];
        for (int i = 0; i < 4; i++) {
            baseArr[i] = new int[4];
            sgnArr[i] = new int[] {1, 1, 1, 1};
        }
        for (int a = 0; a < 4; a++) {
            for (int b = 0; b < 4; b++) {
                if (a == 0) {
                    baseArr[a][b] = b;
                    sgnArr[a][b] = 1;
                } else if (b == 0) {
                    baseArr[a][b] = a;
                    sgnArr[a][b] = 1;
                } else if (a == b) {
                    baseArr[a][b] = 0;
                    sgnArr[a][b] = -1;
                } else {
                    if (a == 1 && b == 2) { baseArr[a][b] = 3; sgnArr[a][b] = 1; }
                    else if (a == 2 && b == 3) { baseArr[a][b] = 1; sgnArr[a][b] = 1; }
                    else if (a == 3 && b == 1) { baseArr[a][b] = 2; sgnArr[a][b] = 1; }
                    else if (a == 2 && b == 1) { baseArr[a][b] = 3; sgnArr[a][b] = -1; }
                    else if (a == 3 && b == 2) { baseArr[a][b] = 1; sgnArr[a][b] = -1; }
                    else if (a == 1 && b == 3) { baseArr[a][b] = 2; sgnArr[a][b] = -1; }
                    else { throw new Exception("Unexpected basis multiplication case"); }
                }
            }
        }
        int[][] mulTable = new int[8][];
        for (int i = 0; i < 8; i++) mulTable[i] = new int[8];
        for (int bigA = 0; bigA < 8; bigA++) {
            int sa = bigA < 4 ? 1 : -1;
            int a = bigA & 3;
            for (int bigB = 0; bigB < 8; bigB++) {
                int sb = bigB < 4 ? 1 : -1;
                int b = bigB & 3;
                int s = sa * sb * sgnArr[a][b];
                int c = baseArr[a][b];
                mulTable[bigA][bigB] = s == 1 ? c : (c ^ 4);
            }
        }
        return mulTable;
    }

    static readonly int[][] MUL_TABLE = BuildMulTableQ8();
    static readonly int[] GEN_ELEMS = {1, 2, 7};
    static readonly int[] R_TABLE;
    static readonly int[] INV_TABLE;

    static Program980() {
        R_TABLE = new int[8 * 3];
        for (int v = 0; v < 8; v++) {
            for (int b = 0; b < 3; b++) {
                R_TABLE[v * 3 + b] = MUL_TABLE[v][GEN_ELEMS[b]];
            }
        }
        INV_TABLE = new int[8];
        for (int e = 0; e < 8; e++) {
            for (int f = 0; f < 8; f++) {
                if (MUL_TABLE[e][f] == 0 && MUL_TABLE[f][e] == 0) {
                    INV_TABLE[e] = f;
                    break;
                }
            }
        }
    }

    static long ComputeF(int nVal) {
        const long MOD = 888888883L;
        const long MULT = 8888L;
        long aVal = 88888888L;
        long[] cnts = new long[8];
        int[] R = R_TABLE;
        for (int iter = 0; iter < nVal; iter++) {
            int v = 0;
            for (int step = 0; step < 50; step++) {
                v = R[v * 3 + (int)(aVal % 3)];
                aVal = (aVal * MULT) % MOD;
            }
            cnts[v]++;
        }
        long total = 0L;
        int[] invArr = INV_TABLE;
        for (int e = 0; e < 8; e++) {
            total += cnts[e] * cnts[invArr[e]];
        }
        return total;
    }

    static void Main(string[] args) {
        long r10 = ComputeF(10);
        System.Diagnostics.Debug.Assert(r10 == 13L);
        if (r10 != 13L) throw new Exception("Assert F(10) == 13 failed, got " + r10);
        long r100 = ComputeF(100);
        System.Diagnostics.Debug.Assert(r100 == 1224L);
        if (r100 != 1224L) throw new Exception("Assert F(100) == 1224 failed, got " + r100);
        long result = ComputeF(1000000);
        Console.WriteLine(result);
    }
}
