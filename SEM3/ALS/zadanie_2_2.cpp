#include <iostream>
#include <string>
#include <fstream>

using namespace std;

struct Node {
    string nazwisko;
    string imie;
    string numerTelefonu;
    Node* poprzedni;
    Node* nastepny;

    Node(const string& nazwisko, const string& imie, const string& numerTelefonu) :  nazwisko(nazwisko), imie(imie), numerTelefonu(numerTelefonu), poprzedni(NULL), nastepny(NULL) {}
};

class listaDwukierunkowa {
private:
    Node* head;

public:

    listaDwukierunkowa() : head(NULL) {}

    void dodajOsobe(const string& nazwisko, const string& imie, const string& numerTelefonu, Node* nodeNizej, Node* nodeWyzej) {

        Node* nowy = new Node(nazwisko, imie, numerTelefonu);
        if (!head) {
            head = nowy;
            head->nastepny = head;
            head->poprzedni = head;

        } else {

            Node* aktualny = head;
            while (aktualny->nastepny != head && aktualny != nodeNizej && aktualny->nastepny != nodeWyzej) {
                aktualny = aktualny->nastepny;
            }

            nowy->poprzedni = aktualny;
            nowy->nastepny = aktualny->nastepny;
            aktualny->nastepny->poprzedni = nowy;
            aktualny->nastepny = nowy;
        }
    }

    void dodajOsobeAlfabetycznie(const string& nazwisko, const string& imie, const string& numerTelefonu) {
        if (!head) {
            dodajOsobe(nazwisko, imie, numerTelefonu, head, head);
        } else {
            Node* nowy = new Node(nazwisko, imie, numerTelefonu);
            Node* aktualny = head;
            while (aktualny->nastepny != head) {
                if (nazwisko[0] < aktualny->nazwisko[0] || (nazwisko[0] == aktualny->nazwisko[0] && nazwisko < aktualny->nazwisko)) {
                    break;
                }
                aktualny = aktualny->nastepny;
            }

            dodajOsobe(nazwisko, imie, numerTelefonu, aktualny->poprzedni, aktualny);
        }
    }

    void usunOsobe(const string& nazwisko, const string& imie, const string& numerTelefonu) {
        if (!head) { cout << endl << "Nikt nie został jeszcze dodany." << endl; return; }

        Node* aktualny = head;

        do {
            if (nazwisko == aktualny->nazwisko && imie == aktualny->imie && numerTelefonu == aktualny->numerTelefonu) {
                aktualny->poprzedni->nastepny = aktualny->nastepny;
                aktualny->nastepny->poprzedni = aktualny->poprzedni;
                if (aktualny == head) {
                    if (aktualny->nastepny == head) {
                        delete aktualny;
                        head = NULL;
                        break;
                    }
                    head = aktualny->nastepny;
                }
                delete aktualny;
                break;
            }
            aktualny = aktualny -> nastepny;
        } while (aktualny != head->poprzedni);
    }

    void znajdzOsobe(const string& nazwisko, const string& imie, const string& numerTelefonu) {
        if (!head) { cout << endl << "Nikt nie został jeszcze dodany." << endl; return; }

        Node* aktualny = head;

        do {
            if (nazwisko == aktualny->nazwisko || imie == aktualny->imie || numerTelefonu == aktualny->numerTelefonu) {
                cout << aktualny->nazwisko << " " << aktualny->imie << " " << aktualny->numerTelefonu << endl;
            }
            aktualny = aktualny -> nastepny;
        } while (aktualny != head);
    }

    static void wyswietlPolecenia() {
        cout << endl << "PROGRAM WIZYTOWNIK ";
        cout << endl << "Dane przetrzymywane w kolejności NAZWISKO IMIE NR_TEL ";
        cout << endl << "d-dodaj wizytówkę ";
        cout << endl << "s-szukaj wizytówki ";
        cout << endl << "w-wypisz wizytówki (A ... Z)";
        cout << endl << "v-wypisz wizytówki (Z ... A) ";
        cout << endl << "u-usun wizytówkę ";
        cout << endl << "z-zapisz rekordy w pliku ";
        cout << endl << "inne-powtórz sterowanie ";
        cout << endl << "Wpisz kolejne polecenie : ";
    }

    void wyswietlAZ() {
        if (!head) { cout << endl << "Nikt nie został jeszcze dodany." << endl; return; }

        Node* aktualny = head;
        cout << "NAZWISKO IMIE NR_TEL" << endl;
        do {
            cout << aktualny->nazwisko << " " << aktualny->imie << " " << aktualny->numerTelefonu << endl;
            aktualny = aktualny->nastepny;
        } while (aktualny != head);
    }

    void wyswietlZA() {
        if (!head) { cout << endl << "Nikt nie został jeszcze dodany." << endl; return; }

        Node* aktualny = head->poprzedni;
        cout << "NAZWISKO IMIE NR_TEL" << endl;
        do {
            cout << aktualny->nazwisko << " " << aktualny->imie << " " << aktualny->numerTelefonu << endl;
            aktualny = aktualny->poprzedni;
        } while (aktualny != head->poprzedni);
    }

    void zapiszDoPliku() {
        if (!head) { cout << endl << "Nikt nie został jeszcze dodany." << endl; return; }

        Node* aktualny = head;
        ofstream plik("plik.txt");
        plik << "NAZWISKO IMIE NR_TEL" << endl;

        do {
            plik << aktualny->nazwisko << " " << aktualny->imie << " " << aktualny->numerTelefonu << endl;
            aktualny = aktualny->nastepny;
        } while (aktualny != head);

        plik.close();
        cout << endl << "Zapisano do pliku." << endl;
    }

    void kontroler() {
        char wybranaOpcja;
        cin >> wybranaOpcja;
        string imie, nazwisko, numerTelefonu;
        cin.ignore();

        switch(wybranaOpcja) {
            case 'd':
                cout << endl << "Podaj imię. : ";
                getline(cin, imie);
                cout << endl << "Podaj nazwisko. : ";
                getline(cin, nazwisko);
                cout << endl << "Podaj numer telefonu. : ";
                getline(cin, numerTelefonu);
                dodajOsobeAlfabetycznie(nazwisko,imie,numerTelefonu);
                cout << endl << "Wpisz kolejne polecenie : ";
                break;
            case 's':
                cout << endl << "Podaj imię. : ";
                getline(cin, imie);
                cout << endl << "Podaj nazwisko. : ";
                getline(cin, nazwisko);
                cout << endl << "Podaj numer telefonu. : ";
                getline(cin, numerTelefonu);
                znajdzOsobe(nazwisko,imie,numerTelefonu);
                cout << endl << "Wpisz kolejne polecenie : ";
                break;
            case 'w':
                wyswietlAZ();
                cout << endl << "Wpisz kolejne polecenie : ";
                break;
            case 'v':
                wyswietlZA();
                cout << endl << "Wpisz kolejne polecenie : ";
                break;
            case 'u':
                cout << endl << "Podaj imię. : ";
                getline(cin, imie);
                cout << endl << "Podaj nazwisko. : ";
                getline(cin, nazwisko);
                cout << endl << "Podaj numer telefonu. : ";
                getline(cin, numerTelefonu);
                usunOsobe(nazwisko,imie,numerTelefonu);
                cout << endl << "Wpisz kolejne polecenie : ";
                break;
            case 'z':
                zapiszDoPliku();
                cout << endl << "Wpisz kolejne polecenie : ";
                break;
            default:
                wyswietlPolecenia();
                break;
        }
        kontroler();
    }
};

int main() {

    listaDwukierunkowa lista;
    listaDwukierunkowa::wyswietlPolecenia();
    lista.kontroler();
    return 0;

}
