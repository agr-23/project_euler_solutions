// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/996.py

using System;
using System.Collections.Generic;
using System.Numerics;

class Program
{
    static List<BigInteger> Trim(List<BigInteger> poly)
    {
        while (poly.Count > 1 && poly[poly.Count - 1] == BigInteger.Zero)
            poly.RemoveAt(poly.Count - 1);
        return poly;
    }

    static void AddTo(List<BigInteger> dst, List<BigInteger> src, BigInteger? modulus)
    {
        while (dst.Count < src.Count) dst.Add(BigInteger.Zero);
        if (modulus == null)
        {
            for (int i = 0; i < src.Count; i++) dst[i] += src[i];
        }
        else
        {
            for (int i = 0; i < src.Count; i++) dst[i] = (dst[i] + src[i]) % modulus.Value;
        }
    }

    static List<BigInteger> MulOneMinusQ(List<BigInteger> poly, BigInteger? modulus)
    {
        var outList = new List<BigInteger>(new BigInteger[poly.Count + 1]);
        for (int i = 0; i < poly.Count; i++)
        {
            outList[i] += poly[i];
            outList[i + 1] -= poly[i];
        }
        if (modulus != null)
            for (int i = 0; i < outList.Count; i++) outList[i] %= modulus.Value;
        return Trim(outList);
    }

    static List<BigInteger> MulPoly(List<BigInteger> a, List<BigInteger> b, int maxDegree, BigInteger? modulus)
    {
        if (a.Count == 0 || b.Count == 0) return new List<BigInteger> { BigInteger.Zero };
        int outLen = Math.Min(a.Count + b.Count - 2, maxDegree) + 1;
        var outList = new List<BigInteger>(new BigInteger[outLen]);
        for (int i = 0; i < a.Count; i++)
        {
            if (a[i] == BigInteger.Zero) continue;
            int lastJ = Math.Min(b.Count - 1, maxDegree - i);
            for (int j = 0; j <= lastJ; j++)
            {
                if (b[j] != BigInteger.Zero)
                {
                    outList[i + j] += a[i] * b[j];
                    if (modulus != null) outList[i + j] %= modulus.Value;
                }
            }
        }
        if (modulus != null)
            for (int i = 0; i < outList.Count; i++) outList[i] %= modulus.Value;
        return Trim(outList);
    }

    static BigInteger Comb(BigInteger n, BigInteger k)
    {
        if (k < 0 || k > n) return BigInteger.Zero;
        if (k == 0 || k == n) return BigInteger.One;
        if (k > n - k) k = n - k;
        BigInteger result = BigInteger.One;
        for (BigInteger i = 0; i < k; i++)
            result = result * (n - i) / (i + 1);
        return result;
    }

    static BigInteger BlockCount(BigInteger length, BigInteger cost)
    {
        if (cost <= 0 || 2 * cost < length) return BigInteger.Zero;
        BigInteger total = Comb(2 * cost - 1, length - 1);
        BigInteger tooLarge = cost < length ? BigInteger.Zero : Comb(cost - 1, length - 1);
        return total - length * tooLarge;
    }

    static List<BigInteger> BlockNumerator(int length, BigInteger? modulus)
    {
        var coeffs = new List<BigInteger>(new BigInteger[length + 1]);
        BigInteger lenB = new BigInteger(length);
        for (int j = 0; j <= length; j++)
        {
            BigInteger value = BigInteger.Zero;
            BigInteger jB = new BigInteger(j);
            for (int i = 0; i <= j; i++)
            {
                BigInteger iB = new BigInteger(i);
                BigInteger sign = i % 2 == 0 ? BigInteger.One : BigInteger.MinusOne;
                value += sign * Comb(lenB, iB) * BlockCount(lenB, jB - iB);
            }
            coeffs[j] = modulus != null ? value % modulus.Value : value;
        }
        return Trim(coeffs);
    }

    static List<BigInteger> NumeratorForAllValidVectors(int n, BigInteger? modulus)
    {
        var blockNum = new List<BigInteger>[n + 1];
        for (int length = 2; length <= n; length++)
            blockNum[length] = BlockNumerator(length, modulus);

        var total = new List<List<BigInteger>>();
        var zeroEnd = new List<List<BigInteger>>();
        for (int i = 0; i <= n; i++) { total.Add(new List<BigInteger>()); zeroEnd.Add(new List<BigInteger>()); }
        total[0] = new List<BigInteger> { BigInteger.One };
        zeroEnd[0] = new List<BigInteger> { BigInteger.One };

        for (int pos = 0; pos <= n; pos++)
        {
            if (pos < n && total[pos].Count > 0)
            {
                var addZero = MulOneMinusQ(total[pos], modulus);
                AddTo(total[pos + 1], addZero, modulus);
                AddTo(zeroEnd[pos + 1], addZero, modulus);
            }
            if (zeroEnd[pos].Count > 0)
            {
                for (int length = 2; length <= n - pos; length++)
                {
                    var product = MulPoly(zeroEnd[pos], blockNum[length], pos + length, modulus);
                    AddTo(total[pos + length], product, modulus);
                }
            }
        }

        return total[n];
    }

    static BigInteger CountTuples(int n, long k, BigInteger? modulus)
    {
        BigInteger nB = new BigInteger(n);
        BigInteger kB = new BigInteger(k);
        BigInteger maxCost = kB / 2;
        var numerator = NumeratorForAllValidVectors(n, modulus);
        BigInteger answer = BigInteger.Zero;
        for (int degree = 0; degree < numerator.Count; degree++)
        {
            BigInteger coeff = numerator[degree];
            if (coeff == BigInteger.Zero || new BigInteger(degree) > maxCost) continue;
            BigInteger waysUpToCost = Comb(maxCost - new BigInteger(degree) + nB, nB);
            if (modulus == null)
            {
                answer += coeff * waysUpToCost;
            }
            else
            {
                answer = (answer + coeff * (waysUpToCost % modulus.Value)) % modulus.Value;
            }
        }
        return answer;
    }

    static void RunTests()
    {
        System.Diagnostics.Debug.Assert(CountTuples(3, 4L, null) == new BigInteger(8));
        System.Diagnostics.Debug.Assert(CountTuples(12, 34L, null) == new BigInteger(2457178250L));
    }

    static void Main()
    {
        RunTests();
        BigInteger modVal = new BigInteger(1234567891L);
        Console.WriteLine(CountTuples(123, 4567891L, modVal));
    }
}