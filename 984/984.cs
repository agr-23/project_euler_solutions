// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/984.py

using System;
using System.Collections.Generic;
using System.Numerics;

class Program
{
    static readonly long MODVAL = 1_000_000_007L;
    static readonly long TARGET_N = 1_000_000_000_000_000_000L;

    static readonly (long numerator, long denominator, int power)[] EVEN_POLY =
    {
        (31L, 40320L, 8),
        (31L, 3360L, 7),
        (67L, 1440L, 6),
        (41L, 320L, 5),
        (313L, 1440L, 4),
        (-5699L, 240L, 3),
        (16049L, 420L, 2),
        (29413L, 140L, 1),
    };

    static long Modpow(long baseVal, long exp, long modulus)
    {
        long result = 1L;
        long b = ((baseVal % modulus) + modulus) % modulus;
        long e = exp;
        while (e > 0L)
        {
            if (e % 2L == 1L)
                result = (long)((BigInteger)result * b % modulus);
            b = (long)((BigInteger)b * b % modulus);
            e /= 2L;
        }
        return result;
    }

    static long ComputeEvenMod(long n, long modulus)
    {
        var powers = new List<long> { 1L };
        long x = ((n % modulus) + modulus) % modulus;
        for (int i = 0; i < 8; i++)
        {
            long last = powers[powers.Count - 1];
            powers.Add((long)((BigInteger)last * x % modulus));
        }
        long total = -419L;
        foreach (var (numerator, denominator, power) in EVEN_POLY)
        {
            long invDen = Modpow(denominator, modulus - 2L, modulus);
            long term = (long)((BigInteger)numerator * powers[power] % modulus * invDen % modulus);
            total += term;
            total = ((total % modulus) + modulus) % modulus;
        }
        return total;
    }

    static BigInteger GcdBig(BigInteger a, BigInteger b)
    {
        if (a < 0) a = -a;
        if (b < 0) b = -b;
        while (b != BigInteger.Zero)
        {
            BigInteger t = b;
            b = a % b;
            a = t;
        }
        return a;
    }

    static BigInteger ComputeEvenInt(long n)
    {
        BigInteger nBig = new BigInteger(n);
        BigInteger numTotal = new BigInteger(-419);
        BigInteger denTotal = BigInteger.One;
        foreach (var (numerator, denominator, power) in EVEN_POLY)
        {
            BigInteger termNum = new BigInteger(numerator) * BigInteger.Pow(nBig, power);
            BigInteger termDen = new BigInteger(denominator);
            numTotal = numTotal * termDen + termNum * denTotal;
            denTotal = denTotal * termDen;
            BigInteger g = GcdBig(
                numTotal < BigInteger.Zero ? -numTotal : numTotal,
                denTotal < BigInteger.Zero ? -denTotal : denTotal
            );
            numTotal = numTotal / g;
            denTotal = denTotal / g;
        }
        if (denTotal != BigInteger.One && denTotal != new BigInteger(-1))
        {
            throw new Exception("Expected integral closed-form value");
        }
        return denTotal == new BigInteger(-1) ? -numTotal : numTotal;
    }

    static long RunSolve()
    {
        BigInteger check1 = ComputeEvenInt(100L);
        System.Diagnostics.Debug.Assert(check1 == new BigInteger(8658918531876L), $"Expected 8658918531876 got {check1}");
        if (check1 != new BigInteger(8658918531876L))
            throw new Exception($"Expected 8658918531876 got {check1}");

        long check2 = ComputeEvenMod(10000L, MODVAL);
        System.Diagnostics.Debug.Assert(check2 == 377956308L, $"Expected 377956308 got {check2}");
        if (check2 != 377956308L)
            throw new Exception($"Expected 377956308 got {check2}");

        return ComputeEvenMod(TARGET_N, MODVAL);
    }

    static void Main(string[] args)
    {
        Console.WriteLine(RunSolve());
    }
}
