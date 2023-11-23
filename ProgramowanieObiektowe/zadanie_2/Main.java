import bank.*;

public class Main {
    public static void main(String[] args) {

        Bank bank = new Bank();
        bank.setNazwa("PKO");
        bank.setWlasciciel("Jan Kowalski");
        bank.oddzial.setAdress("ul. Kolorowa 1");
        bank.oddzial.setNumerTelefonu(123456789);
        bank.oddzial.setNumer(1);
        bank.oddzial.bankomat.setModel("PKO");
        bank.oddzial.bankomat.setNumer(1);
        bank.oddzial.kierownik.setImie("Jan");
        bank.oddzial.kierownik.setNazwisko("Kowalski");
        bank.oddzial.kierownik.pracownik.setImie("Jan");
        bank.oddzial.kierownik.pracownik.setNazwisko("Kowalski");
        bank.oddzial.kierownik.pracownik.setNumerTelefonu(123456789);
        bank.oddzial.klient.setImie("Jan");
        bank.oddzial.klient.setNazwisko("Kowalski");
        bank.oddzial.klient.setNumerTelefonu(123456789);
        bank.oddzial.klient.setKonto(new Konto(123456789, 1000));
        bank.oddzial.klient.setKredyt(new Kredyt("12/12/23",1000, 0.1));
        bank.oddzial.klient.konto.setNumer(123456789);
        bank.oddzial.klient.konto.setWartosc(1000);

        System.out.println(bank);
    }
}