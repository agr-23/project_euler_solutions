// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/989.py

using System;
using System.Collections.Generic;

class Program
{
    const long MOD = 1_000_000_009L;
    const long TARGET_LIMIT = 100_000_000_000_000L;
    const int SMALL_NONPRIMITIVE_LIMIT = 8;

    static long ModPow(long baseVal, long exp, long modulus)
    {
        long result = 1;
        baseVal %= modulus;
        while (exp > 0)
        {
            if ((exp & 1) == 1) result = result * baseVal % modulus;
            exp >>= 1;
            baseVal = baseVal * baseVal % modulus;
        }
        return result;
    }

    static long TonelliShanks(long n, long p)
    {
        if (n == 0) return 0;
        if (ModPow(n, (p - 1) / 2, p) != 1) throw new Exception("not a quadratic residue");
        if (p % 4 == 3) return ModPow(n, (p + 1) / 4, p);
        long q = p - 1; int s = 0;
        while (q % 2 == 0) { q /= 2; s++; }
        long z = 2;
        while (ModPow(z, (p - 1) / 2, p) != p - 1) z++;
        int m = s;
        long c = ModPow(z, q, p), t = ModPow(n, q, p), r = ModPow(n, (q + 1) / 2, p);
        while (t != 1)
        {
            int i = 1; long t2i = t * t % p;
            while (t2i != 1) { t2i = t2i * t2i % p; i++; }
            long b = ModPow(c, 1L << (m - i - 1), p);
            r = r * b % p; c = b * b % p; t = t * c % p; m = i;
        }
        return r;
    }

    static long IsqrtL(long n)
    {
        if (n == 0) return 0;
        long x = (long)Math.Sqrt((double)n);
        while (x * x > n) x--;
        while ((x + 1) * (x + 1) <= n) x++;
        return x;
    }

    static long GcdL(long a, long b) => b == 0 ? a : GcdL(b, a % b);

    static readonly long SQRT5_MOD = TonelliShanks(5, MOD);
    static readonly long INV_SQRT5_MOD = ModPow(TonelliShanks(5, MOD), MOD - 2, MOD);
    static readonly long INV2_MOD = (MOD + 1) / 2;
    static readonly long PHI_MOD_VAL;
    static readonly long PHI_INV_MOD_VAL;
    static readonly long PSI_MOD_VAL;
    static readonly long PHI_SQUARED_MOD_VAL;
    static readonly long PHI_INV_SQUARED_MOD_VAL;

    static List<List<int>> SMALL_NONPRIMITIVE_TERMS_DATA;

    static Program()
    {
        long sqrt5 = TonelliShanks(5, MOD);
        long inv2 = (MOD + 1) / 2;
        PHI_MOD_VAL = (1 + sqrt5) % MOD * inv2 % MOD;
        PHI_INV_MOD_VAL = ModPow(PHI_MOD_VAL, MOD - 2, MOD);
        PSI_MOD_VAL = (1 - sqrt5 + MOD) % MOD;
        PHI_SQUARED_MOD_VAL = PHI_MOD_VAL * PHI_MOD_VAL % MOD;
        PHI_INV_SQUARED_MOD_VAL = PHI_INV_MOD_VAL * PHI_INV_MOD_VAL % MOD;
        SMALL_NONPRIMITIVE_TERMS_DATA = BuildSmallNonprimitiveterms(SMALL_NONPRIMITIVE_LIMIT);
    }

    static List<List<int>> BuildSmallNonprimitiveterms(int maxLimit)
    {
        var values = new List<int>();
        int maxA = (int)IsqrtL(maxLimit) * 2 + 2;
        for (int a = 2; a <= maxA; a++)
            for (int b = 1; b <= a / 2; b++)
            {
                int q = a * a - a * b - b * b;
                if (q > 0 && q <= maxLimit) values.Add(q);
            }
        values.Sort();
        var terms = new List<List<int>>(maxLimit + 1);
        for (int i = 0; i <= maxLimit; i++) terms.Add(new List<int>());
        var prefix = new List<int>();
        int index = 0, total = values.Count;
        for (int limit = 0; limit <= maxLimit; limit++)
        {
            while (index < total && values[index] <= limit) { prefix.Add(values[index]); index++; }
            terms[limit] = new List<int>(prefix);
        }
        return terms;
    }

    static (long, long) EvalSmallNonprimitivePair(int limit, long z1, long z2)
    {
        var ts = SMALL_NONPRIMITIVE_TERMS_DATA[limit];
        long total1 = 0, total2 = 0, power1 = 1, power2 = 1, exponent = 0;
        foreach (var target in ts)
        {
            while (exponent < target) { power1 = power1 * z1 % MOD; power2 = power2 * z2 % MOD; exponent++; }
            total1 += power1; if (total1 >= MOD) total1 -= MOD;
            total2 += power2; if (total2 >= MOD) total2 -= MOD;
        }
        return (total1, total2);
    }

    static sbyte[] MobiusSieve(int limit)
    {
        var mu = new sbyte[limit + 1];
        for (int i = 0; i <= limit; i++) mu[i] = 1;
        var isPrime = new bool[limit + 1];
        for (int i = 0; i <= limit; i++) isPrime[i] = true;
        if (limit >= 0) isPrime[0] = false;
        if (limit >= 1) isPrime[1] = false;
        for (int p = 2; p <= limit; p++)
        {
            if (!isPrime[p]) continue;
            for (int mul = p; mul <= limit; mul += p) mu[mul] = (sbyte)-mu[mul];
            int square = p * p;
            if (square <= limit)
            {
                for (int mul = square; mul <= limit; mul += square) mu[mul] = 0;
                for (int mul = square; mul <= limit; mul += p) isPrime[mul] = false;
            }
            for (int mul = p + p; mul <= limit; mul += p) isPrime[mul] = false;
        }
        return mu;
    }

    static (long, long) NonprimitivePair(long limit, long z1, long z1Inv, long z2, long z2Inv)
    {
        if (limit <= SMALL_NONPRIMITIVE_LIMIT) return EvalSmallNonprimitivePair((int)limit, z1, z2);
        long mod = MOD, total1 = 0, total2 = 0;
        long z1Sq = z1 * z1 % mod, z2Sq = z2 * z2 % mod;
        long z1InvSq = z1Inv * z1Inv % mod, z2InvSq = z2Inv * z2Inv % mod;
        long z1Inv4 = z1InvSq * z1InvSq % mod, z2Inv4 = z2InvSq * z2InvSq % mod;
        long z1Inv5 = z1Inv4 * z1Inv % mod, z2Inv5 = z2Inv4 * z2Inv % mod;
        long z1Inv10 = z1Inv5 * z1Inv5 % mod, z2Inv10 = z2Inv5 * z2Inv5 % mod;
        long z1Inv15 = z1Inv10 * z1Inv5 % mod, z2Inv15 = z2Inv10 * z2Inv5 % mod;

        long evenWeight1 = z1Inv5, evenWeight2 = z2Inv5, evenDelta1 = z1Inv15, evenDelta2 = z2Inv15;
        long addIndex = 0, addTerm1 = 1, addTerm2 = 1, addStep1 = z1, addStep2 = z2;
        long dropIndex = 0, dropTerm1 = 1, dropTerm2 = 1, dropStep1 = z1, dropStep2 = z2;
        long window1 = 0, window2 = 0, t = 1, lower = 3, upper = 0, rhs = limit + 5;
        while ((upper + 1) * (upper + 1) <= rhs) upper++;
        while (lower <= upper)
        {
            while (addIndex <= upper)
            {
                window1 += addTerm1; if (window1 >= mod) window1 -= mod;
                window2 += addTerm2; if (window2 >= mod) window2 -= mod;
                addTerm1 = addTerm1 * addStep1 % mod; addStep1 = addStep1 * z1Sq % mod;
                addTerm2 = addTerm2 * addStep2 % mod; addStep2 = addStep2 * z2Sq % mod;
                addIndex++;
            }
            while (dropIndex < lower)
            {
                window1 -= dropTerm1; if (window1 < 0) window1 += mod;
                window2 -= dropTerm2; if (window2 < 0) window2 += mod;
                dropTerm1 = dropTerm1 * dropStep1 % mod; dropStep1 = dropStep1 * z1Sq % mod;
                dropTerm2 = dropTerm2 * dropStep2 % mod; dropStep2 = dropStep2 * z2Sq % mod;
                dropIndex++;
            }
            total1 = (total1 + window1 * evenWeight1) % mod; total2 = (total2 + window2 * evenWeight2) % mod;
            evenWeight1 = evenWeight1 * evenDelta1 % mod; evenDelta1 = evenDelta1 * z1Inv10 % mod;
            evenWeight2 = evenWeight2 * evenDelta2 % mod; evenDelta2 = evenDelta2 * z2Inv10 % mod;
            rhs += 10 * t + 5; t++; lower += 3;
            while ((upper + 1) * (upper + 1) <= rhs) upper++;
        }

        long oddWeight1 = z1Inv, oddWeight2 = z2Inv, oddDelta1 = z1Inv10, oddDelta2 = z2Inv10;
        addIndex = 0; addTerm1 = 1; addTerm2 = 1; addStep1 = z1Sq; addStep2 = z2Sq;
        dropIndex = 0; dropTerm1 = 1; dropTerm2 = 1; dropStep1 = z1Sq; dropStep2 = z2Sq;
        window1 = 0; window2 = 0; t = 0; lower = 1; upper = 0; rhs = limit + 1;
        while ((upper + 1) * (upper + 2) <= rhs) upper++;
        while (lower <= upper)
        {
            while (addIndex <= upper)
            {
                window1 += addTerm1; if (window1 >= mod) window1 -= mod;
                window2 += addTerm2; if (window2 >= mod) window2 -= mod;
                addTerm1 = addTerm1 * addStep1 % mod; addStep1 = addStep1 * z1Sq % mod;
                addTerm2 = addTerm2 * addStep2 % mod; addStep2 = addStep2 * z2Sq % mod;
                addIndex++;
            }
            while (dropIndex < lower)
            {
                window1 -= dropTerm1; if (window1 < 0) window1 += mod;
                window2 -= dropTerm2; if (window2 < 0) window2 += mod;
                dropTerm1 = dropTerm1 * dropStep1 % mod; dropStep1 = dropStep1 * z1Sq % mod;
                dropTerm2 = dropTerm2 * dropStep2 % mod; dropStep2 = dropStep2 * z2Sq % mod;
                dropIndex++;
            }
            total1 = (total1 + window1 * oddWeight1) % mod; total2 = (total2 + window2 * oddWeight2) % mod;
            oddWeight1 = oddWeight1 * oddDelta1 % mod; oddDelta1 = oddDelta1 * z1Inv10 % mod;
            oddWeight2 = oddWeight2 * oddDelta2 % mod; oddDelta2 = oddDelta2 * z2Inv10 % mod;
            rhs += 10 * t + 10; t++; lower += 3;
            while ((upper + 1) * (upper + 2) <= rhs) upper++;
        }
        return (total1, total2);
    }

    static long Solve(long limit)
    {
        int root = (int)IsqrtL(limit);
        var mu = MobiusSieve(root);
        long pPhi = 0, pPsi = 0, phiPowG2 = 1, phiInvPowG2 = 1;
        long forwardStep = PHI_MOD_VAL, backwardStep = PHI_INV_MOD_VAL, gSquare = 1;
        for (int g = 1; g <= root; g++)
        {
            phiPowG2 = phiPowG2 * forwardStep % MOD;
            forwardStep = forwardStep * PHI_SQUARED_MOD_VAL % MOD;
            phiInvPowG2 = phiInvPowG2 * backwardStep % MOD;
            backwardStep = backwardStep * PHI_INV_SQUARED_MOD_VAL % MOD;
            int muG = mu[g];
            if (muG != 0)
            {
                long scaledLimit = limit / gSquare;
                long psiPowG2, psiInvPowG2;
                if ((g & 1) == 1) { psiPowG2 = MOD - phiInvPowG2; psiInvPowG2 = MOD - phiPowG2; }
                else { psiPowG2 = phiInvPowG2; psiInvPowG2 = phiPowG2; }
                var (npPhi, npPsi) = NonprimitivePair(scaledLimit, phiPowG2, phiInvPowG2, psiPowG2, psiInvPowG2);
                if (muG == 1) { pPhi += npPhi; if (pPhi >= MOD) pPhi -= MOD; pPsi += npPsi; if (pPsi >= MOD) pPsi -= MOD; }
                else { pPhi -= npPhi; if (pPhi < 0) pPhi += MOD; pPsi -= npPsi; if (pPsi < 0) pPsi += MOD; }
            }
            gSquare += 2L * g + 1;
        }
        return (pPhi - pPsi + MOD) % MOD * INV_SQRT5_MOD % MOD;
    }

    static long BruteG(long n)
    {
        long count = 0;
        for (long x = 0; x < n; x++) if (((x * x - x - 1) % n + n) % n == 0) count++;
        return count;
    }

    static List<(long, int)> FactorizeSmall(long n)
    {
        var factors = new List<(long, int)>();
        long d = 2;
        while (d * d <= n) { if (n % d == 0) { int e = 0; while (n % d == 0) { n /= d; e++; } factors.Add((d, e)); } d += (d == 2) ? 1 : 2; }
        if (n > 1) factors.Add((n, 1));
        return factors;
    }

    static long GFromFactorization(long n)
    {
        if (n == 1) return 1;
        int splitCount = 0;
        foreach (var (prime, exponent) in FactorizeSmall(n))
        {
            if (prime == 2) return 0;
            if (prime == 5) { if (exponent >= 2) return 0; continue; }
            long residue = prime % 5;
            if (residue == 2 || residue == 3) return 0;
            splitCount++;
        }
        return 1L << splitCount;
    }

    static long ReducedPairCount(long n)
    {
        long count = 0;
        int maxA = (int)IsqrtL(n) * 2 + 2;
        for (int a = 2; a <= maxA; a++)
            for (int b = 1; b <= a / 2; b++)
            {
                if (GcdL(a, b) != 1) continue;
                if ((long)a * a - (long)a * b - (long)b * b == n) count++;
            }
        return count;
    }

    static (long, long) BruteNonprimitivePair(long limit, long z1, long z2)
    {
        long total1 = 0, total2 = 0;
        int maxA = (int)IsqrtL(limit) * 2 + 2;
        for (int a = 2; a <= maxA; a++)
            for (int b = 1; b <= a / 2; b++)
            {
                long q = (long)a * a - (long)a * b - (long)b * b;
                if (q > 0 && q <= limit) { total1 = (total1 + ModPow(z1, q, MOD)) % MOD; total2 = (total2 + ModPow(z2, q, MOD)) % MOD; }
            }
        return (total1, total2);
    }

    static long BruteFibonacciSum(long limit)
    {
        int n = (int)limit;
        var fib = new long[n + 1];
        if (n >= 1) fib[1] = 1;
        if (n >= 2) fib[2] = 1;
        for (int i = 3; i <= n; i++) fib[i] = (fib[i - 1] + fib[i - 2]) % MOD;
        long total = 0;
        for (int i = 1; i <= n; i++) total = (total + fib[i] * BruteG(i)) % MOD;
        return total;
    }

    static void Validate()
    {
        System.Diagnostics.Debug.Assert(PSI_MOD_VAL == (MOD - PHI_INV_MOD_VAL) % MOD);
        for (long n = 1; n < 200; n++) { var b = BruteG(n); System.Diagnostics.Debug.Assert(b == GFromFactorization(n) && b == ReducedPairCount(n)); }
        for (int limit = 0; limit <= SMALL_NONPRIMITIVE_LIMIT; limit++) { var fp = EvalSmallNonprimitivePair(limit, 2, 3); var bp = BruteNonprimitivePair(limit, 2, 3); System.Diagnostics.Debug.Assert(fp == bp); }
        foreach (var limit in new long[] { 1, 2, 5, 10, 30, 100 }) { System.Diagnostics.Debug.Assert(Solve(limit) == BruteFibonacciSum(limit)); }
        System.Diagnostics.Debug.Assert(Solve(1000) == 190_950_976);
    }

    static void Main()
    {
        Validate();
        Console.WriteLine(Solve(TARGET_LIMIT));
    }
}
