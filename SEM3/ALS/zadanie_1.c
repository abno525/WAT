/* ---------------------
Arkadiusz Ostrzyżek WCY22KY2S1

ZADANIA
Zaimplementuj:
1.1 silnie iteracyjnie
1.2 zaimplementuj silnie rekurencyjnie.
2.1 ciąg Fibonacciego iteracyjnie.
2.2 ciąg Fibonacciego rekurencyjnie.
3.1 algorytm obliczający wartość wielomianu 2 stopnia klasycznie.
3.2 metodę Hornera
4. Mnożenie macierzy o rozmiarach N x M oraz M x K.
5. Znajdowanie najmniejszej i największej wartości z danych wprowadzonych.
Dane wyświetlać na ekranie oraz zapisać do pliku.
Złożoność asymptotyczna określić używając notacji O.

*/

#include <stdio.h>

// ZADANIE 1.1

void silina_iteracyjna() {

    int wartoscZwracana = 1;
    int wartoscPodawana;
    int i = 1;

    printf("\n Podaj wartosc \n");
    scanf("%d", &wartoscPodawana);

    if (wartoscPodawana == 0) {
        printf("%d", wartoscZwracana);
    }

    for (; i <= wartoscPodawana; i++) {
        wartoscZwracana = wartoscZwracana * i;
    }

    printf("%d", wartoscZwracana);
}

// ZADANIE 1.2

int silinaRekurencyjna(int n) {
    if (n >= 1) {
        return n * silinaRekurencyjna(n - 1);
    }  else {
        return(1);
    }
}

void silniaRekurencyjnaStarter() {

    int wartoscPodawana;

    printf("\n Podaj wartosc \n");
    scanf("%d", &wartoscPodawana);

    printf("%d", silinaRekurencyjna(wartoscPodawana));

}

// ZADANIE 2.1

void ciagFibonacciegoIteracyjny() {

    int wartoscZwracana;
    int wartoscPodawana;

    printf("\n Podaj wartosc \n");
    scanf("%d", &wartoscPodawana);

    printf("%s", "0 ");
    if (wartoscPodawana == 1) return;
    printf("%s", "1 ");
    if (wartoscPodawana == 2)  return;

    int przedostatni = 0;
    int ostatni = 1;
    int najnowszy;

    for (wartoscZwracana = 3; wartoscZwracana <= wartoscPodawana; wartoscZwracana++) {
        najnowszy = przedostatni + ostatni;
        printf("%d", najnowszy);
        printf("%s", " ");
        przedostatni = ostatni;
        ostatni = najnowszy;
    }
}

// ZADANIE 2.2

void ciagFibonacciegoRekurencyjny(int pozostaloDoDruku, int przedostatnia, int ostatnia) {
    if (pozostaloDoDruku <= 0) {
        return;
    }

    int fib = przedostatnia + ostatnia;
    printf("%d ", fib);
    ciagFibonacciegoRekurencyjny(pozostaloDoDruku - 1, ostatnia, fib);
}

void ciagFibonacciegoRekurencyjnyStarter() {
    int wartoscPodawana;

    printf("Wpisz ile wartości Fibonacciego wypisać: ");
    scanf("%d", &wartoscPodawana);

    if (wartoscPodawana <= 0) {
        printf("Niepoprawna ilość.\n");
    } else if (wartoscPodawana >= 1) {
        printf("0 ");

        if (wartoscPodawana >= 2) {
            printf("1 ");

            if (wartoscPodawana > 2) {
                ciagFibonacciegoRekurencyjny(wartoscPodawana - 2, 0, 1);
            }
        }
    }
}

// ZADANIE 3.1

void wartoscWielomianuDrugiegoStopnia() {

    int a2, a1, a0, x;
    int wartoscZwracana;


    printf("\n Podaj wartosc a2 \n");
    scanf("%d", &a2);

    printf("\n Podaj wartosc a1 \n");
    scanf("%d", &a1);

    printf("\n Podaj wartosc a0 \n");
    scanf("%d", &a0);

    printf("Podaj wartosc x \n");
    scanf("%d", &x);

    wartoscZwracana = a2*x*x;
    wartoscZwracana = wartoscZwracana + a1*x;
    wartoscZwracana = wartoscZwracana + a0;

    printf("%d", wartoscZwracana);

}


// ZADANIE 3.2

void metodaHornera() {

    int wartoscZwracana;
    int a2, a1, a0, x;

    printf("\n Podaj wartosc a2 \n");
    scanf("%d", &a2);

    printf("\n Podaj wartosc a1 \n");
    scanf("%d", &a1);

    printf("\n Podaj wartosc a0 \n");
    scanf("%d", &a0);

    printf("\n Podaj wartosc x \n");
    scanf("%d", &x);

    wartoscZwracana = a2 * x + a1;
    wartoscZwracana = wartoscZwracana * x + a0;

    printf("%d", wartoscZwracana);
}


// ZADANIE 4

void mnorzenieMacierzy() {

    int m, n, p, i, j, k;

    printf("Podaj wymiary pierwszej macierzy (m i n): ");
    scanf("%d %d", &m, &n);

    printf("Podaj wymiary drugiej macierzy (n i p): ");
    scanf("%d %d", &n, &p);

    int macierz1[m][n], macierz2[n][p], wynik[m][p];

    printf("Podaj elementy pierwszej macierzy:\n");
    for (i = 0; i < m; i++) {
        for (j = 0; j < n; j++) {
            scanf("%d", &macierz1[i][j]);
        }
    }

    printf("Podaj elementy drugiej macierzy:\n");
    for (i = 0; i < n; i++) {
        for (j = 0; j < p; j++) {
            scanf("%d", &macierz2[i][j]);
        }
    }

    for (i = 0; i < m; i++) {
        for (j = 0; j < p; j++) {
            wynik[i][j] = 0;
            for (k = 0; k < n; k++) {
                wynik[i][j] = wynik[i][j] + macierz1[i][k] * macierz2[k][j];
            }
        }
    }

    printf("Wynikowa Macierz:\n");
    for (i = 0; i < m; i++) {
        for (j = 0; j < p; j++) {
            printf("%d ", wynik[i][j]);
        }
        printf("\n");
    }
}

// ZADANIE 5

void znajdzMinMax() {
    int n, i, j;
    printf("Podaj liczbę danych wejściowych: ");
    scanf("%d", &n);
    int liczby[n];


    printf("Podaj %d liczb:\n", n);
    for (i = 0; i < n; i++) {
        scanf("%d", &liczby[i]);
    }

    for (i = 0; i < n; i++) {
        if (i % 10 == 0) printf("\n");
        if (liczby[i] < 10) printf("%s", " ");
        printf("%d ", liczby[i]);
    }
    printf("\n");

    int maksimum = liczby[0];
    int minimum = liczby[0];

    for (i = 1; i < n; i++) {
        if (liczby[i] > maksimum) {
            maksimum = liczby[i];
        }
        if (liczby[i] < minimum) {
            minimum = liczby[i];
        }
    }

    printf("Największa liczba: %d\n", maksimum);
    printf("Najmniejsza liczba: %d\n", minimum);
}

int main() {

    // zadanie 1
    printf("%s", " \nSilnia iteracyjna \n");
    silina_iteracyjna();

    printf("%s", " \nSilnia rekurencyjna \n");
    silniaRekurencyjnaStarter();

    // zadanie 2
    printf("%s", " \nIteracyjny ciąg Fibonacciego \n");
    ciagFibonacciegoIteracyjny();

    printf("%s", " \nRekurencyjny ciąg Fibonacciego \n");
    ciagFibonacciegoRekurencyjnyStarter();

    // zadanie 3
    printf("%s", " \nWartości wielomianu drugiego stopnia \n");
    wartoscWielomianuDrugiegoStopnia();

    printf("%s", " \nMetoda Hornera \n");
    metodaHornera();

    // zadanie 4
    printf("%s", " \nMnorzenie macierzy \n");
    mnorzenieMacierzy();

    // zadanie 5
    printf("%s", " \nZnajdywanie najmniejszych wartości \n");
    znajdzMinMax();
    return 0;
}



