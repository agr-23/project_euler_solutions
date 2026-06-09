// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/983.py

using System;
using System.Collections.Generic;
using System.Linq;

class Program983
{
    const int OFF = 1 << 15;
    const int SHIFT = 17;

    static int EncodeCoord(int x, int y)
    {
        return ((x + OFF) << SHIFT) | (y + OFF);
    }

    static List<(int x, int y)> CirclePoints(int m)
    {
        int lim = (int)Math.Sqrt(m);
        var pts = new List<(int, int)>();
        for (int x = -lim; x <= lim; x++)
        {
            int y2 = m - x * x;
            if (y2 < 0) continue;
            int y = (int)Math.Sqrt(y2);
            if (y * y == y2)
            {
                pts.Add((x, y));
                if (y != 0) pts.Add((x, -y));
            }
        }
        return pts;
    }

    static List<((int, int), (int, int))> ComputeOppositePairs(List<(int x, int y)> points)
    {
        var pairs = new List<((int, int), (int, int))>();
        var used = new HashSet<int>();
        var sorted = points.OrderBy(v => v.x).ThenBy(v => v.y).ToList();
        foreach (var v in sorted)
        {
            int vk = EncodeCoord(v.x, v.y);
            if (used.Contains(vk)) continue;
            var w = (-v.x, -v.y);
            used.Add(vk);
            used.Add(EncodeCoord(w.Item1, w.Item2));
            pairs.Add((v, w));
        }
        return pairs;
    }

    static int CountAntipodalPairs(int m)
    {
        int x = m;
        while (x % 2 == 0) x /= 2;
        int product = 1;
        int p = 3;
        while (p * p <= x)
        {
            if (x % p == 0)
            {
                int exponent = 0;
                while (x % p == 0) { x /= p; exponent++; }
                if (p % 4 == 1) product *= exponent + 1;
                else if ((exponent & 1) != 0) return 0;
            }
            p += 2;
        }
        if (x > 1)
        {
            if (x % 4 == 1) product *= 2;
            else if (x % 4 == 3) return 0;
        }
        return 2 * product;
    }

    static HashSet<int> BuildDisplacementSet(List<(int x, int y)> points)
    {
        var deltas = new HashSet<int>();
        foreach (var (ax, ay) in points)
            foreach (var (bx, by) in points)
                if (ax != bx || ay != by)
                    deltas.Add(EncodeCoord(ax - bx, ay - by));
        return deltas;
    }

    static bool CheckFourVectorPrune(List<(int x, int y)> selected, (int x, int y) candidate, HashSet<int> deltas)
    {
        if (selected.Count < 3) return true;
        int vx = candidate.x, vy = candidate.y;
        int sel = selected.Count;
        for (int i = 0; i < sel - 2; i++)
        {
            int ax = selected[i].x, ay = selected[i].y;
            for (int j = i + 1; j < sel - 1; j++)
            {
                int bx = selected[j].x, by = selected[j].y;
                for (int k = j + 1; k < sel; k++)
                {
                    int cx = selected[k].x, cy = selected[k].y;
                    foreach (int sa in new[] { 1, -1 })
                    {
                        int x1 = vx + sa * ax, y1 = vy + sa * ay;
                        foreach (int sb in new[] { 1, -1 })
                        {
                            int x2 = x1 + sb * bx, y2 = y1 + sb * by;
                            int xv = x2 + cx, yv = y2 + cy;
                            if ((xv != 0 || yv != 0) && deltas.Contains(EncodeCoord(xv, yv))) return false;
                            xv = x2 - cx; yv = y2 - cy;
                            if ((xv != 0 || yv != 0) && deltas.Contains(EncodeCoord(xv, yv))) return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    static List<int> BuildEvenMasks(int k)
    {
        var masks = new List<int>();
        for (int mask = 0; mask < (1 << k); mask++)
        {
            int bits = 0, mm = mask;
            while (mm != 0) { bits += mm & 1; mm >>= 1; }
            if ((bits & 1) == 0) masks.Add(mask);
        }
        return masks;
    }

    static List<(int x, int y)> ComputeCenters(List<(int x, int y)> vectors, List<int> masks)
    {
        var centers = new List<(int, int)>();
        foreach (int mask in masks)
        {
            int x = 0, y = 0, mm = mask;
            while (mm != 0)
            {
                int lsb = mm & -mm;
                int idx = 0; int tmp = lsb; while (tmp > 1) { tmp >>= 1; idx++; }
                x += vectors[idx].x;
                y += vectors[idx].y;
                mm -= lsb;
            }
            centers.Add((x, y));
        }
        return centers;
    }

    static bool QuickHarmonyCheck(List<(int x, int y)> centers, List<(int x, int y)> pts, int n)
    {
        var counts = new Dictionary<int, int>();
        int harmonyCount = 0;
        foreach (var (cx, cy) in centers)
        {
            foreach (var (vx, vy) in pts)
            {
                int key = EncodeCoord(cx + vx, cy + vy);
                if (!counts.TryGetValue(key, out int cur)) counts[key] = 1;
                else if (cur == 1) { counts[key] = 2; harmonyCount++; if (harmonyCount > n) return false; }
                else counts[key] = cur + 1;
            }
        }
        return harmonyCount == n;
    }

    static bool StrictCheck(List<(int x, int y)> centers, List<(int x, int y)> pts, int n)
    {
        var centerCodes = centers.Select(c => EncodeCoord(c.x, c.y)).ToList();
        var centerSet = new HashSet<int>(centerCodes);
        var tangentDiffs = pts.Select(p => EncodeCoord(2 * p.x, 2 * p.y)).ToList();
        foreach (int c in centerCodes)
            foreach (int d in tangentDiffs)
            {
                int other = c + d;
                if (centerSet.Contains(other) && c < other) return false;
            }
        var ptToCenters = new Dictionary<int, List<int>>();
        for (int idx = 0; idx < centers.Count; idx++)
        {
            var (cx, cy) = centers[idx];
            foreach (var (vx, vy) in pts)
            {
                int key = EncodeCoord(cx + vx, cy + vy);
                if (!ptToCenters.ContainsKey(key)) ptToCenters[key] = new List<int>();
                ptToCenters[key].Add(idx);
            }
        }
        var harmonyPts = ptToCenters.Where(kv => kv.Value.Count >= 2).Select(kv => kv.Key).ToList();
        if (harmonyPts.Count != n) return false;
        int[] parent = Enumerable.Range(0, n).ToArray();
        int[] sz = Enumerable.Repeat(1, n).ToArray();
        int Find(int xi) { while (parent[xi] != xi) { parent[xi] = parent[parent[xi]]; xi = parent[xi]; } return xi; }
        void Union(int a, int b) { int ra = Find(a), rb = Find(b); if (ra == rb) return; if (sz[ra] < sz[rb]) { int tmp = ra; ra = rb; rb = tmp; } parent[rb] = ra; sz[ra] += sz[rb]; }
        foreach (int key in harmonyPts)
        {
            var lst = ptToCenters[key];
            int baseV = lst[0];
            for (int j = 1; j < lst.Count; j++) Union(baseV, lst[j]);
        }
        int root = Find(0);
        for (int i = 1; i < n; i++) if (Find(i) != root) return false;
        return true;
    }

    static bool HasUnitCoord(List<(int x, int y)> points)
    {
        foreach (var (x, y) in points)
            if (Math.Abs(x) == 1 || Math.Abs(y) == 1) return true;
        return false;
    }

    static bool CheckValidOrientedVectors(List<((int, int), (int, int))> pairs, List<(int x, int y)> pts, int k, List<int> masks, int n)
    {
        var deltas = BuildDisplacementSet(pts);
        var selected = new List<(int x, int y)>();
        bool Dfs(int start)
        {
            if (selected.Count == k)
            {
                var centers = ComputeCenters(selected, masks);
                return QuickHarmonyCheck(centers, pts, n) && StrictCheck(centers, pts, n);
            }
            int needed = k - selected.Count;
            for (int pi = start; pi <= pairs.Count - needed; pi++)
            {
                var choices = selected.Count == 0
                    ? new List<(int, int)> { pairs[pi].Item1 }
                    : new List<(int, int)> { pairs[pi].Item1, pairs[pi].Item2 };
                foreach (var vec in choices)
                {
                    if (!CheckFourVectorPrune(selected, vec, deltas)) continue;
                    selected.Add(vec);
                    if (Dfs(pi + 1)) return true;
                    selected.RemoveAt(selected.Count - 1);
                }
            }
            return false;
        }
        return Dfs(0);
    }

    static int SearchMinRadiusSq(int k, int mLimit, bool filtered)
    {
        var masks = BuildEvenMasks(k);
        int n = 1 << (k - 1);
        for (int m = 1; m <= mLimit; m++)
        {
            int p = CountAntipodalPairs(m);
            if (p < k) continue;
            if (filtered && p != k && p != k + 2) continue;
            var pts = CirclePoints(m);
            if (filtered && !HasUnitCoord(pts)) continue;
            var pairs = ComputeOppositePairs(pts);
            if (pairs.Count != p) continue;
            if (CheckValidOrientedVectors(pairs, pts, k, masks, n)) return m;
        }
        throw new Exception($"No solution found up to m={mLimit}");
    }

    static void Main(string[] args)
    {
        int r1 = SearchMinRadiusSq(2, 20, false);
        System.Diagnostics.Debug.Assert(r1 == 1, $"Expected 1, got {r1}");
        if (r1 != 1) throw new Exception($"Expected 1, got {r1}");
        int r2 = SearchMinRadiusSq(3, 50, false);
        System.Diagnostics.Debug.Assert(r2 == 5, $"Expected 5, got {r2}");
        if (r2 != 5) throw new Exception($"Expected 5, got {r2}");
        Console.WriteLine(SearchMinRadiusSq(10, 20000, true));
    }
}
