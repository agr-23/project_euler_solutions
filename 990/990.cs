// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/990.py

using System;
using System.Collections.Generic;

class Program
{
    const long MOD = 1_000_000_007L;
    const int MAX_N = 50;
    static readonly int MAX_TERMS = (MAX_N + 1) / 2;
    const int MAX_CARRY = 25;
    const int CARRY_MIN = -MAX_CARRY;
    const int CARRY_MAX = MAX_CARRY;

    static long[][] BINOM;
    static long[][][] SUM_TABLES;
    static Dictionary<(int, int, int), List<(int, int, int, long)>> transCache =
        new Dictionary<(int, int, int), List<(int, int, int, long)>>();

    static long[][] BuildBinom(int limit)
    {
        var comb = new long[limit + 1][];
        for (int n = 0; n <= limit; n++)
        {
            comb[n] = new long[limit + 1];
            comb[n][0] = 1;
            comb[n][n] = 1;
            for (int k = 1; k < n; k++)
                comb[n][k] = (comb[n - 1][k - 1] + comb[n - 1][k]) % MOD;
        }
        return comb;
    }

    static long[] ConvolveSmall(long[] poly, int width)
    {
        var outArr = new long[poly.Length + width - 1];
        for (int i = 0; i < poly.Length; i++)
        {
            if (poly[i] == 0) continue;
            for (int digit = 0; digit < width; digit++)
                outArr[i + digit] = (outArr[i + digit] + poly[i]) % MOD;
        }
        return outArr;
    }

    static long[][][] BuildSumTables(int limit)
    {
        var ways0to9 = new long[limit + 1][];
        ways0to9[0] = new long[] { 1L };
        for (int p = 1; p <= limit; p++)
            ways0to9[p] = ConvolveSmall(ways0to9[p - 1], 10);
        var tables = new long[limit + 1][][];
        for (int p = 0; p <= limit; p++)
        {
            tables[p] = new long[limit + 1][];
            tables[p][0] = ways0to9[p];
            for (int q = 1; q <= limit; q++)
                tables[p][q] = ConvolveSmall(tables[p][q - 1], 9);
        }
        return tables;
    }

    static List<(int, int, int, long)> GetTransitions(int activeLeft, int activeRight, int carry)
    {
        var key = (activeLeft, activeRight, carry);
        if (transCache.TryGetValue(key, out var cached)) return cached;
        if (activeLeft == 0 && activeRight == 0)
        {
            transCache[key] = new List<(int, int, int, long)>();
            return transCache[key];
        }
        var result = new List<(int, int, int, long)>();
        for (int nextLeft = 0; nextLeft <= activeLeft; nextLeft++)
        {
            long chooseLeft = BINOM[activeLeft][nextLeft];
            int endingLeft = activeLeft - nextLeft;
            for (int nextRight = 0; nextRight <= activeRight; nextRight++)
            {
                long chooseTerms = (chooseLeft * BINOM[activeRight][nextRight]) % MOD;
                int continuing = nextLeft + nextRight;
                int ending = (activeLeft - nextLeft) + (activeRight - nextRight);
                long[] counts = SUM_TABLES[continuing][ending];
                long baseVal = (long)(-carry - endingLeft + 9 * activeRight);
                for (int nextCarry = CARRY_MIN; nextCarry <= CARRY_MAX; nextCarry++)
                {
                    long idx = 10L * nextCarry + baseVal;
                    if (idx >= 0 && idx < counts.Length)
                    {
                        long ways = counts[(int)idx];
                        if (ways != 0)
                        {
                            long weight = (chooseTerms * ways) % MOD;
                            result.Add((nextLeft, nextRight, nextCarry, weight));
                        }
                    }
                }
            }
        }
        transCache[key] = result;
        return result;
    }

    static long Solve(int limit)
    {
        var dp = new Dictionary<(int, int, int), long>[limit + 1];
        for (int i = 0; i <= limit; i++)
            dp[i] = new Dictionary<(int, int, int), long>();
        for (int leftTerms = 1; leftTerms <= MAX_TERMS; leftTerms++)
        {
            for (int rightTerms = 1; rightTerms <= MAX_TERMS; rightTerms++)
            {
                int baseLength = leftTerms + rightTerms - 1;
                if (baseLength <= limit)
                {
                    var state = (leftTerms, rightTerms, 0);
                    dp[baseLength].TryGetValue(state, out long cur);
                    dp[baseLength][state] = (cur + 1) % MOD;
                }
            }
        }
        long answer = 0;
        for (int usedLength = 0; usedLength <= limit; usedLength++)
        {
            var current = dp[usedLength];
            if (current.Count == 0) continue;
            if (current.TryGetValue((0, 0, 0), out long zeroVal))
                answer = (answer + zeroVal) % MOD;
            var entries = new List<((int, int, int), long)>(current);
            foreach (var (state, waysSoFar) in entries)
            {
                if (waysSoFar == 0) continue;
                var (activeLeft, activeRight, carry) = state;
                if (activeLeft == 0 && activeRight == 0) continue;
                int nextLength = usedLength + activeLeft + activeRight;
                if (nextLength > limit) continue;
                var bucket = dp[nextLength];
                foreach (var (nextLeft, nextRight, nextCarry, weight) in GetTransitions(activeLeft, activeRight, carry))
                {
                    var newState = (nextLeft, nextRight, nextCarry);
                    bucket.TryGetValue(newState, out long cur2);
                    bucket[newState] = (cur2 + waysSoFar * weight) % MOD;
                }
            }
        }
        return answer;
    }

    static void RunSelfChecks()
    {
        System.Diagnostics.Debug.Assert(Solve(3) == 9);
        System.Diagnostics.Debug.Assert(Solve(5) == 171);
        System.Diagnostics.Debug.Assert(Solve(7) == 4878);
    }

    static void Main()
    {
        BINOM = BuildBinom(MAX_TERMS);
        SUM_TABLES = BuildSumTables(2 * MAX_TERMS);
        RunSelfChecks();
        Console.WriteLine(Solve(50));
    }
}
