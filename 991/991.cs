// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/991.py

using System;
using System.Collections.Generic;

class Program
{
    const long LIMIT = 10_000_000L;

    static long GcdLong(long a, long b) => b == 0 ? a : GcdLong(b, a % b);

    static long IsqrtLong(long n)
    {
        if (n < 0) return 0;
        long x = (long)Math.Sqrt((double)n);
        while (x * x > n) x--;
        while ((x + 1) * (x + 1) <= n) x++;
        return x;
    }

    static List<long> PrimitiveSolutions(long limit)
    {
        var sums = new List<long>();

        long mMax = IsqrtLong(limit / 4L) + 2L;
        for (long m = 1; m <= mMax; m++)
        {
            long nMin = IsqrtLong(3L * m * m) + 1L;
            long nMax = 2L * m - 1L;
            for (long n = nMin; n <= nMax; n++)
            {
                if (GcdLong(m, n) != 1) continue;
                long a = 4L * m * m - n * n;
                long c = n * n - 3L * m * m;
                long b = 5L * m * m - n * n + m * n;
                long s = a + b + c;
                if (a <= 0 || b <= 0 || c <= 0) continue;
                if (s <= limit) sums.Add(s);
            }
        }

        double alpha = 2.0 + Math.Sqrt(3.0);
        double beta = (5.0 + Math.Sqrt(21.0)) / 2.0;
        long k = 1L;
        while (true)
        {
            long low = (long)(alpha * k) + 1L;
            while ((2L * low - k) * (2L * low - k) <= 3L * low * low)
                low++;
            long highPos = (long)(beta * k);
            while (highPos > 0 && !(-highPos * highPos + 5L * highPos * k - k * k > 0))
                highPos--;
            long highSum = (limit + k * k) / (5L * k);
            long high = Math.Min(highPos, highSum);
            if (low > highSum) break;
            for (long m = low; m <= high; m++)
            {
                if (GcdLong(m, k) != 1) continue;
                long n = 2L * m - k;
                long a = 4L * m * m - n * n;
                long c = n * n - 3L * m * m;
                long b = 5L * m * m - n * n - m * n;
                long s = a + b + c;
                if (a <= 0 || b <= 0 || c <= 0) continue;
                if (s <= limit) sums.Add(s);
            }
            k++;
        }

        return sums;
    }

    static long Solve(long limit)
    {
        var primitive = PrimitiveSolutions(limit);
        long total = 0;
        foreach (long s in primitive)
        {
            long count = limit / s;
            total += s * count * (count + 1L) / 2L;
        }
        return total;
    }

    static long BruteForce(long limit)
    {
        long total = 0;
        for (long a = 1; a <= limit; a++)
            for (long b = 1; b <= limit - a; b++)
            {
                long maxC = limit - a - b;
                for (long c = 1; c <= maxC; c++)
                {
                    long lhsNum = a * (a + c) + (b + c) * (b + c);
                    long lhsDen = (b + c) * (a + c);
                    if (lhsNum == 4L * lhsDen)
                        total += a + b + c;
                }
            }
        return total;
    }

    static void RunTests()
    {
        long m = 4L, n = 7L;
        System.Diagnostics.Debug.Assert(
            (4L*m*m - n*n) == 15L && (5L*m*m - n*n - m*n) == 3L && (n*n - 3L*m*m) == 1L);
        System.Diagnostics.Debug.Assert(
            (4L*m*m - n*n) == 15L && (5L*m*m - n*n + m*n) == 59L && (n*n - 3L*m*m) == 1L);
        System.Diagnostics.Debug.Assert(Solve(18) == 0);
        System.Diagnostics.Debug.Assert(Solve(19) == BruteForce(19));
        System.Diagnostics.Debug.Assert(Solve(75) == BruteForce(75));
        System.Diagnostics.Debug.Assert(Solve(200) == BruteForce(200));
    }

    static void Main()
    {
        RunTests();
        Console.WriteLine(Solve(LIMIT));
    }
}
