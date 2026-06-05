// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/999.py

using System;
using System.Numerics;

class Program
{
    static readonly BigInteger MOD = 1_234_567_891;
    static readonly BigInteger INV_TWO = (1_234_567_891 + 1) / 2;

    static readonly BigInteger[] SMALL_W = { 0, 1, 2, -4, -32, -192, 3584, 77824, 262144 };

    static BigInteger SmallW(long index)
    {
        if (index < 0)
        {
            BigInteger pos = SmallW(-index);
            return (MOD - pos % MOD) % MOD;
        }
        BigInteger v = SMALL_W[index];
        if (v < 0)
            return ((v % MOD) + MOD) % MOD;
        return v % MOD;
    }

    static BigInteger PowMod(BigInteger bas, BigInteger exp, BigInteger modulus)
    {
        BigInteger result = 1;
        bas = bas % modulus;
        while (exp > 0)
        {
            if (exp % 2 == 1)
                result = result * bas % modulus;
            exp /= 2;
            bas = bas * bas % modulus;
        }
        return result;
    }

    static BigInteger[] EdsBlock(long n)
    {
        if (n <= 4)
        {
            BigInteger[] res = new BigInteger[8];
            for (int i = 0; i < 8; i++)
                res[i] = SmallW(n - 3 + i);
            return res;
        }

        long middle = n / 2;
        BigInteger[] source = EdsBlock(middle);
        long sourceStart = middle - 3;

        BigInteger Get(long index) => source[index - sourceStart];

        BigInteger Odd(long index)
        {
            BigInteger a = Get(index + 1);
            BigInteger b = PowMod(Get(index - 1), 3, MOD);
            BigInteger c = Get(index - 2);
            BigInteger d = PowMod(Get(index), 3, MOD);
            return (a * b % MOD + MOD - c * d % MOD) % MOD;
        }

        BigInteger Even(long index)
        {
            BigInteger a = Get(index);
            BigInteger b = Get(index + 2);
            BigInteger c = PowMod(Get(index - 1), 2, MOD);
            BigInteger d = Get(index - 2);
            BigInteger e = PowMod(Get(index + 1), 2, MOD);
            BigInteger inner = (b * c % MOD + MOD - d * e % MOD) % MOD;
            return a * INV_TWO % MOD * inner % MOD;
        }

        if (n % 2 == 0)
        {
            return new BigInteger[]
            {
                Odd(middle - 1),
                Even(middle - 1),
                Odd(middle),
                Even(middle),
                Odd(middle + 1),
                Even(middle + 1),
                Odd(middle + 2),
                Even(middle + 2),
            };
        }

        return new BigInteger[]
        {
            Even(middle - 1),
            Odd(middle),
            Even(middle),
            Odd(middle + 1),
            Even(middle + 1),
            Odd(middle + 2),
            Even(middle + 2),
            Odd(middle + 3),
        };
    }

    static BigInteger WMod(long n)
    {
        if (n < 0)
        {
            BigInteger pos = WMod(-n);
            return (MOD - pos % MOD) % MOD;
        }
        return EdsBlock(n)[3];
    }

    static BigInteger AMod(long n)
    {
        if (n < 1) throw new ArgumentException("n must be >= 1");
        long rem = n % 4;
        bool signPositive = rem == 1 || rem == 2;
        BigInteger exp = (BigInteger)n * n / 4;
        BigInteger inverseScale = PowMod(INV_TWO, exp, MOD);
        BigInteger wval = WMod(n);
        if (signPositive)
            return wval * inverseScale % MOD;
        else
            return (MOD - wval * inverseScale % MOD) % MOD;
    }

    static void Main()
    {
        System.Diagnostics.Debug.Assert(AMod(1) == 1);
        System.Diagnostics.Debug.Assert(AMod(2) == 1);
        System.Diagnostics.Debug.Assert(AMod(3) == 1);
        System.Diagnostics.Debug.Assert(AMod(4) == 2);
        System.Diagnostics.Debug.Assert(AMod(13) == 23321);
        System.Diagnostics.Debug.Assert(AMod(1003) == 231906014);

        Console.WriteLine(AMod(1_000_000_000_000_000_003L));
    }
}