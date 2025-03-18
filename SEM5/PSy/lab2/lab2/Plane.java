package lotnisko;

import dissimlab.random.RNGenerator;

public class Plane {

    int category;
    int landingDuration;
    int waitingTime;
    int totalWaitingTime = 0;

    public Plane(int time) {
        RNGenerator generator = new RNGenerator();
        generator.setSeed(1234);
        category = generator.uniformInt(1, 4);
        waitingTime = time;

        switch (category) {
            case 1:
                do {
                    landingDuration = (int) Math.ceil(generator.normal(3,1));
                } while (landingDuration < 1);
                break;
            case 2:
                landingDuration = generator.uniformInt(1,4);
                break;
            case 3:
                landingDuration = 2;
                break;
            default:
                break;
                }
    }

    /**
     * Metoda ustawiająca rozpoczęcia czasu oczekiwania
     * @param waitingTime czas rozpoczęcia czekania
     */
    public void setWaitingTime(int waitingTime) {
        this.waitingTime = waitingTime;
    }

    /**
     * Metoda zatrzymująca czas oczekiwania
     * @param time czas zatrzymania czekania
     */
    public void stopWaiting(int time) {
        totalWaitingTime = totalWaitingTime + time - waitingTime;
    }

    /**
     * Metoda zwracająca czas oczekiwania
     * @return czas czekania
     */
    public int getTotalWaitingTime() {
        return totalWaitingTime;
    }
}
