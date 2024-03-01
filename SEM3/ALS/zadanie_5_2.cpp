#include <iostream>
#include <fstream>
#include <sstream>

using namespace std;

struct Data {
    char letter;
    int number1;
    int number2;
};

int countLines(const string& filename) {
    ifstream file(filename.c_str());
    int count = 0;
    string line;
    while (getline(file, line)) {
        ++count;
    }
    file.close();
    return count;
}

Data* readFile(const string& filename) {
    int size = countLines(filename);
    Data* data = new Data[size];

    ifstream file(filename.c_str());
    if (file.is_open()) {
        string line;
        for (int i = 0; i < size; ++i) {
            getline(file, line);
            istringstream iss(line);
            iss >> data[i].letter >> data[i].number1 >> data[i].number2;
        }
        file.close();
    } else {
        cout << "Unable to open file";
    }

    return data;
}

void printData(const Data* data, int size) {
    for (int i = 0; i < size; ++i) {
        cout << "PRIORYTET: " << data[i].letter << ", NR: " << data[i].number1 << ", CZAS: " << data[i].number2 << endl;
    }
}

void swap(Data &a, Data &b) {
    Data temp = a;
    a = b;
    b = temp;
}

bool compare(const Data &a, const Data &b) {
    if (a.letter == b.letter) {
        return a.number2 < b.number2;
    } else {
        if (a.letter == 'P') return true;
        if (b.letter == 'P') return false;
        if (a.letter == 'G') return true;
        if (b.letter == 'G') return false;
        return a.letter < b.letter;
    }
}

void sortData(Data* data, int size) {
    for (int i = 0; i < size - 1; ++i) {
        for (int j = 0; j < size - i - 1; ++j) {
            if (!compare(data[j], data[j + 1])) {
                swap(data[j], data[j + 1]);
            }
        }
    }
}

void peopleAllocation (Data* data, int size) {
    int p1 = 0, p2 = 0, p3 = 0;
    int i = 3;
    p1 = data[0].number2;
    p2 = data[1].number2;
    p3 = data[2].number2;

    cout << "Klient " << data[0].number1 << " obsluzony przez linie 1" << endl;
    cout << "Klient " << data[1].number1 << " obsluzony przez linie 2" << endl;
    cout << "Klient " << data[2].number1 << " obsluzony przez linie 3" << endl;


    while(i < size) {
        if (p1 <= p2 && p1 <= p3) {
            cout << "Klient " << data[i].number1 << " obsluzony przez linie 1" << endl;
            p1 += data[i].number2;
        } else if (p2 <= p1 && p2 <= p3) {
            cout << "Klient " << data[i].number1 << " obsluzony przez linie 2" << endl;
            p2 += data[i].number2;
        } else if (p3 <= p1 && p3 <= p2) {
            cout << "Klient " << data[i].number1 << " obsluzony przez linie 3" << endl;
            p3 += data[i].number2;
        }
        i++;
    }
}

int main() {
    string filename = "/home/plato/CLionProjects/als61/plik.txt";
    int size = countLines(filename);
    Data* data = readFile(filename);
    sortData(data, size);
    cout << endl << "Kolejnosc przyjmowania klientow:" << endl;
    // printData(data, size);
    peopleAllocation(data, size);
    delete[] data;
    return 0;
}
