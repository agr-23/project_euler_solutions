// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/977.py

using System;
using System.Numerics;

class Program977
{
    const long MODVAL = 1_000_000_007L;

    static long Modpow(long baseVal, long exp, long mod)
    {
        long result = 1L;
        long b = baseVal % mod;
        long e = exp;
        while (e > 0L)
        {
            if (e % 2L == 1L)
                result = result * b % mod;
            e /= 2L;
            b = b * b % mod;
        }
        return result;
    }

    static long ComputeMod(int n)
    {
        long N = (long)n;
        if (N == 1L) return 1L;
        long total = 0L;
        long mVal = N - 2L;
        long sumQ = (mVal * (mVal + 1L) * (2L * mVal + 1L) / 6L + mVal * (mVal + 1L) / 2L) % MODVAL;
        total = (sumQ + N) % MODVAL;
        for (long L = 2L; L <= N; L++)
        {
            long R = N - L;
            if (R >= 1L)
            {
                long qFull = (R - 1L) / L;
                long maxA = qFull + 2L;
                long[] powA = new long[maxA + 1];
                if (L == 2L)
                {
                    for (long a = 1L; a <= maxA; a++)
                        powA[a] = (a * a) % MODVAL;
                }
                else if (L == 3L)
                {
                    for (long a = 1L; a <= maxA; a++)
                    {
                        long aa = a * a % MODVAL;
                        powA[a] = aa * a % MODVAL;
                    }
                }
                else
                {
                    for (long a = 1L; a <= maxA; a++)
                        powA[a] = Modpow(a, L, MODVAL);
                }
                for (long q = 0L; q < qFull; q++)
                {
                    long A = q + 1L;
                    long B = q + 2L;
                    long AL = powA[A];
                    long BL = powA[B];
                    long AL1 = AL * A % MODVAL;
                    long term = ((q * AL + (A * A % MODVAL) * BL - B * AL1) % MODVAL + MODVAL) % MODVAL;
                    total = (total + term) % MODVAL;
                }
                {
                    long q = qFull;
                    long mInner = (R - 1L) - qFull * L;
                    long A = q + 1L;
                    long B = q + 2L;
                    long AL = powA[A];
                    long term = q * AL % MODVAL;
                    if (mInner >= 1L)
                    {
                        long AL1 = AL * A % MODVAL;
                        long expVal = L + 1L - mInner;
                        long AL1m;
                        if (expVal == 1L) AL1m = A % MODVAL;
                        else if (expVal == 2L) AL1m = A * A % MODVAL;
                        else if (expVal == 3L) AL1m = A * A % MODVAL * A % MODVAL;
                        else AL1m = Modpow(A, expVal, MODVAL);
                        long Bm;
                        if (mInner == 1L) Bm = B % MODVAL;
                        else if (mInner == 2L) Bm = B * B % MODVAL;
                        else if (mInner == 3L) Bm = B * B % MODVAL * B % MODVAL;
                        else Bm = Modpow(B, mInner, MODVAL);
                        term = (term + B * ((AL1m * Bm - AL1) % MODVAL + MODVAL) % MODVAL) % MODVAL;
                    }
                    total = (total + term) % MODVAL;
                }
            }
            long qq = R / L;
            long rr = R - qq * L;
            long Av = qq + 1L;
            long Bv = qq + 2L;
            long baseVal2;
            if (rr == 0L)
                baseVal2 = Modpow(Av, L, MODVAL);
            else
                baseVal2 = Modpow(Av, L - rr, MODVAL) * Modpow(Bv, rr, MODVAL) % MODVAL;
            total = (total + baseVal2) % MODVAL;
        }
        return total % MODVAL;
    }

    static BigInteger ComputeExact(int n)
    {
        BigInteger N = new BigInteger(n);
        BigInteger ONE = BigInteger.One;
        BigInteger TWO = new BigInteger(2);
        BigInteger THREE = new BigInteger(3);
        BigInteger SIX = new BigInteger(6);
        if (n == 1) return ONE;
        BigInteger total = BigInteger.Zero;
        BigInteger mVal = N - TWO;
        BigInteger sumQ = mVal * (mVal + ONE) * (TWO * mVal + ONE) / SIX + mVal * (mVal + ONE) / TWO;
        total = sumQ + N;
        for (BigInteger L = TWO; L <= N; L++)
        {
            BigInteger R = N - L;
            if (R >= ONE)
            {
                BigInteger qFull = (R - ONE) / L;
                BigInteger maxA = qFull + TWO;
                BigInteger[] powA = new BigInteger[(int)maxA + 1];
                for (BigInteger a = ONE; a <= maxA; a++)
                    powA[(int)a] = BigInteger.Pow(a, (int)L);
                for (BigInteger q = BigInteger.Zero; q < qFull; q++)
                {
                    BigInteger A = q + ONE;
                    BigInteger B = q + TWO;
                    BigInteger AL = powA[(int)A];
                    BigInteger BL = powA[(int)B];
                    BigInteger term = q * AL + (A * A) * BL - B * (AL * A);
                    total += term;
                }
                {
                    BigInteger q2 = qFull;
                    BigInteger mInner = (R - ONE) - qFull * L;
                    BigInteger A = q2 + ONE;
                    BigInteger B = q2 + TWO;
                    BigInteger AL = powA[(int)A];
                    BigInteger term = q2 * AL;
                    if (mInner >= ONE)
                    {
                        BigInteger AL1 = AL * A;
                        BigInteger AL1m = BigInteger.Pow(A, (int)(L + ONE - mInner));
                        BigInteger Bm = BigInteger.Pow(B, (int)mInner);
                        term += B * (AL1m * Bm - AL1);
                    }
                    total += term;
                }
            }
            BigInteger qv = R / L;
            BigInteger rv = R - qv * L;
            BigInteger Av = qv + ONE;
            BigInteger Bv = qv + TWO;
            BigInteger baseVal = BigInteger.Pow(Av, (int)(L - rv)) * BigInteger.Pow(Bv, (int)rv);
            total += baseVal;
        }
        return total;
    }

    static void Main(string[] args)
    {
        if (ComputeExact(3) != new BigInteger(8)) throw new Exception("assert failed: ComputeExact(3)");
        if (ComputeExact(7) != new BigInteger(174)) throw new Exception("assert failed: ComputeExact(7)");
        if (ComputeExact(100) != BigInteger.Parse("570271270297640131")) throw new Exception("assert failed: ComputeExact(100)");
        int n = 1_000_000;
        Console.WriteLine(ComputeMod(n));
    }
}
