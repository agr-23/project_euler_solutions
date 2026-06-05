// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/993.py

using System;
using System.Collections.Generic;
using System.Linq;

class Program
{
    static readonly long PERIOD_START = 514L;
    static readonly long PERIOD = 71L;
    static readonly long[] DELTA_PATTERN = {
        17, -2, -8, -2, -2, -14, -2, -2, -17, -8, -5, -8, -5, -2, -2, -5, -8,
        50, -8, 23, -13, -2, 67, -5, -2, -2, -5, -8, -5, 21, 29, -11, -2, -2,
        6, -11, 31, -2, -11, 17, -2, -8, -2, -2, -14, -2, -2, -17, -8, -5, -8,
        -8, 8, -13, -5, -2, -2, -5, -2, -11, -8, -8, -5, -2, -11, -8, -8, -5,
        -2, -11, 216,
    };
    static readonly long PATTERN_SUM = DELTA_PATTERN.Sum();

    static (long, long, HashSet<long>)? StepState(long pos, long carry, HashSet<long> bananas)
    {
        bool hasX = bananas.Contains(pos);
        bool hasX1 = bananas.Contains(pos + 1);
        if (hasX && hasX1)
        {
            var nb = new HashSet<long>(bananas);
            nb.Remove(pos + 1);
            return (pos - 1, carry + 1, nb);
        }
        if (hasX && !hasX1)
        {
            var nb = new HashSet<long>(bananas);
            nb.Remove(pos);
            return (pos + 2, carry + 1, nb);
        }
        if (!hasX && hasX1)
        {
            var nb = new HashSet<long>(bananas);
            nb.Remove(pos + 1);
            nb.Add(pos);
            return (pos + 2, carry, nb);
        }
        if (carry >= 3)
        {
            var nb = new HashSet<long>(bananas);
            nb.Add(pos - 1);
            nb.Add(pos);
            nb.Add(pos + 1);
            return (pos - 2, carry - 3, nb);
        }
        return null;
    }

    static (long, long, HashSet<long>) SimulateSteps(long initialBananas, int steps)
    {
        long pos = 0;
        long carry = initialBananas;
        var bananas = new HashSet<long>();
        for (int i = 0; i < steps; i++)
        {
            var nxt = StepState(pos, carry, bananas);
            if (nxt == null) break;
            (pos, carry, bananas) = nxt.Value;
        }
        return (pos, carry, bananas);
    }

    static long[] SimulateBbValues(long limit)
    {
        var bb = new List<long> { 0L };
        long pos = 0;
        long carry = 0;
        var bananas = new HashSet<long>();
        for (long n = 1; n <= limit; n++)
        {
            carry += 1;
            while (true)
            {
                var nxt = StepState(pos, carry, bananas);
                if (nxt == null) { bb.Add(pos); break; }
                (pos, carry, bananas) = nxt.Value;
            }
        }
        return bb.ToArray();
    }

    static long[] BuildPrefix() => SimulateBbValues(PERIOD_START + PERIOD);

    static long BbFunc(long n, long[] bbPrefix)
    {
        if (n <= PERIOD_START) return bbPrefix[n];
        long remaining = n - PERIOD_START;
        long wholePeriods = remaining / PERIOD;
        long tail = remaining % PERIOD;
        long tailSum = 0;
        for (long i = 0; i < tail; i++) tailSum += DELTA_PATTERN[i];
        return bbPrefix[PERIOD_START] + wholePeriods * PATTERN_SUM + tailSum;
    }

    static void Main()
    {
        var bbPrefix = BuildPrefix();

        var (pos1, carry1, bananas1) = SimulateSteps(3, 1);
        System.Diagnostics.Debug.Assert(pos1 == -2);
        System.Diagnostics.Debug.Assert(carry1 == 0);
        System.Diagnostics.Debug.Assert(bananas1.SetEquals(new HashSet<long> { -1, 0, 1 }));

        var (pos2, carry2, bananas2) = SimulateSteps(5, 5);
        System.Diagnostics.Debug.Assert(pos2 == -1);
        System.Diagnostics.Debug.Assert(carry2 == 0);
        System.Diagnostics.Debug.Assert(bananas2.SetEquals(new HashSet<long> { -2, -1, 0, 1, 2 }));

        System.Diagnostics.Debug.Assert(BbFunc(1000, bbPrefix) == 1499);

        var deltas = new long[bbPrefix.Length - 1];
        for (int i = 0; i < bbPrefix.Length - 1; i++) deltas[i] = bbPrefix[i + 1] - bbPrefix[i];
        for (int i = 0; i < DELTA_PATTERN.Length; i++)
        {
            System.Diagnostics.Debug.Assert(deltas[PERIOD_START + i] == DELTA_PATTERN[i]);
        }

        Console.WriteLine(BbFunc(1_000_000_000_000_000_000L, bbPrefix));
    }
}
