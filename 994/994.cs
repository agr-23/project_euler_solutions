// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/994.py

using System;
using System.Collections.Generic;

class Program
{
    const long MOD = 1_000_000_007L;
    const long INV2 = (MOD + 1) / 2;

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

    static readonly long INV6 = ModPow(6, MOD - 2, MOD);

    static long C2Mod(long x)
    {
        x = ((x % MOD) + MOD) % MOD;
        return x * ((x - 1 + MOD) % MOD) % MOD * INV2 % MOD;
    }

    static long C3Mod(long x)
    {
        x = ((x % MOD) + MOD) % MOD;
        return x * ((x - 1 + MOD) % MOD) % MOD * ((x - 2 + MOD) % MOD) % MOD * INV6 % MOD;
    }

    static long P1(long n)
    {
        n = ((n % MOD) + MOD) % MOD;
        return n * ((n + 1) % MOD) % MOD * INV2 % MOD;
    }

    static long P2(long n)
    {
        n = ((n % MOD) + MOD) % MOD;
        return n * ((n + 1) % MOD) % MOD * ((2 * n + 1) % MOD) % MOD * INV6 % MOD;
    }

    static long P3(long n)
    {
        long s = P1(n);
        return s * s % MOD;
    }

    class TotientPrefix
    {
        public int Limit;
        public int[] Pref0;
        public int[] Pref1;
        public int[] Pref2;
        public Dictionary<long, (long, long, long)> Cache = new Dictionary<long, (long, long, long)>();

        public TotientPrefix(int limit)
        {
            Limit = limit;
            var (p0, p1, p2) = Build(limit);
            Pref0 = p0; Pref1 = p1; Pref2 = p2;
        }

        static (int[], int[], int[]) Build(int limit)
        {
            var phi = new int[limit + 1];
            for (int i = 0; i <= limit; i++) phi[i] = i;
            for (int p = 2; p <= limit; p++)
            {
                if (phi[p] == p)
                {
                    for (int j = p; j <= limit; j += p)
                        phi[j] -= phi[j] / p;
                }
            }
            var pref0 = new int[limit + 1];
            var pref1 = new int[limit + 1];
            var pref2 = new int[limit + 1];
            long s0 = 0, s1 = 0, s2 = 0;
            for (int i = 1; i <= limit; i++)
            {
                long ph = phi[i] % MOD;
                long im = (long)i % MOD;
                s0 = (s0 + ph) % MOD;
                s1 = (s1 + im * ph) % MOD;
                s2 = (s2 + im * im % MOD * ph) % MOD;
                pref0[i] = (int)s0;
                pref1[i] = (int)s1;
                pref2[i] = (int)s2;
            }
            return (pref0, pref1, pref2);
        }

        public (long, long, long) Values(long n)
        {
            if (n <= 0L) return (0L, 0L, 0L);
            if (n <= (long)Limit)
            {
                int ni = (int)n;
                return (Pref0[ni], Pref1[ni], Pref2[ni]);
            }
            if (Cache.TryGetValue(n, out var cached)) return cached;
            long f0 = P1(n);
            long f1 = P2(n);
            long f2 = P3(n);
            long l = 2;
            while (l <= n)
            {
                long q = n / l;
                long r = n / q;
                long sum0 = ((r - l + 1) % MOD + MOD) % MOD;
                long sum1 = (P1(r) - P1(l - 1) + MOD) % MOD;
                long sum2 = (P2(r) - P2(l - 1) + MOD) % MOD;
                var (sub0, sub1, sub2) = Values(q);
                f0 = (f0 - sum0 * sub0 % MOD + MOD) % MOD;
                f1 = (f1 - sum1 * sub1 % MOD + MOD) % MOD;
                f2 = (f2 - sum2 * sub2 % MOD + MOD) % MOD;
                l = r + 1;
            }
            var outVal = (f0, f1, f2);
            Cache[n] = outVal;
            return outVal;
        }
    }

    static long NonconcurrentCandidateCount(long m, long n)
    {
        long mm = ((m % MOD) + MOD) % MOD;
        long mm1 = ((m - 1) % MOD + MOD) % MOD;
        long nm = ((n % MOD) + MOD) % MOD;
        long nm1 = ((n - 1) % MOD + MOD) % MOD;
        long np1 = ((n + 1) % MOD + MOD) % MOD;
        long twoSameBottom = mm * mm1 % MOD * nm % MOD * nm1 % MOD * np1 % MOD * INV6 % MOD;
        long distinctBottoms = C3Mod(m) * ((C3Mod(n + 2) - nm + MOD) % MOD) % MOD;
        return (twoSameBottom + distinctBottoms) % MOD;
    }

    static long WeightedGcdSum(long m, long n, TotientPrefix tp)
    {
        long m1 = m - 1;
        long n1 = n - 1;
        long upper = Math.Min(m1, n1);
        long total = 0;
        long l = 1;
        while (l <= upper)
        {
            long qm = m1 / l;
            long qn = n1 / l;
            long r = Math.Min(Math.Min(m1 / qm, n1 / qn), upper);
            var (r0, r1, r2) = tp.Values(r);
            var (l0, l1, l2) = tp.Values(l - 1);
            long s0 = (r0 - l0 + MOD) % MOD;
            long s1 = (r1 - l1 + MOD) % MOD;
            long s2 = (r2 - l2 + MOD) % MOD;
            long qmMod = qm % MOD;
            long qnMod = qn % MOD;
            long mm = m % MOD;
            long nm = n % MOD;
            long a0m = qmMod * mm % MOD;
            long a1m = (MOD - qmMod * ((qm + 1) % MOD) % MOD * INV2 % MOD) % MOD;
            long a0n = qnMod * nm % MOD;
            long a1n = (MOD - qnMod * ((qn + 1) % MOD) % MOD * INV2 % MOD) % MOD;
            long c0 = a0m * a0n % MOD;
            long c1 = (a0m * a1n + a1m * a0n) % MOD;
            long c2 = a1m * a1n % MOD;
            total = (total + c0 * s0 % MOD + c1 * s1 % MOD + c2 * s2 % MOD) % MOD;
            l = r + 1;
        }
        return total;
    }

    static long ConcurrentTripleCount(long m, long n, TotientPrefix tp)
    {
        long gcdPart = WeightedGcdSum(m, n, tp);
        long ep = C2Mod(m) * C2Mod(n) % MOD;
        return (gcdPart - ep + MOD) % MOD;
    }

    static long TFunc(long m, long n, TotientPrefix tp)
    {
        long ncc = NonconcurrentCandidateCount(m, n);
        long ctc = ConcurrentTripleCount(m, n, tp);
        return (ncc - ctc + MOD) % MOD;
    }

    static void Main()
    {
        string sieveLimitStr = Environment.GetEnvironmentVariable("SIEVE_LIMIT") ?? "10000000";
        int sieveLimit = int.Parse(sieveLimitStr);
        var tp = new TotientPrefix(sieveLimit);
        System.Diagnostics.Debug.Assert(TFunc(2, 3, tp) == 8);
        System.Diagnostics.Debug.Assert(TFunc(3, 5, tp) == 146);
        System.Diagnostics.Debug.Assert(TFunc(12, 23, tp) == 756716);
        Console.WriteLine(TFunc(1234L * 100_000_000L, 2345L * 100_000_000L, tp));
    }
}
