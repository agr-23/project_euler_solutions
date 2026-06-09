// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/986.py

using System;
using System.Collections.Generic;

class Program
{
    const int LIMIT = 160;
    const int PREDICT_START_N = 33;
    const long SEARCH_WINDOW = 4096;

    static readonly Dictionary<int, long> EXCEPTION_H = new Dictionary<int, long>
    {
        {2,3},{3,5},{4,7},{5,11},{6,13},{8,21},{10,31}
    };

    static bool ExtinctForK1(int n, long k)
    {
        if (k == 0) return true;
        int size = n + 1, last = size - 1;
        long[] cells = new long[size];
        cells[last] = k;
        int zeroCount = last;
        while (true)
        {
            for (int i = 0; i < last; i++)
            {
                long old = cells[i], nxt = (old + cells[i + 1]) >> 1;
                cells[i] = nxt;
                if (old != 0) { if (nxt == 0) zeroCount++; }
                else if (nxt != 0) zeroCount--;
            }
            long oldL = cells[last], nxtL = (oldL + cells[0]) >> 1;
            cells[last] = nxtL;
            if (oldL != 0) { if (nxtL == 0) zeroCount++; }
            else if (nxtL != 0) zeroCount--;
            if (zeroCount == size) return true;
            if (zeroCount == 0) return false;
        }
    }

    static long ThresholdK1Plain(int n)
    {
        long lo = 0, hi = 1;
        while (ExtinctForK1(n, hi)) { lo = hi; hi *= 2; }
        while (lo + 1 < hi) { long mid = (lo + hi) / 2; if (ExtinctForK1(n, mid)) lo = mid; else hi = mid; }
        return lo;
    }

    static long PredictK1FromPrevious(long[] s, int n)
    {
        long a = s[n-32], b = s[n-24], c = s[n-16], d = s[n-8];
        return d + (d-c) + (d-2*c+b) + (d-3*c+3*b-a);
    }

    static long ThresholdK1WithGuess(int n, long guess)
    {
        long lo = Math.Max(0, guess - SEARCH_WINDOW), hi = guess + SEARCH_WINDOW;
        while (lo > 0 && !ExtinctForK1(n, lo)) { hi = lo; lo /= 2; }
        while (ExtinctForK1(n, hi)) { lo = hi; hi *= 2; }
        while (lo + 1 < hi) { long mid = (lo + hi) / 2; if (ExtinctForK1(n, mid)) lo = mid; else hi = mid; }
        return lo;
    }

    static long[] BuildSSequence(int maxN)
    {
        long[] s = new long[maxN + 1];
        for (int n = 1; n <= maxN; n++)
            if (n < PREDICT_START_N) s[n] = ThresholdK1Plain(n);
            else { long guess = PredictK1FromPrevious(s, n); s[n] = ThresholdK1WithGuess(n, guess); }
        return s;
    }

    static long HReduced(int c, int d, long[] s)
    {
        if (d == 1 && EXCEPTION_H.TryGetValue(c, out long v)) return v;
        return s[d + (c - 1) / 2];
    }

    static long GValueFunc(int c, int d, long[] s)
    {
        int g = Gcd(c, d), cr = c / g, dr = d / g;
        return 2 * HReduced(cr, dr, s) + 1;
    }

    static int Gcd(int a, int b) => b == 0 ? a : Gcd(b, a % b);

    static long Solve(int limit)
    {
        int maxN = limit + (limit - 1) / 2;
        long[] s = BuildSSequence(maxN);
        System.Diagnostics.Debug.Assert(GValueFunc(2, 1, s) == 7);
        System.Diagnostics.Debug.Assert(GValueFunc(1, 2, s) == 7);
        System.Diagnostics.Debug.Assert(GValueFunc(3, 1, s) == 11);
        System.Diagnostics.Debug.Assert(GValueFunc(2, 2, s) == 3);
        System.Diagnostics.Debug.Assert(GValueFunc(1, 3, s) == 15);
        var memo = new Dictionary<(int, int), long>();
        long total = 0;
        for (int c = 1; c <= limit; c++)
            for (int d = 1; d <= limit; d++)
            {
                int g = Gcd(c, d);
                var key = (c / g, d / g);
                if (!memo.TryGetValue(key, out long val))
                { val = 2 * HReduced(key.Item1, key.Item2, s) + 1; memo[key] = val; }
                total += val;
            }
        return total;
    }

    static void Main() { Console.WriteLine(Solve(LIMIT)); }
}
