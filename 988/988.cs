// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/988.py

using System;
using System.Collections.Generic;

class Program
{
    static long FrogSum(long aIn, long bIn)
    {
        if (aIn <= 0 || bIn <= 0)
            throw new ArgumentException("a and b must be positive");
        long a = aIn, b = bIn;
        if (a > b) { long tmp = a; a = b; b = tmp; }
        if (a == 1) return 0;
        long width = b - 1;
        long[] h = new long[width + 1];
        for (long i = 1; i <= width; i++)
            h[i] = (a * b - a * i - 1) / b;
        var dp = new Dictionary<long, (long count, long total)>();
        for (long t = 0; t <= h[1]; t++)
            dp[t] = (1, 0);
        for (long i = 2; i <= width; i++)
        {
            var nextDp = new Dictionary<long, (long count, long total)>();
            foreach (var kvp in dp)
            {
                long prevHeight = kvp.Key;
                long count = kvp.Value.count;
                long total = kvp.Value.total;
                long limit = Math.Min(prevHeight, h[i]);
                for (long curHeight = 0; curHeight <= limit; curHeight++)
                {
                    long add = 0;
                    if (prevHeight > curHeight && prevHeight > 0)
                        add = a * b - a * (i - 1) - b * prevHeight;
                    if (!nextDp.TryGetValue(curHeight, out var existing))
                        existing = (0, 0);
                    nextDp[curHeight] = (
                        existing.count + count,
                        existing.total + total + count * add
                    );
                }
            }
            dp = nextDp;
        }
        long answer = 0;
        long lastColumn = width;
        foreach (var kvp in dp)
        {
            long prevHeight = kvp.Key;
            long count = kvp.Value.count;
            long total = kvp.Value.total;
            long add = 0;
            if (prevHeight > 0)
                add = a * b - a * lastColumn - b * prevHeight;
            answer += total + count * add;
        }
        return answer;
    }

    static void Solve()
    {
        System.Diagnostics.Debug.Assert(FrogSum(3, 5) == 23);
        System.Diagnostics.Debug.Assert(FrogSum(5, 13) == 16336);
        Console.WriteLine(FrogSum(19, 53));
    }

    static void Main()
    {
        Solve();
    }
}
