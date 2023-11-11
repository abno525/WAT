/*
 * Arkadiusz Ostrzyżek WCY22KY2S1
 *
 * ZADANIA:
 *
 * 2.1
 * Zaimplementuj algorytm realizujący kolejno:
 * - wypełnianie listy kolejnymi wartościami 1.100.
 * - wyświetlanie zawartości listy.
 * — obliczanie i wyświetlanie średniej z wartości umieszczonych w liście.
 * - usunięcie z listy wartości nieparzystych.
 * wyświetlenie zawartości listy.
 * - obliczenie i wyświetlenie średniej z wartości umieszczonych w liście.
 *
 * 2.2
 * Wizytownik
 * Zawiera nazwisko, imię, numer telefonu.
 * Zaimplementuj program realizujący w formie **listy dwukierunkowej** następujące funkcje wizytownika:
 * d-dodaj wizytówkę, +
 * s-szukaj wizytówki, +
 * w-wypisz wizytówki (A ... Z), +
 * v-wypisz wizytówki (Z ... A), +
 * u-usun wizytówkę, +
 * z-zapisz rekordy w pliku, +
 * inne-powtórz sterowanie +
 * Ctrl-Z-kończy działanie
 */


#include <iostream>

using namespace std;

struct Node1 {
    int dane;
    Node1* nastepny;

    Node1(int wartosc) : dane(wartosc), nastepny(NULL) {}
};

class listaJednokierunkowa {
private:
    Node1* head;

public:
    listaJednokierunkowa() : head(NULL) {}

    void dodajWartosc(int wartosc) {
        Node1* nowy = new Node1(wartosc);
        if (!head) {
            head = nowy;
        } else {
            Node1* aktualny = head;
            while (aktualny->nastepny) {
                aktualny = aktualny->nastepny;
            }
            aktualny->nastepny = nowy;
        }
    }

    void wyswietl() {
        Node1* aktualny = head;
        while (aktualny) {
            cout << aktualny -> dane << " ";
            aktualny = aktualny -> nastepny;
        }
        cout << endl;
    }

    float srednia() {
        Node1* aktualny = head;
        int suma = 0;
        int liczba = 0;
        while (aktualny) {
            suma += aktualny -> dane;
            liczba++;
            aktualny = aktualny -> nastepny;
        }

        if (liczba == 0) return 0.0;
        else return (float) suma / (float) liczba;

    }

    void usunNieparzyste() {
        Node1* aktualny = head;
        while (aktualny && aktualny -> nastepny) {
            Node1* nastepny = aktualny -> nastepny;
            if (nastepny -> dane % 2 != 0) {
                aktualny -> nastepny = nastepny -> nastepny;
                delete nastepny;
            } else {
                aktualny = nastepny;
            }
        }

        // Na koniec sprawdzamy, czy head nie jest nieparzysty.
        if (head && head -> dane % 2 != 0) {
            Node1* temp = head;
            head = head -> nastepny;
            delete temp;
        }
    }
};

int main() {
    listaJednokierunkowa lista;

    for (int i = 1; i <= 100; i++) {
        lista.dodajWartosc(i);
    }

    cout << "Zawartość listy: ";
    lista.wyswietl();

    cout << "Średnia z wartości w liście: " << lista.srednia() << endl;

    lista.usunNieparzyste();

    // Wyświetlanie zawartości listy po usunięciu nieparzystych
    cout << "Zawartość listy po usunięciu nieparzystych: ";
    lista.wyswietl();

    cout << "Średnia z wartości w liście po usunięciu nieparzystych: " << lista.srednia() << endl;

    return 0;
}
