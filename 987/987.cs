// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/987.py

using System;
using System.Collections.Generic;
using System.Numerics;

class Program
{
    static readonly int[][] WINDOWS = {
        new[]{0,1,2,3,4}, new[]{1,2,3,4,5}, new[]{2,3,4,5,6},
        new[]{3,4,5,6,7}, new[]{4,5,6,7,8}, new[]{5,6,7,8,9},
        new[]{6,7,8,9,10}, new[]{7,8,9,10,11}, new[]{8,9,10,11,12},
        new[]{9,10,11,12,0},
    };

    static readonly bool[,] OVERLAP = new bool[10, 10];
    static readonly BigInteger[,] PERMS = new BigInteger[5, 5];

    static Program()
    {
        for (int i = 0; i < 10; i++)
        {
            var setI = new HashSet<int>(WINDOWS[i]);
            for (int j = 0; j < 10; j++)
                foreach (var r in WINDOWS[j])
                    if (setI.Contains(r)) { OVERLAP[i, j] = true; break; }
        }
        for (int n = 0; n < 5; n++)
        {
            PERMS[n, 0] = BigInteger.One;
            BigInteger value = BigInteger.One;
            for (int k = 1; k < 5; k++)
            {
                if (k <= n) { value *= (n - (k - 1)); PERMS[n, k] = value; }
            }
        }
    }

    static BigInteger[] ColoringsOfAllSubsets(int[] starts)
    {
        int k = starts.Length;
        int full = 1 << k;
        int[] adjacency = new int[k];
        for (int i = 0; i < k; i++)
            for (int j = i + 1; j < k; j++)
                if (OVERLAP[starts[i], starts[j]])
                { adjacency[i] |= 1 << j; adjacency[j] |= 1 << i; }
        bool[] independent = new bool[full];
        independent[0] = true;
        for (int mask = 1; mask < full; mask++)
        {
            int bit = mask & (-mask);
            int vertex = BitOperations.TrailingZeroCount((uint)bit);
            int rest = mask ^ bit;
            independent[mask] = independent[rest] && ((adjacency[vertex] & rest) == 0);
        }
        BigInteger[] dp = new BigInteger[full];
        dp[0] = BigInteger.One;
        for (int c = 0; c < 4; c++)
        {
            BigInteger[] newDp = new BigInteger[full];
            for (int mask = 0; mask < full; mask++)
            {
                BigInteger total = BigInteger.Zero;
                int sub = mask;
                while (true)
                {
                    if (independent[sub]) total += dp[mask ^ sub];
                    if (sub == 0) break;
                    sub = (sub - 1) & mask;
                }
                newDp[mask] = total;
            }
            dp = newDp;
        }
        return dp;
    }

    static int Popcount(int x) => BitOperations.PopCount((uint)x);

    static BigInteger LabeledCount(int[] starts)
    {
        int k = starts.Length;
        int full = 1 << k;
        BigInteger[] colorings = ColoringsOfAllSubsets(starts);
        int[] totalActive = new int[13];
        int[] activeMasksByRank = new int[13];
        for (int index = 0; index < starts.Length; index++)
        {
            int bit = 1 << index;
            foreach (var rank in WINDOWS[starts[index]])
            { totalActive[rank]++; activeMasksByRank[rank] |= bit; }
        }
        BigInteger total = BigInteger.Zero;
        for (int mask = 0; mask < full; mask++)
        {
            BigInteger ways = BigInteger.One;
            for (int rank = 0; rank < 13; rank++)
            {
                int monochromaticHere = Popcount(activeMasksByRank[rank] & mask);
                int flexibleHere = totalActive[rank] - monochromaticHere;
                BigInteger waysAtRank = PERMS[4 - monochromaticHere, flexibleHere];
                if (waysAtRank == BigInteger.Zero) { ways = BigInteger.Zero; break; }
                ways *= waysAtRank;
            }
            BigInteger term = colorings[mask] * ways;
            if ((Popcount(mask) & 1) == 1) total -= term;
            else total += term;
        }
        return total;
    }

    static BigInteger Factorial(int n)
    {
        BigInteger r = BigInteger.One;
        for (int i = 2; i <= n; i++) r *= i;
        return r;
    }

    static IEnumerable<int[]> FeasibleTypeCounts(int target)
    {
        int[] counts = new int[10];
        int[] coverage = new int[13];
        return Backtrack(0, target, counts, coverage);
    }

    static IEnumerable<int[]> Backtrack(int pos, int remaining, int[] counts, int[] coverage)
    {
        if (pos == 10)
        {
            if (remaining == 0) yield return (int[])counts.Clone();
            yield break;
        }
        for (int amount = 0; amount <= remaining; amount++)
        {
            bool ok = true;
            foreach (var rank in WINDOWS[pos]) { coverage[rank] += amount; if (coverage[rank] > 4) ok = false; }
            counts[pos] = amount;
            if (ok) foreach (var r in Backtrack(pos + 1, remaining - amount, counts, coverage)) yield return r;
            foreach (var rank in WINDOWS[pos]) coverage[rank] -= amount;
        }
        counts[pos] = 0;
    }

    static BigInteger CountDisjointStraights(int target)
    {
        BigInteger total = BigInteger.Zero;
        foreach (var typeCounts in FeasibleTypeCounts(target))
        {
            var starts = new List<int>();
            BigInteger divisor = BigInteger.One;
            for (int start = 0; start < typeCounts.Length; start++)
            {
                int amount = typeCounts[start];
                for (int i = 0; i < amount; i++) starts.Add(start);
                divisor *= Factorial(amount);
            }
            total += LabeledCount(starts.ToArray()) / divisor;
        }
        return total;
    }

    static void Main()
    {
        System.Diagnostics.Debug.Assert(CountDisjointStraights(1) == 10200);
        System.Diagnostics.Debug.Assert(CountDisjointStraights(2) == 31832952);
        Console.WriteLine(CountDisjointStraights(8));
    }
}
