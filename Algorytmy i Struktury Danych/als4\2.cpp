#include <iostream>
#include <string>
#include <cstdlib>
#include <sstream>

using namespace std;

int charToInt(char s) {
    return (int(s) - 48);
}

struct Node {
    int value;
    Node* prev;

    Node(const int& value, Node* prev) : value(value), prev(prev) {}
};

class Stack {
private:
    Node *head;
public:

    Stack() : head(NULL) {}

    void push(const int& value) {
        Node* new_node = new Node(value, head);
        head = new_node;
    }

    void pop() {
        if (!head) return;
        Node* temp = head;
        head = head->prev;
        delete temp;
    }

    int top() {
        if (!head) return -1;
        return head->value;
    }
};


Stack receivingData(Stack stack) {

    char arr[100];
    cin.getline(arr, 100);
    int i = 0;

    while (arr[i] != '\0') {
        stack.push(charToInt(arr[i]));
        i++;
    }

    return stack;
}

Stack addition(Stack firstNumber, Stack secondNumber) {
    Stack answer;
    int sum;
    int carry = 0;

    while (!(firstNumber.top() == -1 and secondNumber.top() == -1)) {

        if (firstNumber.top() == -1) {
            sum = secondNumber.top() + carry;
            answer.push(sum);
            secondNumber.pop();

        } else if (secondNumber.top() == -1) {
            sum = firstNumber.top() + carry;
            answer.push(sum);
            firstNumber.pop();

        } else {
            sum = firstNumber.top() + secondNumber.top() + carry;
            firstNumber.pop();
            secondNumber.pop();

            if (sum > 9) {
                carry = 1;
                sum -= 10;
            }

            answer.push(sum);
        }
    }

    return answer;
}

void print(Stack stack) {
    while (stack.top() != -1) {
        cout << stack.top();
        stack.pop();
    }
}

void addingBigNumbers() {
    Stack firstNumber;
    Stack secondNumber;
    Stack answer;
    cout << "Podaj pierwsza liczbe: " << endl;
    firstNumber = receivingData(firstNumber);
    cout << "Podaj druga liczbe: " << endl;
    secondNumber = receivingData(secondNumber);
    answer = addition(firstNumber, secondNumber);
    cout << "Wynik dodawania: " << endl;
    print(answer);
}


int main() {

    addingBigNumbers();

    return 0;
}
