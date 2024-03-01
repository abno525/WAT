package bank;

public class Kierownik extends Czlowiek implements Obywatel {
    public Pracownik pracownik;
    public Kierownik() {
        this.pracownik = new Pracownik();
    }

    public Kierownik(String imie, String nazwisko) {
        this.imie = imie;
        this.nazwisko = nazwisko;
    }

    @Override
    public String getImie() {
        return imie;
    }

    public void setImie(String imie) {
        this.imie = imie;
    }
    @Override
    public String getNazwisko() {
        return nazwisko;
    }

    @Override
    public int getNumerTelefonu() {
        return 0;
    }

    public void setNazwisko(String nazwisko) {
        this.nazwisko = nazwisko;
    }

    public Pracownik getPracownik() {
        return pracownik;
    }

    public void setPracownik(Pracownik pracownik) {
        this.pracownik = pracownik;
    }

    @Override
    public String toString() {
        return "Kierownik{" +
                "imie='" + imie + '\'' +
                ", nazwisko='" + nazwisko + '\'' +
                ", pracownik=" + pracownik +
                '}';
    }
}
