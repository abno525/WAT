import java.util.Random;

/**
 * Klasa generatora liczb pseudolosowych wykorzystująca metody odwracania dystrubuanty, odrzucania oraz przyblizone na bazie szeregu Taylora. 
 */
public class RNGenerator extends Random {

	private static final long serialVersionUID = 1L;
	static double[] cof = { 76.18009173, -86.50532033, 24.01409822,
			-1.231739516, 0.120858003e-2, -0.536382e-5 };
	public static final double PI = 3.14159265358979323846;

	/**
	 * Konstruktor obiektu generatora liczb losowych na podstawie zadanego ziarna. Ziarno może byc wygenerowane przez metody obiektu 'RNGSeeds'
	 * @param seed Wartość ziarna generatora. Liczba całkowita dodatnia.
	 */
	public RNGenerator(long seed) {
		super(seed);
	}

	/**
	 * Konstruktor domyślny obiektu generatora liczb losowych na podstawie klasy 'java.util.Random'.
	 */	
	public RNGenerator() {
		super();
	}

	// ======================================================================

	/**
	 * Metoda tworząca ziarno z pomocą obiektu 'RNGSeeds' na podstawie aktualnego czasu zegarowego
	 * @param \seed Wartość ziarna generatora. Liczba całkowita dodatnia.
	 */
	public static long generateSeed() {
		return RNGSeeds.ClockSeed();
	}

	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'jednostajnego' (inaczej: jednorodny, równomierny, prostokątny albo płaski).
	 * @param a Najmniejsza wartość generowanej zmiennej. Poprawny zakres wartości: liczby rzeczywiste, z warunkiem: a<b. 
	 * @param b Największa wartość generowanej zmiennej. Poprawny zakres wartości: liczby rzeczywiste, z warunkiem: a<b.
	 * @return Zwraca liczbę rzeczywistą w przedziale [a, b)
	 */
	public double uniform(double a, double b) {
		if (b < a) {
			System.err.println("RNGenerator.uniform: give b>a");
			return (-1);
		}
		return (nextDouble() * (b - a) + a);
	}

	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'równomierny'.
	 * @param b Największa wartość generowanej zmiennej. Poprawny zakres wartości: liczby całkowite dodatnie.
	 * @return Zwraca liczbę całkowitą nieujemną w przedziale [0, b).
	 */
	public int uniformInt(int b) {
        if (b <= 0) throw new IllegalArgumentException("Parameter N must be positive");
        return nextInt(b);
    }

	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'równomierny'.
	 * @param a Najmniejsza wartość generowanej zmiennej. Poprawny zakres wartości: liczby całkowite, z warunkiem: a<b. 
	 * @param b Największa wartość generowanej zmiennej. Poprawny zakres wartości: liczby całkowite, z warunkiem: a<b.
	 * @return Zwraca liczbę całkowitą w przedziale [a, b).
	 */
	public int uniformInt(int a, int b) {
        if (b <= a) throw new IllegalArgumentException("Invalid range");
        if ((long) b - a >= Integer.MAX_VALUE) throw new IllegalArgumentException("Invalid range");
        return a + uniformInt(b - a);
    }
    
	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'wykładniczy'.
	 * @param lambda Parametr skali. Poprawny zakres wartości: liczba rzeczywista, większa od 0. 
	 * @return Zwraca liczbę rzeczywistą w przedziale [0 ; ∞).
	 */
	public double exponential(double lambda) {
		if (lambda < 0) {
			System.err.println("RNGenerator.exponential: a must be >0");
			return (-1);
		}
		return (1/lambda * (-Math.log((1-nextDouble()))));
	}

	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'erlanga'.
	 * @param k Parametr kształtu. Poprawny zakres wartości: liczba całkowita, większa od 0.
	 * @param lambda Parametr częstości. Poprawny zakres wartości: liczba rzeczywista, większa od 0. 
	 * @return Zwraca liczbę rzeczywistą w przedziale [0 ; ∞).
	 */	
	public double erlang(int k, double lambda) {
		if (1/lambda < 0) {
			System.err.println("RNGenerator.laplace: give a>0");
			return (-1);
		} else {
			// use gamma distribution
			return (gamma((double) k, 1/lambda));
		}
	}

	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'gamma'.
	 * @param k Parametr kształtu. Poprawny zakres wartości: liczba całkowita, większa od 0.
	 * @param b Parametr zakresu. Poprawny zakres wartości: liczba rzeczywista, większa od 0. 
	 * @return Zwraca liczbę rzeczywistą w przedziale [0 ; ∞).
	 */	
	public double gamma(double k, double b) {
		// rejection method only for a > 1
		double xx, avg, am, e, s, v1, v2, yy;
		if ((k < 0.0) || (b < 0.0))
			System.err.println("RNGenerator.gamma: k and b be >0 and k<=1");

		if (k < 1.0) {
			do {
				xx = Math.pow(nextDouble(), 1.0 / k);
				yy = Math.pow(nextDouble(), 1.0 / (1.0 - k));
			} while (xx + yy > 1.0);

			xx = xx / (xx + yy);
			yy = exponential(1);
			return xx * yy / b;
		}

		if (k == 1.0)
			return (exponential(1) / b);

		// rejection method
		do {
			do {
				do {
					v1 = 2.0 * nextDouble() - 1.0;
					v2 = 2.0 * nextDouble() - 1.0;
				} while (v1 * v1 + v2 * v2 > 1.0);

				yy = v2 / v1;
				am = k - 1.0;
				s = Math.sqrt(2.0 * am + 1.0);
				avg = s * yy + am;
			} while (avg <= 0.0);
			e = (1.0 + yy * yy) * Math.exp(am * Math.log(avg / am) - s * yy);
		} while (nextDouble() > e);

		return avg / b;
	}

	// ====================================================================================
	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'normalny'.
	 * @param a Parametr położenia. Poprawny zakres wartości: liczba rzeczywista.
	 * @param b Parametr skali. Poprawny zakres wartości: liczba rzeczywista, różna od 0. 
	 * @return Zwraca liczbę rzeczywistą w przedziale (-∞ ; ∞).
	 */	
	public double normal(double a, double b) {
		double x1;
		if (b <= 0.0) {
			System.err.println("RNGenerator.normal: b must be >0");
			return -1;
		}
		/*
		 * do { u = nextDouble(); v1 = 2.0 * u - 1.0; u = nextDouble(); v2 = 2.0 * nextDouble() -
		 * 1.0; s = v1 * v1 + v2 * v2; } while (s >= 1.0 || s == 0.0);
		 * 
		 * x1 = v1 * Math.sqrt((-2.0 * Math.log(s)) / s);
		 */
		x1 = nextGaussian();
		return (a + x1 * b);
	};

	// return a random variable from a chi square distribution with n degrees of freedom
	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'Chi kwadrat'.
	 * @param k Parametr swobody. Poprawny zakres wartości: liczba całkowita, większa od 0.
	 * @return Zwraca liczbę rzeczywistą w przedziale [0 ; ∞).
	 */	
	public double chisquare(int k) {
		return gamma(0.5 * k, 0.5);
	}

	// return random variable from a beta distribution
	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'beta'.
	 * @param a Parametr kształtu. Poprawny zakres wartości: liczba rzeczywista, większa od 0.
	 * @param b Parametr kształtu. Poprawny zakres wartości: liczba rzeczywista, większa od 0.
	 * @return Zwraca liczbę rzeczywistą w przedziale [0 ; 1].
	 */	
	public double beta(double a, double b) {
		if (b == 0.0) {
			System.err.println("RNGenerator.beta: b cannot be equal 0");
			return -1;
		}
		double zz = gamma(a, 1.0);
		return (zz / (zz + gamma(b, 1.0)));
	}

	// return it from the student distribution
	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'studenta'. Wartość oczekiwana równa jest 0 dla n>1, w przeciwnym wypadku wartość jest nieznana.
	 * @param n Parametr swobody. Poprawny zakres wartości: liczba całkowita, większa od 0.
	 * @return Zwraca liczbę rzeczywistą w przedziale (-∞ ; ∞).
	 */	
	public double student(int n) {
		return (normal(0.0, 1.0) / Math.sqrt(chisquare(n) / n));
	}

	// return a random number from a lognormal distribution
	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'lognormal'.
	 * @param average Wartość oczekiwana. Poprawny zakres wartości: liczba rzeczywista, większa od 0.
	 * @param stdDev Odchylenie standardowe. Poprawny zakres wartości: liczba rzeczywista, większa od 0.
	 * @return Zwraca liczbę rzeczywistą w przedziale (0 ; ∞).
	 */	
	public double lognormal(double average, double stdDev) {
		if (stdDev <= 0.0) {
			System.err.println("RNGenerator:lognormal: b must be >0 ");
			return -1;
		}
		return Math.exp(normal(average, stdDev));
	}

	// return it from a f distribution.
	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'F Snedecora'.
	 * @param n Parametr stopnia swobody. Poprawny zakres wartości: liczba całkowita, większa od 0.
	 * @param m Parametr stopnia swobody. Poprawny zakres wartości: liczba całkowita, większa od 0.
	 * @return Zwraca liczbę rzeczywistą w przedziale (0 ; ∞).
	 */	
	public double fdistribution(int n, int m) {
		return ((m * chisquare(n)) / (n * chisquare(m)));
	}

	// random number from a weibull distribution
	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'weibulla'.
	 * @param m Parametr charakterystycznego czasu życia. Poprawny zakres wartości: liczba rzeczywista, większa od 0.
	 * @param k Parametr kształtu. Poprawny zakres wartości: liczba rzeczywista, większa od 0.
	 * @return Zwraca liczbę rzeczywistą w przedziale (0 ; ∞).
	 */	
	public double weibull(double m, double k) {
		if (m <= 0) {
			System.err.println("RNGenerator:Weibull: give m>0");
			return -1;
		}
		if (k <= 0) {
			System.err.println("RNGenerator:Weibull: give k>0");
			return -1;
		}
		double power;
		power = 1.0 / k;
		return Math.pow(-Math.log(1.0 - nextDouble()), power) * m;
		
	}

	// get it from a poisson distribution with the given mean

	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'poissona'.
	 * @param a Parametr oczekiwanej liczby zdarzeń w danym przedziale czasu. Poprawny zakres wartości: liczba rzeczywista, większa od 0.
	 * @return Zwraca liczbę całkowitą nieujemną.
	 */
	public double poisson(double a) {
		// can we use the direct method
		double sq = -1.0;
		double alxm = -1.0;
		double g = -1.0;
		double oldm = -1.0;
		double em, t, yy;
		if (a < 12.0) {
			if (a != oldm) {
				oldm = a;
				g = Math.exp(-a);
			}
			em = -1.0;
			t = 1.0;
			do {
				em += 1.0;
				t *= nextDouble();
			} while (t > g);
		}

		// use the rejection method
		else {
			if (a != oldm) {
				oldm = a;
				sq = Math.sqrt(2.0 * a);
				alxm = Math.log(a);
				g = a * alxm - lngamma(a + 1.0);
			}
			do {
				do {
					// y is a deviate from a Lorentzian comparison function
					yy = Math.tan(PI * nextDouble());
					em = sq * yy + a;
				} while (em < 0.0);
				em = Math.floor(em);
				t = 0.9 * (1.0 + yy * yy)
						* Math.exp(em * alxm - lngamma(em + 1.0) - g);
			} while (nextDouble() > t);
		}
		return em;
	}

	// return a variate from the geometric distribution with event
	// probability p
	/** w przedziale (-∞ ; ∞).
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'geometryczny'.
	 * @param p Parametr prawdopodobieństwa sukcesu. Poprawny zakres wartości: liczba rzeczywista z przedziału (0;1).
	 * @return Zwraca liczbę całkowitą dodatnią.
	 */	
	public double geometric(double p) {
		if ((p <= 0.0) || (p >= 1.0)) {
			System.err
					.println("RNGenerator.geometric: p must be from, range (0,1)");
			return -1;
		}
		return (Math.ceil(Math.log(nextDouble()) / Math.log(1.0 - p)));
	}


	// get it from the binomial distribution with event probability p
	// and n the number of trials
	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'dwumianowy'.
	 * @param p Parametr prawdopodobieństwa sukcesu. Poprawny zakres wartości: liczba rzeczywista z przedziału [0;1].
	 * @param n Parametr liczby prób. Poprawny zakres wartości: liczba całkowita nieujemna.
	 * @return Zwraca liczbę całkowitą nieujemną ze zbioru liczb {0,...,n}
	 */	
	public double binomial(double p, int n) {
		int j;
		int nold = -1;
		double am, em, g, angle, prob, bnl, sq, t, yy;
		double pold = -1.0;
		double pc = 0;
		double en = 0;
		double oldg = 0;
		double plog = 0;
		double pclog = 0;

		if ((p <= 0.0) || (p >= 1.0)) {
			System.err
					.println("RNGenerator.binomial: p must be from range (0,1)");
			return -1;
		}

		if (p <= 0.5)
			prob = p;
		else
			prob = 1.0 - p;
		am = n * prob;

		if (n < 25) {
			bnl = 0.0;
			for (j = 1; j <= n; j++)
				if (nextDouble() < prob)
					bnl += 1.0;
		} else if (am < 10) {
			g = Math.exp(-am);
			t = 1.0;
			for (j = 0; j <= n; j++) {
				t = t * nextDouble();
				if (t < g)
					break;
			}
			if (j <= n)
				bnl = j;
			else
				bnl = n;
		} else {
			if (n != nold) {
				en = n;
				oldg = lngamma(en + 1.0);
				nold = n;
			}
			if (prob != pold) {
				pc = 1.0 - prob;
				plog = Math.log(prob);
				pclog = Math.log(pc);
				pold = prob;
			}
			sq = Math.sqrt(2.0 * am * pc);
			do {
				do {
					angle = PI * nextDouble();
					yy = Math.tan(angle);
					em = sq * yy + am;

				} while (em < 0.0 || em >= (en + 1.0));
				em = Math.floor(em);
				t = 1.2
						* sq
						* (1.0 + yy * yy)
						* Math.exp(oldg - lngamma(em + 1.0)
								- lngamma(en - em + 1.0) + em * plog
								+ (en - em) * pclog);
			} while (nextDouble() > t);
			bnl = em;
		}
		if (prob != p)
			bnl = n - bnl;
		return bnl;
	}

	// return a random variabele drawn from the triangular distribution
	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'trójkątny'.
	 * @param a Parametr kształtu. Poprawny zakres wartości: liczba rzeczywista z przedziału [0;1]. 
	 * @return Zwraca liczbę rzeczywistą nieujemną. 
	 */	
	public double triangular(double a) {
		if ((a < 0.0) || (a > 1.0))
			System.err
					.println("RNGenerator:triangular: give a from range [0,1]");
		double xx = nextDouble();
		double yy = nextDouble();
		if (xx > a)
			return (1.0 - ((1.0 - a) * Math.sqrt(yy)));
		else
			return (Math.sqrt(yy) * a);
	}

	// return OK with probability p and FALSE with probability 1-p
	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'prawdopodobieństwo p'.
	 * @param p Parametr prawdopodobieństwa. Poprawny zakres wartości: liczba rzeczywista z przedziału (0;1).
	 * @return Zwraca TRUE lub FALSE. 
	 */	
	public boolean probability(double p) {
		boolean wynik = false;
		if ((p < 0.0) || (p > 1.0)) {
			System.err
					.println("RNGenerator.propability: p must be from range (0,1)");
			return false;
		}
		if (p >= nextDouble())
			wynik = true;
		return wynik;
	}

	// ===============================================================
	private static double lngamma(double xx) {
		double x = xx - 1.0;
		double tmp = x + 5.5;
		tmp -= (x + 0.5) * Math.log(tmp);
		double ser = 1.0;
		for (int j = 0; j < 6; j++) {
			x += 1.0;
			ser += cof[j] / x;
		}
		return (-tmp + Math.log(2.50662827465 * ser));
	}


	/**
	 * Metoda generująca wartość pseudolosową jako realizację rozkładu 'cauchy'.
	 * @param x0 Parametr położenia. Poprawny zakres wartości: liczba rzeczywista.
	 * @param gamma Parametr skali. Poprawny zakres wartości: liczba rzeczywista, różna od 0.
	 * @return Zwraca liczbę rzeczywistą.
	 */

	public static double cauchy(double x0, double gamma) {
		Random rand = new Random();
		double x = rand.nextDouble();
		return (gamma * Math.tan( 0.5 * Math.PI * (2 * x - 1)) + x0);
	}
}