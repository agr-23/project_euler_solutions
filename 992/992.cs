// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/992.py

using System;
using System.Linq;

class Program
{
    const long MOD = 987_898_789L;

    static long ModPow(long baseVal, long exp, long modulus)
    {
        long result = 1;
        baseVal %= modulus;
        while (exp > 0)
        {
            if ((exp & 1) == 1) result = result * baseVal % modulus;
            exp >>= 1;
            baseVal = baseVal * baseVal % modulus;
        }
        return result;
    }

    static (long[], long[]) BuildCombinatorics(int limit, long modv)
    {
        var fact = new long[limit + 1];
        fact[0] = 1;
        for (int i = 1; i <= limit; i++)
            fact[i] = fact[i - 1] * i % modv;
        var invFact = new long[limit + 1];
        invFact[limit] = ModPow(fact[limit], modv - 2, modv);
        for (int i = limit; i >= 1; i--)
            invFact[i - 1] = invFact[i] * i % modv;
        return (fact, invFact);
    }

    class Comb
    {
        public long Modv;
        public long[] Fact;
        public long[] InvFact;

        public Comb(int limit, long modv)
        {
            Modv = modv;
            (Fact, InvFact) = BuildCombinatorics(limit, modv);
        }

        public long Call(long n, long r)
        {
            if (r < 0 || r > n) return 0;
            return Fact[n] * InvFact[r] % Modv * InvFact[n - r] % Modv;
        }
    }

    static long EndpointCount(int n, long k, int end, Comb comb, long modv)
    {
        if (n == 0) return 1;
        var right = new long[n];
        right[0] = k - (end == 0 ? 1 : 0);
        if (n >= 2)
            right[1] = 2 - (end == 1 ? 1 : 0);
        for (int i = 2; i < n; i++)
            right[i] = 1 + right[i - 2] - (end == i ? 1 : 0);
        long ways = 1;
        for (int v = 1; v < n; v++)
        {
            long outDegree = k + v - (end == v ? 1 : 0);
            if (v < end)
                ways = ways * comb.Call(outDegree - 1, right[v] - 1) % modv;
            else if (v == end)
                ways = ways * comb.Call(outDegree, right[v]) % modv;
            else
                ways = ways * comb.Call(outDegree - 1, right[v]) % modv;
        }
        return ways;
    }

    static long JourneyCount(int n, long k, Comb comb, long modv)
    {
        long total = 0;
        for (int end = 0; end <= n; end++)
            total = (total + EndpointCount(n, k, end, comb, modv)) % modv;
        return total;
    }

    static long Solve()
    {
        int n = 500;
        long[] ks = { 1, 10, 100, 1000, 10000 };
        long maxK = ks.Max();
        var comb = new Comb((int)(maxK + n), MOD);
        System.Diagnostics.Debug.Assert(JourneyCount(3, 2, comb, MOD) == 17);
        System.Diagnostics.Debug.Assert(JourneyCount(6, 1, comb, MOD) == 1320);
        System.Diagnostics.Debug.Assert(JourneyCount(6, 5, comb, MOD) == 16_793_280);
        long answer = 0;
        foreach (long k in ks)
            answer = (answer + JourneyCount(n, k, comb, MOD)) % MOD;
        return answer;
    }

    static void Main()
    {
        Console.WriteLine(Solve());
    }
}
