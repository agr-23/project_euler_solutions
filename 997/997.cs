// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/997.py

using System;

class Program
{
    static long Compute(int px, int py, int pz)
    {
        return 3L * (1L << (px + py + pz - 1)) * ((1L << px) + (1L << py) + (1L << pz) - 4L);
    }

    static void Main()
    {
        System.Diagnostics.Debug.Assert(Compute(1, 1, 1) == 24L);
        System.Diagnostics.Debug.Assert(Compute(2, 3, 4) == 18432L);
        Console.WriteLine(Compute(9, 10, 11));
    }
}