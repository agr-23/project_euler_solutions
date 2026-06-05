// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/998.py

using System;
using System.Collections.Generic;
using System.Numerics;

class Program
{
    static long GcdLong(long a, long b)
    {
        while (b != 0) { long t = b; b = a % b; a = t; }
        return a;
    }

    static long IsqrtLong(long n)
    {
        if (n < 0) throw new ArgumentException("isqrt of negative");
        if (n == 0) return 0;
        long x = (long)Math.Sqrt((double)n);
        while (x * x > n) x--;
        while ((x + 1) * (x + 1) <= n) x++;
        return x;
    }

    static List<long>[] PythagoreanPartners(int limit)
    {
        var partners = new List<long>[limit + 1];
        for (int i = 0; i <= limit; i++) partners[i] = new List<long>();
        long rMax = IsqrtLong(2L * limit) + 3L;
        for (long r = 2; r <= rMax; r++)
        {
            long rr = r * r;
            for (long s = 1; s < r; s++)
            {
                if (((r - s) & 1L) == 0L || GcdLong(r, s) != 1L) continue;
                long a = rr - s * s;
                long b = 2 * r * s;
                long m = a > b ? a : b;
                long x = a > b ? b : a;
                if (m > limit) continue;
                for (long km = m; km <= limit; km += m)
                    partners[(int)km].Add((km / m) * x);
            }
        }
        foreach (var row in partners) row.Sort();
        return partners;
    }

    static bool IsMinimumSquare(long[] sides, long twiceArea, long squareSide)
    {
        long[] ss = sides;
        long m = squareSide;
        long m2 = m * m;
        long dArea = twiceArea;
        bool hasEqualCandidate = false;

        for (int i = 0; i < 3; i++)
        {
            long d = ss[i];
            long e = ss[(i + 1) % 3];
            long f = ss[(i + 2) % 3];
            long den = 2L * d;
            long tNum = d * d + e * e - f * f;
            long dNum = d * den;
            long spanMax = Math.Max(0L, Math.Max(dNum, tNum));
            long spanMin = Math.Min(0L, Math.Min(dNum, tNum));
            long widthNum = spanMax - spanMin;
            long widthCmp = widthNum - m * den;
            long heightCmp = dArea - m * d;
            if (widthCmp < 0L && heightCmp < 0L) return false;
            if (widthCmp <= 0L && heightCmp <= 0L && (widthCmp == 0L || heightCmp == 0L))
                hasEqualCandidate = true;
        }

        for (int i = 0; i < 3; i++)
        {
            long r = ss[i];
            long p = ss[(i + 1) % 3];
            long q = ss[(i + 2) % 3];
            long kNum = p * p + q * q - r * r;
            if (kNum <= 0L) continue;
            long rDenPart = p * p + q * q - 2L * dArea;
            if (rDenPart <= 0L) continue;
            BigInteger num = (BigInteger)kNum * kNum;
            BigInteger den = 4 * (BigInteger)rDenPart;
            BigInteger p2 = (BigInteger)(p * p);
            BigInteger q2 = (BigInteger)(q * q);
            BigInteger dAreaBig = (BigInteger)dArea;
            if (num < dAreaBig * den) continue;
            if (num > p2 * den || num > q2 * den) continue;
            if (p2 * den > 2 * num || q2 * den > 2 * num) continue;
            BigInteger target = (BigInteger)m2 * den;
            if (num < target) return false;
            if (num == target) hasEqualCandidate = true;
        }

        return hasEqualCandidate;
    }

    static long Solve(int limit)
    {
        var partners = PythagoreanPartners(limit);
        var seen = new HashSet<(long, long, long)>();
        long total = 0L;

        for (int mInt = 1; mInt <= limit; mInt++)
        {
            long m = mInt;
            long mm = m * m;
            var row = new List<(long, long)> { (0L, m) };
            foreach (long x in partners[mInt])
                row.Add((x, IsqrtLong(mm + x * x)));
            int rowLen = row.Count;

            for (int i = 0; i < rowLen; i++)
            {
                var (x, hx) = row[i];
                for (int j = i; j < rowLen; j++)
                {
                    var (y, hy) = row[j];
                    long baseVal = x + y;
                    if (baseVal == 0L) continue;
                    if (baseVal > m) break;
                    if (x * y < m * (m - baseVal)) continue;
                    long[] arr = new long[] { baseVal, hx, hy };
                    Array.Sort(arr);
                    var key = (arr[0], arr[1], arr[2]);
                    if (!seen.Contains(key))
                    {
                        seen.Add(key);
                        total += arr[0] + arr[1] + arr[2];
                    }
                }
            }

            for (int i = 0; i < rowLen; i++)
            {
                var (u, hu) = row[i];
                for (int j = i; j < rowLen; j++)
                {
                    var (v, hv) = row[j];
                    long twiceArea = mm - u * v;
                    if (twiceArea <= 0L) continue;
                    long p = m - u;
                    long q = m - v;
                    long third2 = p * p + q * q;
                    long third = IsqrtLong(third2);
                    if (third * third != third2 || third == 0L) continue;
                    long[] arr = new long[] { third, hu, hv };
                    Array.Sort(arr);
                    var key = (arr[0], arr[1], arr[2]);
                    if (seen.Contains(key)) continue;
                    if (IsMinimumSquare(arr, twiceArea, m))
                    {
                        seen.Add(key);
                        total += arr[0] + arr[1] + arr[2];
                    }
                }
            }
        }

        return total;
    }

    static void Main()
    {
        System.Diagnostics.Debug.Assert(Solve(40) == 346L);
        System.Diagnostics.Debug.Assert(Solve(400) == 76402L);
        System.Diagnostics.Debug.Assert(Solve(2000) == 3237036L);
        Console.WriteLine(Solve(1_000_000));
    }
}