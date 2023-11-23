package bank;

public class Konto {
    private int numer;
    public int wartosc;

    public Konto() {}

    public Konto(int numer, int wartosc) {
        this.numer = numer;
        this.wartosc = wartosc;
    }

    public void wplac(int kwota) {
        wartosc += kwota;
    }

    public void wyplac(int kwota) {
        wartosc -= kwota;
    }

    public int getNumer() {
        return numer;
    }

    public void setNumer(int numer) {
        this.numer = numer;
    }

    public int getWartosc() {
        return wartosc;
    }

    public void setWartosc(int wartosc) {
        this.wartosc = wartosc;
    }

    @Override
    public String toString() {
        return "Konto{" +
                "numer=" + numer +
                ", wartosc=" + wartosc +
                '}';
    }
}
