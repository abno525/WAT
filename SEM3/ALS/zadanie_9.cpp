#include <iostream>

using namespace std;

pair<int*, int> userInput() {
    int count = 0;
    cout <<"Enter the number of elements: ";
    cin >> count;
    int* numbers = new int[count]; // dynamically allocate memory
    cout << "Enter the elements: " << endl;
    for (int i = 0; i < count; ++i) {
        cin >> numbers[i];
    }
    pair <int*, int> result = make_pair(numbers, count);
    return result;
}

void printArray(int *a, int n) {
    for (int i = 0; i < n; ++i) {
        if (i % 10 == 0) {
            cout << endl;
        }
        cout << a[i] << " ";
    }
}

int ceil(float num) {
    int inum = (int)num;
    if (num == (float)inum) {
        return inum;
    }
    return inum + 1;
}

void shellsort(int *a, int n) {
    int temp, h = 1;
    while (h < n / 2) {
        h = 2 * h + 1;
    }
    while (h >= 1) {
        for (int i = h; i < n; ++i) {
            for (int j = i; j >= h && a[j] < a[j - h]; j -= h) {
                temp = a[j];
                a[j] = a[j - h];
                a[j - h] = temp;
            }
        }
        h /= 2;
    }
}

// SHIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
void librarysort(int *a, int n) {
    int size = ceil(n * 1.5);
    int* temp = new int[size];
    fill_n(temp, size, -1);

    temp[size / 2] = a[0];

    for (int i = 1; i < n; ++i) {
        int j = i;

        if (temp[j] != -1) {
            while (j < size && temp[j] != -1) {
                j++;
            }
            if (j == size) {
                int *newTemp = new int[size * 2];
                std::fill_n(newTemp, size * 2, -1);
                std::copy(temp, temp + size, newTemp);
                delete[] temp;
                temp = newTemp;
                size *= 2;
                j = i;
            }
        }

        // Find the position of the element using binary search and insert it in the correct position
        while (j > 0 && temp[j - 1] > a[i]) {
            temp[j] = temp[j - 1];
            j--;
        }
        temp[j] = a[i];

    }

    // Copy the sorted elements back to the original array
    int index = 0;
    for (int i = 0; i < size; ++i) {
        if (temp[i] != -1) {
            a[index++] = temp[i];
        }
    }

    delete[] temp;
}

int partition(int *a, int lo, int hi) {
    int pivot = a[hi];
    int i = lo - 1;

    for (int j = lo; j < hi; j++) {
        if (a[j] <= pivot) {
            i++;
            int temp = a[i];
            a[i] = a[j];
            a[j] = temp;
        }
    }

    i++;
    int temp = a[i];
    a[i] = a[hi];
    a[hi] = temp;
    return i;
}

void quicksort(int *a, int lo, int hi) {

    if (lo < 0 || hi <= lo) {
        return;
    }

    int p = partition(a, lo, hi);

    quicksort(a, lo, p - 1);
    quicksort(a, p + 1, hi);
}

int main() {


    cout << endl << "--- Shell Sort ---" << endl;
    pair<int*, int> input = userInput();
    int *a = input.first;
    int n = input.second;

    shellsort(a, n);
    printArray(a, n);

    cout << endl << "--- Library Sort ---" << endl;
    input = userInput();
    a = input.first;
    n = input.second;


    librarysort(a, n);
    printArray(a, n);

    cout << endl <<  "--- Quick Sort ---" << endl;
    input = userInput();
    a = input.first;
    n = input.second;

    quicksort(a, 0, n-1);
    printArray(a, n);

    delete[] a;

    return 0;
}
