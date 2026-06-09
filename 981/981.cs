// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/981.py

using System;
using System.Numerics;

class Program981 {
    const long MODVAL = 888888883L;

    static BigInteger QbinomMinus1Int(int n, int k) {
        if ((n & 1) == 0 && (k & 1) == 1) return BigInteger.Zero;
        return BigComb(n >> 1, k >> 1);
    }

    static BigInteger BigComb(int n, int k) {
        if (k < 0 || k > n) return BigInteger.Zero;
        if (k == 0 || k == n) return BigInteger.One;
        BigInteger num = BigInteger.One;
        BigInteger den = BigInteger.One;
        int kk = k < n - k ? k : n - k;
        for (int i = 0; i < kk; i++) {
            num = num * (n - i);
            den = den * (i + 1);
        }
        return num / den;
    }

    static BigInteger BigFactorial(int n) {
        BigInteger result = BigInteger.One;
        for (int i = 2; i <= n; i++) result *= i;
        return result;
    }

    static BigInteger NExact(int X, int Y, int Z) {
        if ((X & 1) != (Y & 1) || (Y & 1) != (Z & 1)) return BigInteger.Zero;
        int n = X + Y + Z;
        BigInteger total = BigFactorial(n) / (BigFactorial(X) * BigFactorial(Y) * BigFactorial(Z));
        BigInteger diff = QbinomMinus1Int(n, X) * QbinomMinus1Int(n - X, Y);
        BigInteger sign = (((X >> 1) + (Y >> 1) + (Z >> 1)) & 1) == 0 ? BigInteger.One : BigInteger.MinusOne;
        return (total + sign * diff) / 2;
    }

    static long Modpow(long baseVal, long exp, long mod) {
        long result = 1L;
        long b = baseVal % mod;
        long e = exp;
        while (e > 0L) {
            if ((e & 1L) == 1L) result = (long)((long)result * b % mod);
            b = (long)((long)b * b % mod);
            e >>= 1;
        }
        return result;
    }

    static long MainSolve() {
        BigInteger assert1 = NExact(2, 2, 2);
        if (assert1 != 42) throw new Exception("Assert 1 failed: " + assert1);
        BigInteger assert2 = NExact(8, 8, 8);
        if (assert2 != 4732773210L) throw new Exception("Assert 2 failed: " + assert2);

        int[] cubes = new int[88];
        for (int i = 0; i < 88; i++) cubes[i] = i * i * i;
        int maxN = 3 * cubes[87];

        long[] fact = new long[maxN + 1];
        fact[0] = 1L;
        for (int i = 1; i <= maxN; i++) {
            fact[i] = (fact[i - 1] * i) % MODVAL;
        }

        long[] invfact = new long[maxN + 1];
        invfact[maxN] = Modpow(fact[maxN], MODVAL - 2L, MODVAL);
        for (int i = maxN; i > 0; i--) {
            invfact[i - 1] = (invfact[i] * i) % MODVAL;
        }

        long inv2 = (MODVAL + 1L) / 2L;

        int[] halves = new int[88];
        for (int ai = 0; ai < 88; ai++) halves[ai] = cubes[ai] >> 1;
        long[] invf = new long[88];
        for (int ai = 0; ai < 88; ai++) invf[ai] = invfact[cubes[ai]];
        int[] par = new int[88];
        for (int i = 0; i < 88; i++) par[i] = i & 1;

        long CombMod(int n, int k) {
            if (k < 0 || k > n) return 0L;
            return fact[n] * invfact[k] % MODVAL * invfact[n - k] % MODVAL;
        }

        long totalSum = 0L;
        for (int ai = 0; ai < 88; ai++) {
            int X = cubes[ai];
            int hx = halves[ai];
            long invX = invf[ai];
            int px = par[ai];
            for (int bj = 0; bj < 88; bj++) {
                int Y = cubes[bj];
                int hy = halves[bj];
                long invY = invf[bj];
                int py = par[bj];
                for (int ck = 0; ck < 88; ck++) {
                    if (px != py || py != par[ck]) continue;
                    int Z = cubes[ck];
                    int hz = halves[ck];
                    long invZ = invf[ck];
                    int n = X + Y + Z;
                    long T = fact[n];
                    T = T * invX % MODVAL;
                    T = T * invY % MODVAL;
                    T = T * invZ % MODVAL;
                    long D;
                    if ((n & 1) == 0 && (X & 1) == 1) {
                        D = 0L;
                    } else {
                        long D1 = CombMod(n >> 1, hx);
                        int n2 = n - X;
                        if ((n2 & 1) == 0 && (Y & 1) == 1) {
                            D = 0L;
                        } else {
                            long D2 = CombMod(n2 >> 1, hy);
                            D = D1 * D2 % MODVAL;
                        }
                    }
                    long Nmod;
                    if (((hx + hy + hz) & 1) == 0) {
                        Nmod = (T + D) % MODVAL * inv2 % MODVAL;
                    } else {
                        Nmod = ((T - D) % MODVAL + MODVAL) % MODVAL * inv2 % MODVAL;
                    }
                    totalSum += Nmod;
                    if (totalSum >= MODVAL) totalSum -= MODVAL;
                }
            }
        }
        return totalSum % MODVAL;
    }

    static void Main(string[] args) {
        Console.WriteLine(MainSolve());
    }
}
