#include <iostream>
using namespace std;

// email: michal.sobolewski@wat.edu.pl

class Kredyt{
public:
    int kwota;

    Kredyt(int kwota) {
        this->kwota = kwota;
    }

    Kredyt() {
        this->kwota = 0;
    }

    void zmienKwote(int kwota) {
        this->kwota = kwota;
    }

    void drukujKwote() {
        cout << kwota;
    }
};

class Konto{
public:
    int nr_konta;
    int saldo;

    Konto(int nr_konta, int saldo) {
        this->nr_konta = nr_konta;
        this->saldo = saldo;
    }

    void zmienSaldo(int saldo) {
        this->saldo = saldo;
    }
    void drukujSaldo() {
        cout << saldo;
    }
    void drukujNrKonta() {
        cout << nr_konta;
    }
};

class Klient{
private:
    string imie;
    string nazwisko;
    string pesel;

public:

    Klient (string imie, string nazwisko, string pesel) {
        this->imie = imie;
        this->nazwisko = nazwisko;
        this->pesel = pesel;
    }

    Klient() {
        this->imie = "Tomasz";
        this->nazwisko = "Kowalski";
        this->pesel = "888888";
    }

    Konto *konto;
    Kredyt *kredyt;

    void zmienKonto(Konto *konto) {
        this->konto = konto;
    }

    void zmienKredyt (Kredyt *kredyt) {
        this->kredyt = kredyt;
    }

    void drukujImie() {
        cout << imie;
    }
    void drukujNazwisko() {
        cout << nazwisko;
    }
    void drukujPesel() {
        cout << pesel;
    }

    ~Klient() {
        delete konto;
        delete kredyt;
    }

};

class Kierownik{
private:
    string imie;
    string nazwisko;
public:
    string telefon;

    Kierownik (string imie, string nazwisko, string telefon) {
        this->imie = imie;
        this->nazwisko = nazwisko;
        this->telefon = telefon;
    }

    Kierownik() {
        this->imie = "Jan";
        this->nazwisko = "Kowalski";
        this->telefon = "123456789";
    }

    void zmienTelefon(string telefon) {
        this->telefon = telefon;
    }
    void drukujTelefon() {
        cout << telefon;
    }
};

class Pracownik{
private:
    string imie;
    string nazwisko;
public:
    string email;

    Pracownik (string imie, string nazwisko, string pesel) {
        this->imie = imie;
        this->nazwisko = nazwisko;
    }

    Pracownik() {
        this->imie = "Jan";
        this->nazwisko = "Kowalski";
    }

    void zmienEmail(string email) {
        this->email = email;
    }

    void drukujImie() {
        cout << imie;
    }
    void drukujNazwisko() {
        cout << nazwisko;
    }
    void drukujEmail() {
        cout << email;
    }
};

class Oddzial {
public:
    string nazwa;
    string adres;
    Kierownik *kierownik;
    Pracownik *pracownik;
    Klient *klient;

    Oddzial(string nazwa, string adres, Kierownik *kierownik, Pracownik *pracownik, Klient *klient) {
        this->nazwa = nazwa;
        this->adres = adres;
        this->kierownik = kierownik;
        this->pracownik = pracownik;
        this->klient = klient;
    }

    Oddzial(){
        this->nazwa = "Pierwszy oddzial";
        this->adres = "ul. Pierwsza 1";
        this->kierownik = new Kierownik();
        this->pracownik = new Pracownik();
    }

    void drukujNazwe() {
        cout << nazwa << endl;
    }

    void drukujAdres() {
        cout << adres << endl;
    }

    ~Oddzial() {
        delete klient;
        delete kierownik;
        delete pracownik;

    }
};

class Kamera {
private:
    string model;
public:
    string ip;

    Kamera(string model, string ip) {
        this->model = model;
        this->ip = ip;
    }

    Kamera() {
        this->model = "Model1";
        this->ip = "1.1.1.1";
    }

    void drukujModel() {
        cout << model << endl;
    }

    void drukujIP() {
        cout << ip << endl;
    }
};

class TelefonStacjonarny {
private:
    string model;
public:
    int numer;

    TelefonStacjonarny(int numer) {
        this->numer = numer;
    }
};

class Bankomat {
private:
    string model;
public:
    int banknoty;

    Bankomat(string model, int banknoty) {
        this->model = model;
        this->banknoty = banknoty;
    }

    Bankomat() {
        this->model = "Model1";
        this->banknoty = 1000;
    }

    void drukujModel() {
        cout << model << endl;
    }

    void drukujBanknoty() {
        cout << banknoty << endl;
    }
};

class Bank {
private:
    string nazwa;
    string wlasciciel;

public:
    string slogan;
    Oddzial *oddzial;
    Kamera *kamera;
    Bankomat *bankomat;
    TelefonStacjonarny *telefon;

    Bank (string nazwa, string wlasciciel, string slogan, Oddzial *oddzial, Kamera *kamera, Bankomat *bankomat, TelefonStacjonarny *telefon) {
        this->nazwa = nazwa;
        this->wlasciciel = wlasciciel;
        this->slogan = slogan;
        this->oddzial = oddzial;
        this->kamera = kamera;
        this->bankomat = bankomat;
        this->telefon = telefon;
    }

    void zmianaSloganu (string slogan) {
        this->slogan = slogan;
    }

    void drukujNazwe() {
        cout << nazwa << endl;
    }
    void drukujWlasciciel() {
        cout << wlasciciel << endl;
    }
    void drukujSlogan() {
        cout << slogan << endl;
    }

    ~Bank() {
        delete oddzial;
        delete kamera;
        delete bankomat;
        delete telefon;
    }
};

int main() {

    Klient *pierwszyKlient = new Klient("Jan", "Tym", "888888888");
    Kierownik *pierwszyKierownik = new Kierownik("Jan", "Kowalski", "123456789");
    Pracownik *pierwszyPracownik = new Pracownik("Jan", "Kowalski", "123456789");
    Oddzial *pierwszyOddzial = new Oddzial("Pierwszy oddzial", "ul. Pierwsza 1", pierwszyKierownik, pierwszyPracownik, pierwszyKlient);
    Kredyt *pierwszyKredyt = new Kredyt(1000);
    Konto *pierwszeKonto = new Konto(123456789, 1000);
    Kamera *pierwszeKamera = new Kamera("Model1", "123123123");
    Bankomat *pierwszyBankomat = new Bankomat("Model11", 1000);
    TelefonStacjonarny *telefon = new TelefonStacjonarny(123456789);
    Bank *pierwszyBank = new Bank("Bank1", "Stefan Batory", "Świetny Bank", pierwszyOddzial, pierwszeKamera, pierwszyBankomat, telefon);

    pierwszyKlient->zmienKonto(pierwszeKonto);
    pierwszyKlient->zmienKredyt(pierwszyKredyt);
    cout << "Nazwa banku: ";
    pierwszyBank->drukujNazwe();
    cout << endl << "Wlasciciel banku: " << endl;
    pierwszyBank->drukujWlasciciel();
    cout << endl << "Slogan banku: " << endl;
    pierwszyBank->drukujSlogan();
    cout << endl << "Po zmianie sloganu: " << endl;
    pierwszyBank->zmianaSloganu("Nowy slogan");
    pierwszyBank->drukujSlogan();

    cout << "Nazwa oddzialu: ";
    pierwszyBank->oddzial->drukujNazwe();
    cout << endl << "Adres oddzialu: ";
    pierwszyBank->oddzial->drukujAdres();

    cout << "Numer telefonu kierownika oddziału: ";
    pierwszyBank->oddzial->kierownik->drukujTelefon();
    pierwszyBank->oddzial->kierownik->zmienTelefon("987654321");
    cout << endl << "Telefon po zmienanie: " << endl;
    pierwszyBank->oddzial->kierownik->drukujTelefon();

    cout << endl << "Imie pracownika: " << endl;
    pierwszyBank->oddzial->pracownik->drukujImie();
    cout << endl << "Nazwisko pracownika: " << endl;
    pierwszyBank->oddzial->pracownik->drukujNazwisko();
    cout << endl << "Email pracownika: " << endl;
    pierwszyBank->oddzial->pracownik->drukujEmail();
    cout << endl << "Po zmianie emaila: " << endl;
    pierwszyBank->oddzial->pracownik->zmienEmail("nowyemail@email.com");
    pierwszyBank->oddzial->pracownik->drukujEmail();

    cout << "Dane klienta: ";
    cout << endl << "Imie: " << endl;
    pierwszyBank->oddzial->klient->drukujImie();
    cout << endl << "Nazwisko: " << endl;
    pierwszyBank->oddzial->klient->drukujNazwisko();
    cout << endl << "Pesel: " << endl;
    pierwszyBank->oddzial->klient->drukujPesel();
    cout << endl << "Nr Konta: " << endl;
    pierwszyBank->oddzial->klient->konto->drukujNrKonta();
    cout << endl << "Saldo: " << endl;
    pierwszyBank->oddzial->klient->konto->drukujSaldo();
    cout << endl << "Wartość kredytu: " << endl;
    pierwszyBank->oddzial->klient->kredyt->drukujKwote();
    cout << endl << "Po zmianie wartości kredytu: " << endl;
    pierwszyBank->oddzial->klient->kredyt->zmienKwote(2000);
    pierwszyBank->oddzial->klient->kredyt->drukujKwote();

    cout << endl << "Model kamery w banku: " << endl;
    pierwszyBank -> kamera -> drukujModel();
    cout << endl << "IP kamery w banku: " << endl;
    pierwszyBank -> kamera -> drukujIP();

    cout << endl << "Model bankomatu w banku: " << endl;
    pierwszyBank -> bankomat -> drukujModel();
    cout << endl << "Ilość banknotów w bankomacie: " << endl;
    pierwszyBank -> bankomat -> drukujBanknoty();

    cout << endl << "Numer telefonu stacjonarnego w banku: " << endl;
    cout << pierwszyBank -> telefon -> numer;

    delete pierwszyBank;

    return 0;
}
