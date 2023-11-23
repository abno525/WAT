package bank;

public class Bank {
    protected String nazwa;
    protected String wlasciciel;

    public Oddzial oddzial = new Oddzial();
    public Bank() {
        this.oddzial = new Oddzial();
    }
    public Bank(String nazwa, String wlasciciel) {
        this.nazwa = nazwa;
        this.wlasciciel = wlasciciel;
    }
    public void setNazwa(String nazwa) {
        this.nazwa = nazwa;
    }

    public String getNazwa() {
        return nazwa;
    }

    public void setWlasciciel(String wlasciciel) {
        this.wlasciciel = wlasciciel;
    }

    public String getWlasciciel() {
        return wlasciciel;
    }

    public Oddzial getOddzial() {
        return oddzial;
    }

    public void setOddzial(Oddzial oddzial) {
        this.oddzial = oddzial;
    }

    @Override
    public String toString() {
        return "Bank{" +
                "nazwa='" + nazwa + '\'' +
                ", wlasciciel='" + wlasciciel + '\'' +
                ", oddzial=" + oddzial +
                '}';
    }
}
