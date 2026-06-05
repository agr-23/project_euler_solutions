// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/995.py

using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;

class Program
{
    const int LIMIT = 20000;
    const int PRIME_SEARCH_LIMIT = 2000000;

    static List<int> Sieve(int n)
    {
        var isPrime = new bool[n + 1];
        for (int i = 0; i <= n; i++) isPrime[i] = true;
        if (n >= 0) isPrime[0] = false;
        if (n >= 1) isPrime[1] = false;
        int r = (int)Math.Sqrt(n);
        for (int i = 2; i <= r; i++)
            if (isPrime[i])
                for (int j = i * i; j <= n; j += i) isPrime[j] = false;
        var result = new List<int>();
        for (int i = 0; i <= n; i++) if (isPrime[i]) result.Add(i);
        return result;
    }

    static readonly List<int> PRIMES = Sieve(PRIME_SEARCH_LIMIT);

    static List<(BigInteger, int)> FactorN(BigInteger n)
    {
        var outList = new List<(BigInteger, int)>();
        BigInteger t = n;
        foreach (int p in PRIMES)
        {
            BigInteger pb = new BigInteger(p);
            if (pb * pb > t) break;
            if (t % pb == 0)
            {
                int e = 0;
                while (t % pb == 0) { t /= pb; e++; }
                outList.Add((pb, e));
            }
        }
        if (t > BigInteger.One) outList.Add((t, 1));
        return outList;
    }

    static List<BigInteger> DivisorsFromFactorization(List<(BigInteger p, int e)> factors)
    {
        var divs = new List<BigInteger> { BigInteger.One };
        foreach (var (p, e) in factors)
        {
            var old = divs.ToList();
            divs = new List<BigInteger>();
            BigInteger power = BigInteger.One;
            for (int i = 0; i <= e; i++)
            {
                foreach (var d in old) divs.Add(d * power);
                power *= p;
            }
        }
        divs.Sort();
        return divs;
    }

    static BigInteger ModPow(BigInteger b, BigInteger e, BigInteger mod) => BigInteger.ModPow(b, e, mod);

    static BigInteger PrimitiveRoot(BigInteger p, List<BigInteger> primeFactorsOfPMinus1)
    {
        if (p == 2) return BigInteger.One;
        BigInteger m = p - 1;
        for (BigInteger g = 2; g < p; g++)
        {
            bool ok = true;
            foreach (var q in primeFactorsOfPMinus1)
            {
                if (ModPow(g, m / q, p) == BigInteger.One) { ok = false; break; }
            }
            if (ok) return g;
        }
        throw new Exception("primitive root not found");
    }

    static BigInteger[] DiscreteLogTable(BigInteger p, BigInteger root)
    {
        int size = (int)p;
        var table = new BigInteger[size];
        for (int i = 0; i < size; i++) table[i] = -1;
        BigInteger x = BigInteger.One;
        for (BigInteger k = 0; k < p - 1; k++)
        {
            table[(int)x] = k;
            x = (x * root) % p;
        }
        return table;
    }

    static BigInteger GcdBig(BigInteger a, BigInteger b) => BigInteger.GreatestCommonDivisor(a, b);

    static readonly Dictionary<int, (BigInteger, double)> S_CACHE = new Dictionary<int, (BigInteger, double)>();

    static (BigInteger, double) SForPrime(int p)
    {
        if (S_CACHE.TryGetValue(p, out var cached)) return cached;
        if (p == 2)
        {
            var res = (BigInteger.One, 0.0);
            S_CACHE[p] = res;
            return res;
        }
        BigInteger pu = new BigInteger(p);
        BigInteger m = pu - 1;
        var factors = FactorN(m);
        var divs = DivisorsFromFactorization(factors.Select(f => (f.Item1, f.Item2)).ToList());
        var primeQs = factors.Select(f => f.Item1).ToList();
        var root = PrimitiveRoot(pu, primeQs);
        var dlog = DiscreteLogTable(pu, root);

        int neededCCount = divs.Count - 1;
        var leastPrimeForC = new Dictionary<BigInteger, int>();
        foreach (int q in PRIMES)
        {
            if (q == p) continue;
            BigInteger qu = new BigInteger(q);
            int idx = (int)(qu % pu);
            if (dlog[idx] == -1) continue;
            BigInteger c = GcdBig(dlog[idx], m);
            if (c < m && !leastPrimeForC.ContainsKey(c))
            {
                leastPrimeForC[c] = q;
                if (leastPrimeForC.Count == neededCCount) break;
            }
        }
        if (leastPrimeForC.Count != neededCCount) throw new Exception("increase PRIME_SEARCH_LIMIT");

        var cItems = leastPrimeForC.Select(kv => (kv.Key, kv.Value)).ToList();

        var bestByM = new Dictionary<BigInteger, Dictionary<BigInteger, int>>();
        foreach (var mm in divs)
        {
            if (mm == BigInteger.One) continue;
            var best = new Dictionary<BigInteger, int>();
            foreach (var (c, q) in cItems)
            {
                BigInteger d = GcdBig(c, mm);
                if (d < mm)
                {
                    if (!best.ContainsKey(d) || q < best[d]) best[d] = q;
                }
            }
            bestByM[mm] = best;
        }

        var dpValue = new Dictionary<BigInteger, BigInteger>();
        var dpLog = new Dictionary<BigInteger, double>();
        dpValue[BigInteger.One] = BigInteger.One;
        dpLog[BigInteger.One] = 0.0;

        foreach (var h in divs)
        {
            if (!dpValue.ContainsKey(h)) continue;
            BigInteger mm = m / h;
            if (mm == BigInteger.One) continue;
            var best = bestByM[mm];
            BigInteger baseValue = dpValue[h];
            double baseLog = dpLog[h];
            foreach (var l in divs)
            {
                if (l > BigInteger.One && mm % l == BigInteger.Zero)
                {
                    BigInteger nextH = h * l;
                    BigInteger dKey = mm / l;
                    if (!best.ContainsKey(dKey)) continue;
                    int q = best[dKey];
                    BigInteger qu = new BigInteger(q);
                    BigInteger candidate = baseValue;
                    for (BigInteger i = 0; i < l - 1; i++) candidate *= qu;
                    double candLog = baseLog + (double)(l - 1) * Math.Log10(q);
                    if (!dpValue.ContainsKey(nextH) || candidate < dpValue[nextH])
                    {
                        dpValue[nextH] = candidate;
                        dpLog[nextH] = candLog;
                    }
                }
            }
        }

        var result = (dpValue[m], dpLog[m]);
        S_CACHE[p] = result;
        return result;
    }

    static BigInteger ProductT(int limit)
    {
        BigInteger product = BigInteger.One;
        foreach (int p in PRIMES)
        {
            if (p >= limit) break;
            product *= SForPrime(p).Item1;
        }
        return product;
    }

    static string ScientificFromInt(BigInteger n, int places = 5)
    {
        string digits = n.ToString();
        int exponent = digits.Length - 1;
        int significant = places + 1;
        string mantissaDigits;
        int finalExp;
        if (digits.Length > significant)
        {
            long head = long.Parse(digits.Substring(0, significant));
            if (int.Parse(digits[significant].ToString()) >= 5) head += 1;
            if (head == (long)Math.Pow(10, significant))
            {
                head /= 10;
                finalExp = exponent + 1;
            }
            else
            {
                finalExp = exponent;
            }
            mantissaDigits = head.ToString().PadLeft(significant, '0');
        }
        else
        {
            long headVal = long.Parse(digits);
            long head = headVal * (long)Math.Pow(10, significant - digits.Length);
            mantissaDigits = head.ToString().PadLeft(significant, '0');
            finalExp = exponent;
        }
        string mantissa = mantissaDigits[0] + "." + mantissaDigits.Substring(1);
        return $"{mantissa}e{finalExp}";
    }

    static void RunTests()
    {
        System.Diagnostics.Debug.Assert(SForPrime(2).Item1 == BigInteger.One);
        System.Diagnostics.Debug.Assert(SForPrime(5).Item1 == new BigInteger(8));
        System.Diagnostics.Debug.Assert(ProductT(20) == new BigInteger(1348422598656L));
        System.Diagnostics.Debug.Assert(ScientificFromInt(ProductT(100)) == "1.37451e123");
    }

    static void Main()
    {
        RunTests();
        Console.WriteLine(ScientificFromInt(ProductT(LIMIT)));
    }
}