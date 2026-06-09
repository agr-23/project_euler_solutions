// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/979.py

using System;
using System.Collections.Generic;

class Program979 {
    static readonly int[][] SUBS_TABLE = new int[][] {
        new int[] {0, 0, 1},
        new int[] {0, 1}
    };

    static (List<int>[] typesList, List<int>[] parent1List, List<int>[] parent2List) BuildLayers(int maxLayer) {
        var typesList = new List<int>[maxLayer + 1];
        var parent1List = new List<int>[maxLayer + 1];
        var parent2List = new List<int>[maxLayer + 1];
        for (int k = 0; k <= maxLayer; k++) {
            typesList[k] = new List<int>();
            parent1List[k] = new List<int>();
            parent2List[k] = new List<int>();
        }

        typesList[0] = new List<int> {0};
        if (maxLayer == 0) {
            return (typesList, parent1List, parent2List);
        }

        for (int i = 0; i < 7; i++) {
            typesList[1].Add(0);
            parent1List[1].Add(0);
            parent2List[1].Add(-1);
        }

        for (int k = 2; k <= maxLayer; k++) {
            var prev = typesList[k - 1];
            int m = prev.Count;
            var cur = new List<int>();
            var p1 = new List<int>();
            var p2 = new List<int>();

            for (int j = 0; j < prev.Count; j++) {
                int t = prev[j];
                int[] block = SUBS_TABLE[t];
                int blen = block.Length;
                for (int pos = 0; pos < blen; pos++) {
                    int ct = block[pos];
                    cur.Add(ct);
                    p1.Add(j);
                    if (pos == blen - 1) {
                        p2.Add((j + 1) % m);
                    } else {
                        p2.Add(-1);
                    }
                }
            }

            typesList[k] = cur;
            parent1List[k] = p1;
            parent2List[k] = p2;
        }

        return (typesList, parent1List, parent2List);
    }

    static (List<int>[] adj, int origin, int[] offsets) BuildBallAdjacency(int maxLayer) {
        var (typesList, parent1List, parent2List) = BuildLayers(maxLayer);
        int[] sizes = new int[maxLayer + 1];
        for (int k = 0; k <= maxLayer; k++) {
            sizes[k] = typesList[k].Count;
        }

        int[] offsets = new int[maxLayer + 1];
        int total = 0;
        for (int k = 0; k <= maxLayer; k++) {
            offsets[k] = total;
            total += sizes[k];
        }

        var adj = new List<int>[total];
        for (int i = 0; i < total; i++) {
            adj[i] = new List<int>();
        }

        void AddEdge(int u, int v) {
            adj[u].Add(v);
            adj[v].Add(u);
        }

        int origin = offsets[0];

        for (int k = 1; k <= maxLayer; k++) {
            int off = offsets[k];
            int m = sizes[k];
            for (int i = 0; i < m; i++) {
                AddEdge(off + i, off + ((i + 1) % m));
            }
        }

        if (maxLayer >= 1) {
            int off1 = offsets[1];
            for (int i = 0; i < sizes[1]; i++) {
                AddEdge(origin, off1 + i);
            }
        }

        for (int k = 2; k <= maxLayer; k++) {
            int off = offsets[k];
            int poff = offsets[k - 1];
            for (int i = 0; i < sizes[k]; i++) {
                AddEdge(off + i, poff + parent1List[k][i]);
                int p = parent2List[k][i];
                if (p != -1) {
                    AddEdge(off + i, poff + p);
                }
            }
        }

        if (maxLayer >= 1) {
            for (int k = 0; k < maxLayer; k++) {
                int off = offsets[k];
                for (int i = 0; i < sizes[k]; i++) {
                    int u = off + i;
                    if (adj[u].Count != 7) {
                        throw new Exception($"Assertion failed: adj degree at ({k},{i}) is {adj[u].Count}");
                    }
                }
            }
        }

        return (adj, origin, offsets);
    }

    static long ComputeF(int n) {
        if (n < 0) return 0L;
        if (n == 0) return 1L;
        int maxLayer = n / 2;
        var (adj, origin, _) = BuildBallAdjacency(maxLayer);
        int nodeCount = adj.Length;
        long[] dp = new long[nodeCount];
        dp[origin] = 1L;

        for (int step = 0; step < n; step++) {
            long[] ndp = new long[nodeCount];
            for (int u = 0; u < nodeCount; u++) {
                long val = dp[u];
                if (val != 0L) {
                    foreach (int v in adj[u]) {
                        ndp[v] += val;
                    }
                }
            }
            dp = ndp;
        }

        return dp[origin];
    }

    static void Main(string[] args) {
        long f4 = ComputeF(4);
        if (f4 != 119L) {
            throw new Exception($"Assertion failed: F(4) == {f4}, expected 119");
        }
        Console.WriteLine(ComputeF(20));
    }
}
