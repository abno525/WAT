package bank;

public class Klient extends Czlowiek implements Obywatel{
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

    @Override
    public String getImie() {
        return imie;
    }

    public String getNazwisko() {
        return nazwisko;
    }

    @Override
    public int getNumerTelefonu() {
        return numerTelefonu;
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
