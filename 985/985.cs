// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/985.py

using System;
using System.Collections.Generic;
using System.Linq;

class Program
{
    const double EPS = 1e-12;

    static double ClampVal(double x)
    {
        if (x < -1.0) return -1.0;
        if (x > 1.0) return 1.0;
        return x;
    }

    static (double, double, double) ComputeTriangleAngles(long a, long b, long c)
    {
        double af = (double)a;
        double bf = (double)b;
        double cf = (double)c;

        double cosA = ClampVal((bf * bf + cf * cf - af * af) / (2.0 * bf * cf));
        double cosB = ClampVal((af * af + cf * cf - bf * bf) / (2.0 * af * cf));
        double cosC = ClampVal((af * af + bf * bf - cf * cf) / (2.0 * af * bf));

        double angleA = Math.Acos(cosA);
        double angleB = Math.Acos(cosB);
        double angleC = Math.Acos(cosC);

        if (!(Math.Abs((angleA + angleB + angleC) - Math.PI) < 1e-7))
        {
            throw new Exception("Angle sum is not pi; check input or numerics.");
        }

        return (angleA, angleB, angleC);
    }

    static (double, double, double) AdvanceAngles(double angleA, double angleB, double angleC)
    {
        return (
            Math.PI - 2.0 * angleB,
            Math.PI - 2.0 * angleC,
            Math.PI - 2.0 * angleA
        );
    }

    static long CountValidSteps(long a, long b, long c, long maxSteps)
    {
        var (angleA, angleB, angleC) = ComputeTriangleAngles(a, b, c);
        long steps = 0;
        for (long i = 0; i < maxSteps; i++)
        {
            (angleA, angleB, angleC) = AdvanceAngles(angleA, angleB, angleC);
            if (angleA <= EPS || angleB <= EPS || angleC <= EPS)
            {
                break;
            }
            steps += 1;
        }
        return steps;
    }

    static (long?, List<(long, long, long)>) SearchMinPerimeter(long targetSteps, long maxPerimeter)
    {
        long? bestPerimeter = null;
        var bestTriangles = new List<string>();

        for (long p = 3; p <= maxPerimeter; p++)
        {
            if (bestPerimeter.HasValue && p > bestPerimeter.Value)
                break;

            for (long a = 1; a <= p / 3; a++)
            {
                for (long b = a; b <= (p - a) / 2; b++)
                {
                    long c = p - a - b;
                    if (c < b) continue;
                    if (a + b <= c) continue;

                    long steps = CountValidSteps(a, b, c, targetSteps + 2);
                    if (steps == targetSteps)
                    {
                        long[] arr = new long[] { a, b, c };
                        Array.Sort(arr);
                        string key = $"{arr[0]},{arr[1]},{arr[2]}";

                        if (!bestPerimeter.HasValue || p < bestPerimeter.Value)
                        {
                            bestPerimeter = p;
                            bestTriangles.Clear();
                            bestTriangles.Add(key);
                        }
                        else if (p == bestPerimeter.Value)
                        {
                            bestTriangles.Add(key);
                        }
                    }
                }
            }
        }

        var uniqueSorted = bestTriangles.Distinct().OrderBy(k => k).ToList();
        var result = uniqueSorted.Select(k =>
        {
            var parts = k.Split(',').Select(long.Parse).ToArray();
            return (parts[0], parts[1], parts[2]);
        }).ToList();

        return (bestPerimeter, result);
    }

    static (long, (long, long, long)) SolveProblem(long targetSteps)
    {
        long? bestPerimeter = null;
        (long, long, long)? bestTriangle = null;
        long n = 2;

        while (true)
        {
            var candidates = new (long, long, long)[]
            {
                (n, n, n + 1),
                (n, n + 1, n + 1),
            };

            foreach (var (a, b, c) in candidates)
            {
                long steps = CountValidSteps(a, b, c, targetSteps + 2);
                if (steps == targetSteps)
                {
                    long p = a + b + c;
                    if (!bestPerimeter.HasValue || p < bestPerimeter.Value)
                    {
                        bestPerimeter = p;
                        bestTriangle = (a, b, c);
                    }
                }
            }

            n += 1;

            if (bestPerimeter.HasValue)
            {
                if (3 * n + 1 > bestPerimeter.Value)
                    break;
            }

            if (n > 5_000_000)
            {
                throw new Exception("Search did not converge; check logic.");
            }
        }

        return (bestPerimeter!.Value, bestTriangle!.Value);
    }

    static void Main(string[] args)
    {
        long steps8910 = CountValidSteps(8, 9, 10, 10);
        System.Diagnostics.Debug.Assert(steps8910 == 2, $"Expected 2 steps for (8,9,10), got {steps8910}");
        if (steps8910 != 2)
            throw new Exception($"Expected 2 steps for (8,9,10), got {steps8910}");

        var (minP2, tris2) = SearchMinPerimeter(2, 50);
        if (minP2 != 10)
            throw new Exception($"Expected perimeter 10 for target_steps=2, got {minP2}");

        bool has334 = tris2.Any(t => t.Item1 == 3 && t.Item2 == 3 && t.Item3 == 4);
        if (!has334)
            throw new Exception("Expected triangle (3,3,4) to be among minimisers for target_steps=2");

        var (bestPerimeter, _bestTriangle) = SolveProblem(20);
        Console.WriteLine(bestPerimeter);
    }
}
