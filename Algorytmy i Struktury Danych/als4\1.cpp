/*
 * Stosy i Kolejki
 * Zadanie 1
 * Konwersja wyrażeń arytmetycznych z postaci infiksowej
 * do postaci postfiksowej przy wykorzystaniu stosu
 * w postaci wskaźnikowej.
 *
 * dane wejsciowe
 * z klawiatury
 *
 * dane wyjsciowe
 * na ekranie
 *
 * Zadanie 2
 * Dodawanie dużych liczb przy wykorzystaniu stosu
 * w postaci wskaźnikowej.
 *
 * dane wejsciowe
 * z klawiatury
 *
 * dane wyjsciowe
 * na ekranie
 */

#include <iostream>
#include <string>
#include <cstdlib>
#include <sstream>

using namespace std;

template <typename T>
string numberToString ( T Number ) {
    std::ostringstream ss;
    ss << Number;
    return ss.str();
}

int length(const string str){
    int i = 0;
    for(; str[i] != 0; i++);
    return i;
}

int stringToNumber(string s)
{
    int num = 0;

    int n = length(s);

    for (int i = 0; i < n; i++)
        num = num * 10 + (int(s[i]) - 48);

    return num;
}

float stringToFloat(const std::string& str) {
    float result = 0.0f;
    int sign = 1;
    size_t i = 0;

    if (str[0] == '-') {
        sign = -1;
        ++i;
    } else if (str[0] == '+') {
        ++i;
    }

    for (; i < str.length() && (str[i] >= '0' && str[i] <= '9'); ++i) {
        result = result * 10.0f + (str[i] - '0');
    }

    if (i < str.length() && str[i] == '.') {
        float multiplier = 0.1f;

        for (++i; i < str.length() && (str[i] >= '0' && str[i] <= '9'); ++i) {
            result = result + multiplier * (str[i] - '0');
            multiplier *= 0.1f;
        }
    }

    return sign * result;
}

struct Node {
    string value;
    Node* prev;

    Node(const string& value, Node* prev) : value(value), prev(prev) {}
};

class Stack {
private:
    Node *head;
public:

    Stack() : head(NULL) {}

    void push(const string& value) {
        Node* new_node = new Node(value, head);
        head = new_node;
    }

    void pop() {
        if (!head) return;
        Node* temp = head;
        head = head->prev;
        delete temp;
    }

    string top() {
        if (!head) return "";
        return head->value;
    }
};

Stack receivingData(Stack stack) {

    char arr[100];
    cin.getline(arr, 100);
    char separator = ' ';
    int i = 0;
    string temps;

    while (arr[i] != '\0') {
        if (arr[i] != separator) {
            temps += arr[i];
        } else {
            stack.push(temps);
            temps = "";
        }
        i++;
    }
    stack.push(temps);

    return stack;
}

Stack interpretingData(Stack stack) {

    float a, b;
    string temp = stack.top();
    stack.pop();

    if ( temp == "+" || temp == "-" || temp == "*" || temp == "/") {

        if (stack.top() == "+" || stack.top() == "-" || stack.top() == "/" || stack.top() == "*") {
            stack = interpretingData(stack);
            a = stringToFloat(stack.top());
            stack.pop();
        } else {
            a = stringToFloat(stack.top());
            stack.pop();
        }

        if (stack.top() == "+" || stack.top() == "-" || stack.top() == "/" || stack.top() == "*") {
            stack = interpretingData(stack);
            b = stringToFloat(stack.top());
            stack.pop();
        } else {
            b = stringToFloat(stack.top());
            stack.pop();
        }

        if (temp == "+") {
            stack.push(numberToString(b + a));
            return stack;
        } else if (temp == "-") {
            stack.push(numberToString(b - a));
            return stack;
        } else if (temp == "*") {
            stack.push(numberToString(b * a));
            return stack;
        } else if (temp == "/") {
            stack.push(numberToString(b / a));
            return stack;
        } else {
            if (stack.top().empty()) {
                stack.push(temp);
                return stack;
            } else {
                stack.push(temp);
                return stack;
            }
        }

    } else {
        return stack;
    }
}

void RPN() {
    Stack stack;
    cout << "Podaj rownanie do obliczenia w postaci odwroconej notacji polskiej: " << endl;
    stack = receivingData(stack);
    stack = interpretingData(stack);
    cout << stack.top();
}

int main() {

    RPN();

    return 0;
}
