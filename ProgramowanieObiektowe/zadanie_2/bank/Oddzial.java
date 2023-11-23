package bank;

public class Oddzial {
    protected int numer;
    public int numerTelefonu;
    public String adress;
    public Bankomat bankomat = new Bankomat();
    public Klient klient = new Klient();
    public Kierownik kierownik = new Kierownik();

    public Oddzial() {
        this.bankomat = new Bankomat();
        this.klient = new Klient();
        this.kierownik = new Kierownik();
    }

    public Oddzial(int numer, int numerTelefonu, String adress) {
        this.numer = numer;
        this.numerTelefonu = numerTelefonu;
        this.adress = adress;
        this.bankomat = new Bankomat();
        this.klient = new Klient();
        this.kierownik = new Kierownik();
    }

    public int getNumer() {
        return numer;
    }

    public void setNumer(int numer) {
        this.numer = numer;
    }

    public int getNumerTelefonu() {
        return numerTelefonu;
    }

    public void setNumerTelefonu(int numerTelefonu) {
        this.numerTelefonu = numerTelefonu;
    }

    public String getAdress() {
        return adress;
    }

    public void setAdress(String adress) {
        this.adress = adress;
    }

    public Bankomat getBankomat() {
        return bankomat;
    }

    public void setBankomat(Bankomat bankomat) {
        this.bankomat = bankomat;
    }

    public Klient getKlient() {
        return klient;
    }

    public void setKlient(Klient klient) {
        this.klient = klient;
    }

    public Kierownik getKierownik() {
        return kierownik;
    }

    public void setKierownik(Kierownik kierownik) {
        this.kierownik = kierownik;
    }

    @Override
    public String toString() {
        return "Oddzial{" +
                "numer=" + numer +
                ", numerTelefonu=" + numerTelefonu +
                ", adress='" + adress + '\'' +
                ", bankomat=" + bankomat +
                ", klient=" + klient +
                ", kierownik=" + kierownik +
                '}';
    }
}
