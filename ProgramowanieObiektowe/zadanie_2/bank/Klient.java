package bank;

public class Klient {
    protected String imie;
    protected String nazwisko;
    protected int numerTelefonu;

    public Konto konto;
    public Kredyt kredyt;

    public Klient() {
        this.konto = new Konto();
        this.kredyt = new Kredyt();
    }
    public Klient(String imie, String nazwisko, Konto konto, Kredyt kredyt) {
        this.imie = imie;
        this.nazwisko = nazwisko;
        this.konto = konto;
        this.kredyt = kredyt;
    }

    public int getNumerTelefonu() {
        return numerTelefonu;
    }

    public void setNumerTelefonu(int numerTelefonu) {
        this.numerTelefonu = numerTelefonu;
    }

    public void setImie(String imie) {
        this.imie = imie;
    }

    public void setNazwisko(String nazwisko) {
        this.nazwisko = nazwisko;
    }

    public void setKonto(Konto konto) {
        this.konto = konto;
    }

    public void setKredyt(Kredyt kredyt) {
        this.kredyt = kredyt;
    }

    public String getImie() {
        return imie;
    }

    public String getNazwisko() {
        return nazwisko;
    }

    public Konto getKonto() {
        return konto;
    }

    public Kredyt getKredyt() {
        return kredyt;
    }

    @Override
    public String toString() {
        return "Klient{" +
                "imie='" + imie + '\'' +
                ", nazwisko='" + nazwisko + '\'' +
                ", numerTelefonu=" + numerTelefonu +
                ", konto=" + konto +
                ", kredyt=" + kredyt +
                '}';
    }
}
