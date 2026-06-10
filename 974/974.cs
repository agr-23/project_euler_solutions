// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/974.py

using System;
using System.Collections.Generic;
using System.Text;

class Program974
{
    static readonly int[] DIGITS_ARR = { 1, 3, 5, 7, 9 };
    static readonly Dictionary<int, int> BIT_TABLE = new Dictionary<int, int>
    {
        { 1, 0 }, { 3, 1 }, { 5, 2 }, { 7, 3 }, { 9, 4 }
    };
    static readonly int ALL_MASK = (1 << 5) - 1;

    static long ComputeCountLen(int bigL)
    {
        var memo = new Dictionary<long, long>();
        long Encode(int pos, int m3, int m7, int msk) =>
            (long)pos * (3L * 7L * 32L) + (long)m3 * (7L * 32L) + (long)m7 * 32L + msk;
        long Dp(int pos, int mod3, int mod7, int mask)
        {
            if (pos == bigL)
                return (mod3 == 0 && mod7 == 0 && mask == ALL_MASK) ? 1L : 0L;
            long key = Encode(pos, mod3, mod7, mask);
            if (memo.TryGetValue(key, out long cached)) return cached;
            int[] choices = (pos == bigL - 1) ? new[] { 5 } : DIGITS_ARR;
            long total = 0L;
            foreach (int d in choices)
                total += Dp(pos + 1, (mod3 * 10 + d) % 3, (mod7 * 10 + d) % 7, mask ^ (1 << BIT_TABLE[d]));
            memo[key] = total;
            return total;
        }
        return Dp(0, 0, 0, 0);
    }

    static string PerformUnrank(int bigL, long kVal)
    {
        var memo = new Dictionary<long, long>();
        long Encode(int pos, int m3, int m7, int msk) =>
            (long)pos * (3L * 7L * 32L) + (long)m3 * (7L * 32L) + (long)m7 * 32L + msk;
        long Dp(int pos, int mod3, int mod7, int mask)
        {
            if (pos == bigL)
                return (mod3 == 0 && mod7 == 0 && mask == ALL_MASK) ? 1L : 0L;
            long key = Encode(pos, mod3, mod7, mask);
            if (memo.TryGetValue(key, out long cached)) return cached;
            int[] choices = (pos == bigL - 1) ? new[] { 5 } : DIGITS_ARR;
            long total = 0L;
            foreach (int d in choices)
                total += Dp(pos + 1, (mod3 * 10 + d) % 3, (mod7 * 10 + d) % 7, mask ^ (1 << BIT_TABLE[d]));
            memo[key] = total;
            return total;
        }
        int mod3 = 0, mod7 = 0, mask = 0;
        var outSb = new StringBuilder();
        long remaining = kVal;
        for (int pos = 0; pos < bigL; pos++)
        {
            int[] choices = (pos == bigL - 1) ? new[] { 5 } : DIGITS_ARR;
            bool found = false;
            foreach (int d in choices)
            {
                long cnt = Dp(pos + 1, (mod3 * 10 + d) % 3, (mod7 * 10 + d) % 7, mask ^ (1 << BIT_TABLE[d]));
                if (remaining > cnt)
                {
                    remaining -= cnt;
                }
                else
                {
                    outSb.Append(d.ToString());
                    mod3 = (mod3 * 10 + d) % 3;
                    mod7 = (mod7 * 10 + d) % 7;
                    mask ^= (1 << BIT_TABLE[d]);
                    found = true;
                    break;
                }
            }
            if (!found) throw new Exception("RuntimeError");
        }
        return outSb.ToString();
    }

    static string ComputeTheta(long n, int maxL = 200)
    {
        long cum = 0L;
        for (int L = 1; L <= maxL; L += 2)
        {
            long c = ComputeCountLen(L);
            if (cum + c >= n)
                return PerformUnrank(L, n - cum);
            cum += c;
        }
        throw new Exception("ValueError");
    }

    static void Main(string[] args)
    {
        string r1 = ComputeTheta(1L, 40);
        if (r1 != "1117935") throw new Exception($"assert failed: {r1}");
        string r2 = ComputeTheta(1000L, 40);
        if (r2 != "11137955115") throw new Exception($"assert failed: {r2}");
        Console.WriteLine(ComputeTheta(10_000_000_000_000_000L, 200));
    }
}
