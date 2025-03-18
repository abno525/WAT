import java.lang.Math;
import java.util.Random;
import java.util.Scanner;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        System.out.println("Zadanie 1");
        zadanie1();

        System.out.println("Zadanie 2");
        zadanie2();
    }

    public static void zadanie1() {
        System.out.println("Podaj n: ");
        Scanner scan = new Scanner(System.in);
        int n = scan.nextInt();


        Random rand = new Random();
        rand.setSeed(1);

        double[] randomNumbers = new double[n];
        for (int i = 0; i < n; i++) {
            randomNumbers[i] = rand.nextDouble(1) * (Math.E - 1) + 1;
        }

        Arrays.sort(randomNumbers);
        double sum = 0;


        for (int i = 0; i + 1 < n; i++) {
            sum = sum + (randomNumbers[i + 1] - randomNumbers[i]) * (3 / randomNumbers[i + 1]);
        }

        System.out.println("Suma: " + sum);
        System.out.println("Błąd bezwzględny: " + Math.abs(sum - 3));
        System.out.println("Błąd względny procentowy: " + 100*Math.abs(sum - 3) / 3 + "%");
    }

    public static void zadanie2() {
        int sampleSize = 1000000;
        double x0 = 0.0;
        double gamma = 1.0;
        double[] samples = new double[sampleSize];

        for (int i = 0; i < sampleSize; i++) {
            samples[i] = RNGenerator.cauchy(x0, gamma);
        }

        // symetria
        int above = 0, below = 0;
        for (double sample : samples) {
            if (sample > x0) above++;
            else below++;
        }
        System.out.println("Badanie symetrii");
        System.out.println("Ponad x0: " + above + ", Poniżej x0: " + below);

        // mediana
        Arrays.sort(samples);
        double median = samples[sampleSize / 2];
        System.out.println("Mediana: " + median);

        // dystrybuanta
        for (int testPoint = -10; testPoint <= 10; testPoint += 1.0) {
            int count = 0;
            for (double sample : samples) {
                if (sample <= testPoint) count++;
            }
            double calculatedCDF = (double) count / sampleSize;
            double theoreticalCDF = (1 / Math.PI) * Math.atan((testPoint - x0) / gamma) + 0.5;
            System.out.printf("x: %d \t Obliczona dystrybuanta: %.5f \t Teoretyczna dystrybuanta: %.5f%n",
                    testPoint, calculatedCDF, theoreticalCDF);
        }
    }
}