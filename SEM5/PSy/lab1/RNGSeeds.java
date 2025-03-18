import java.util.Date;

abstract class RNGSeeds
{

    /**
     * 
     * Zwraca wartość typu "long integer" jako ziarno zbudowane na podstawie aktualnego czasu zegarowego
     * 
     * @param d data
     * @return ziarno
     *  
     */
    public static long ClockSeed(Date d) {
		return d.getTime();
	}

    /**
	 * 
	 * Zwraca wartość typu "long integer" jako ziarno zbudowane na podstawie zadanego czasu. 
     * 
     * @return ziarno
     *
	 */

    public static long ClockSeed() {
		return ClockSeed(new Date());
	}
}