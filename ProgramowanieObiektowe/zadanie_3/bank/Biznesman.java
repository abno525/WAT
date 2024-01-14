package bank;

public class Biznesman extends Klient implements Obywatel{

    protected String nazwaFirmy;
    protected String rodzajDzialalnosci;

    public Biznesman() {}

    public Biznesman(String imie, String nazwisko, int numerTelefonu, String nazwaFirmy, String rodzajDzialalnosci) {
        this.imie = imie;
        this.nazwisko = nazwisko;
        this.numerTelefonu = numerTelefonu;
        this.nazwaFirmy = nazwaFirmy;
        this.rodzajDzialalnosci = rodzajDzialalnosci;
    }

    public void setNazwaFirmy(String nazwaFirmy) {
        this.nazwaFirmy = nazwaFirmy;
    }

    public void setRodzajDzialalnosci(String rodzajDzialalnosci) {
        this.rodzajDzialalnosci = rodzajDzialalnosci;
    }

    public String getNazwaFirmy() {
        return nazwaFirmy;
    }

    public String getRodzajDzialalnosci() {
        return rodzajDzialalnosci;
    }

    @Override
    public String getImie() {
        return null;
    }

    @Override
    public String getNazwisko() {
        return null;
    }

    @Override
    public int getNumerTelefonu() {
        return 0;
    }
}
