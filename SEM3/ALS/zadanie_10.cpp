#include <iostream>

using namespace std;

void swap(int *a, int *b) {
    int* tmp = a;
    a=b;
    b=tmp;
}

int biggestNumber(const int *a, int n) {
    int temp = 0;
    for (int i = 0; i < n; i++) {
        if (temp < a[i]) {
            temp = a[i];
        }
    }
    return temp;
}

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

bool check_heap(const int *a, int n) {

    for (int i = 2; i <= n; i++) {
        if (a[i] > a[i/2]) {
            return false;
        }
    }
    return true;
}

void shiftDown(int *a, int n, int i) {
    int largest = i;
    int left = 2*i + 1;
    int right = 2*i + 2;

    if (left < n && a[left] > a[largest])
        largest = left;

    if (right < n && a[right] > a[largest])
        largest = right;

    if (largest != i) {
        swap(a[i], a[largest]);
        shiftDown(a, n, largest);
    }
}

void buildHeap(int *a, int n) {
    for (int i = n / 2 - 1; i >= 0; i--)
        shiftDown(a, n, i);
}

void heapsort(int *a, int n) {
    buildHeap(a, n);

    for (int i=n-1; i>=0; i--) {
        swap(a[0], a[i]);
        shiftDown(a, i, 0);
    }
}

void countingsort(int *a, int n) {
    int max = biggestNumber(a, n);
    int temp[max+1];
    int output[n];
    fill_n(temp, max+1, 0);

    for (int i = 0; i < n; ++i) {
        temp[a[i]] += 1;
    }

    for (int i = 1; i <= max; i++) {
        temp[i] += temp[i-1];
    }

    for (int i = n-1; i >= 0; i--) {
        output[temp[a[i]]-1] = a[i];
        temp[a[i]] -= 1;
    }

    for (int i = 0; i < n; i++) {
        a[i] = output[i];
    }
}

void combsort(int *a, int n) {
    int gap = n;
    float shrink = 1.3;
    bool sorted = false;

    while (!sorted) {
        gap = (int) gap / shrink;
        if (gap <= 1) {
            gap = 1;
            sorted = true;
        }else if (gap == 9 || gap == 10) {
            gap = 11;
        }

        for (int i = 0; i + gap < n; i++) {
            if (a[i] > a[i + gap]) {
                swap(a[i], a[i + gap]);
                sorted = false;
            }
        }
    }
}

void radixsort(int *a, int n) {

    int max = biggestNumber(a, n);

    for( int exp = 1; max/exp > 0; exp *= 10 ) {
        int temp[max+1];
        int output[n];
        fill_n(temp, max+1, 0);

        for (int i = 0; i < n; ++i) {
            temp[a[i]] += 1;
        }

        for (int i = 1; i <= max; i++) {
            temp[i] += temp[i-1];
        }

        for (int i = n-1; i >= 0; i--) {
            output[temp[a[i]]-1] = a[i];
            temp[a[i]] -= 1;
        }

        for (int i = 0; i < n; i++) {
            a[i] = output[i];
        }

    }
}

int main() {

    cout << endl << "--- Heap Sort ---" << endl;
    pair<int*, int> input = userInput();
    int *a = input.first;
    int n = input.second;

    heapsort(a, n);
    printArray(a, n);

    cout << endl << "--- Counting Sort ---" << endl;
    input = userInput();
    a = input.first;
    n = input.second;

    countingsort(a, n);
    printArray(a, n);

    cout << endl << "--- Comb Sort ---" << endl;
    input = userInput();
    a = input.first;
    n = input.second;

    combsort(a, n);
    printArray(a, n);

    cout << endl << "--- Radix Sort ---" << endl;
    input = userInput();
    a = input.first;
    n = input.second;

    radixsort(a, n);
    printArray(a, n);
    return 0;
}
