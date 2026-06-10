// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/975.py

using System;
using System.Collections.Generic;
using System.Linq;

class Program975
{
    static List<int> PrimesUpTo(int n)
    {
        var sieve = new bool[n + 1];
        for (int x = 0; x <= n; x++) sieve[x] = true;
        if (n >= 0) sieve[0] = false;
        if (n >= 1) sieve[1] = false;
        int r = (int)Math.Sqrt(n);
        for (int p = 2; p <= r; p++)
        {
            if (sieve[p])
            {
                for (int j = p * p; j <= n; j += p)
                    sieve[j] = false;
            }
        }
        var result = new List<int>();
        for (int i = 0; i <= n; i++)
            if (sieve[i]) result.Add(i);
        return result;
    }

    static int GcdInt(int a, int b)
    {
        while (b != 0) { int t = b; b = a % b; a = t; }
        return a;
    }

    static (int, int) NormalizedPair(int num, int den)
    {
        int common = GcdInt(Math.Abs(num), Math.Abs(den));
        return (num / common, den / common);
    }

    static double HeightVal(int a, int b, (int, int) point)
    {
        var (num, den) = point;
        if (num == 0) return 0.0;
        if (num == den) return 1.0;
        double x = (double)num / (double)den;
        double z = 0.5 - (b * Math.Cos(a * Math.PI * x) + a * Math.Cos(b * Math.PI * x)) / (2.0 * (a + b));
        if (z < 0.0 && z > -1e-14) return 0.0;
        if (z > 1.0 && z < 1.0 + 1e-14) return 1.0;
        return z;
    }

    static int DerivativeIntervalSign(int a, int b, (int, int) left, (int, int) right)
    {
        var (leftNum, leftDen) = left;
        var (rightNum, rightDen) = right;
        double x = (leftNum * rightDen + rightNum * leftDen) / (2.0 * leftDen * rightDen);
        double value = Math.Sin((a + b) * Math.PI * x * 0.5) * Math.Cos(Math.Abs(a - b) * Math.PI * x * 0.5);
        return value > 0.0 ? 1 : -1;
    }

    static Dictionary<(int, int), double[]> turningValuesCache = new Dictionary<(int, int), double[]>();

    static double[] TurningValues(int a, int b)
    {
        var cacheKey = (a, b);
        if (turningValuesCache.ContainsKey(cacheKey)) return turningValuesCache[cacheKey];

        if (a <= 0 || b <= 0 || (a & 1) == 0 || (b & 1) == 0)
            throw new ArgumentException("a,b must be positive odd integers");
        if (a == b) throw new ArgumentException("a != b required");
        int s = a + b;
        int delta = Math.Abs(a - b);
        if (s % 2 != 0 || delta % 2 != 0)
            throw new ArgumentException("For odd a,b, a+b and |a-b| must be even");

        var candidates = new List<(int, int)>();
        for (int k = 0; k <= s / 2; k++)
            candidates.Add(NormalizedPair(2 * k, s));
        for (int k = 0; k < delta / 2; k++)
            candidates.Add(NormalizedPair(2 * k + 1, delta));

        var pointSet = new Dictionary<(int, int), (int, int)>();
        foreach (var p in candidates)
            if (!pointSet.ContainsKey(p)) pointSet[p] = p;

        var points = pointSet.Values.OrderBy(p => (double)p.Item1 / (double)p.Item2).ToList();

        var intervalSigns = new List<int>();
        for (int idx = 0; idx < points.Count - 1; idx++)
            intervalSigns.Add(DerivativeIntervalSign(a, b, points[idx], points[idx + 1]));

        var kept = new List<(int, int)>();
        kept.Add(points[0]);
        for (int idx = 1; idx < points.Count - 1; idx++)
        {
            if (intervalSigns[idx - 1] != intervalSigns[idx])
                kept.Add(points[idx]);
        }
        kept.Add(points[points.Count - 1]);

        var result = new double[kept.Count];
        for (int idx = 0; idx < kept.Count; idx++)
            result[idx] = HeightVal(a, b, kept[idx]);

        turningValuesCache[cacheKey] = result;
        return result;
    }

    static double ComputeF(int a, int b, int c, int d)
    {
        var za = TurningValues(a, b);
        var zb = TurningValues(c, d);
        int i = 0, j = 0;
        double current = 0.0, total = 0.0;
        bool upward = true;
        double eps = 1e-12;
        int maxSteps = 4 * (za.Length + zb.Length) * (za.Length + zb.Length);

        for (int step = 0; step < maxSteps; step++)
        {
            if (i < 0 || i >= za.Length - 1 || j < 0 || j >= zb.Length - 1)
            {
                if (Math.Abs(current - 1.0) < 1e-9) return total;
                throw new Exception("Winding walk left the valid segment range");
            }
            double a0 = za[i], a1 = za[i + 1];
            double b0 = zb[j], b1 = zb[j + 1];
            double lower = Math.Max(Math.Min(a0, a1), Math.Min(b0, b1));
            double upper = Math.Min(Math.Max(a0, a1), Math.Max(b0, b1));
            double nxt = upward ? upper : lower;
            total += Math.Abs(nxt - current);
            bool advanced = false;
            if (Math.Abs(nxt - a0) <= eps) { i -= 1; advanced = true; }
            else if (Math.Abs(nxt - a1) <= eps) { i += 1; advanced = true; }
            if (Math.Abs(nxt - b0) <= eps) { j -= 1; advanced = true; }
            else if (Math.Abs(nxt - b1) <= eps) { j += 1; advanced = true; }
            if (!advanced) throw new Exception("Winding walk did not hit a segment endpoint");
            current = nxt;
            upward = !upward;
        }
        throw new Exception("Exceeded maximum winding-walk steps");
    }

    static double ComputeG(int m, int n)
    {
        var ps = PrimesUpTo(n).Where(p => p >= m).ToList();
        double total = 0.0;
        for (int i = 0; i < ps.Count; i++)
        {
            int p = ps[i];
            for (int k = i + 1; k < ps.Count; k++)
            {
                int q = ps[k];
                total += ComputeF(p, q, p, 2 * q - p);
            }
        }
        return total;
    }

    static void Main(string[] args)
    {
        if (Math.Abs(ComputeF(3, 5, 3, 7) - 7.01772) >= 1e-5) throw new Exception("Assert F(3,5,3,7) failed");
        if (Math.Abs(ComputeF(7, 17, 9, 19) - 26.79578) >= 1e-5) throw new Exception("Assert F(7,17,9,19) failed");
        if (Math.Abs(ComputeG(3, 20) - 463.80866) >= 1e-5) throw new Exception("Assert G(3,20) failed");
        double ans = ComputeG(500, 1000);
        Console.WriteLine(ans.ToString("F5"));
    }
}
