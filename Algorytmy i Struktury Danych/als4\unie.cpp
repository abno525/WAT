/*
 * Stosy i Kolejki
 * Zadanie 1
 * Implementacja RPN. Używając unii, bo tak
 */

#include <iostream>
#include <string>
#include <new>

using namespace std;

enum VALUE_TYPE {string_type, float_type};
union Value {
    string   stringVal;
    float    floatVal{};

    Value() {
        new(&stringVal) string;
    }

    // This is necessary because std::string has dynamic memory allocation,
    // and its destructor needs to be called explicitly.
    ~Value() {
        stringVal.~string();
    }
};

struct NodeValue {

    Value val;
    VALUE_TYPE val_type;

    NodeValue() {
        val_type = float_type;
        val.floatVal = -1;
    }

    NodeValue(NodeValue const &value) {
        val_type = value.val_type;
        switch (val_type) {
            case float_type:
                val.floatVal = value.val.floatVal;
                break;
            case string_type:
                new(&val.stringVal) string(value.val.stringVal);
                break;
        }
    }
};

struct Node {

    NodeValue value;
    Node* prev;

    Node(const NodeValue& value, Node* prev) : value(value), prev(prev) {}
};

class Stack {
private:
    Node* head;
public:
        Stack() : head(nullptr) {}

        void push(const NodeValue& value) {
            Node* new_node = new Node(value, head);
            head = new_node;
        }

        void pop() {
            if (!head) return;
            Node* temp = head;
            head = head->prev;
            delete temp;
        }

        NodeValue top() {
            if (!head) return {};
            return head->value;
        }
};

Stack receivingData(Stack stack) {

    NodeValue tempVal;
    string tempString;
    char arr[100];
    cin.getline(arr, 100);
    char separator = ' ';
    int i = 0;

    while (arr[i] != '\0') {
        if (arr[i] != separator) {
            tempString += arr[i];
        } else {
            if (tempString == "+" || tempString == "-" || tempString == "*" || tempString == "/") {
                tempVal.val_type = string_type;
                tempVal.val.stringVal = tempString;
                stack.push(tempVal);
            } else {
                tempVal.val_type = float_type;
                tempVal.val.floatVal = stof(tempString);
                stack.push(tempVal);
            }
            tempString = "";
        }
        i++;
    }
    tempVal.val_type = float_type;
    tempVal.val.floatVal = stof(tempString);
    stack.push(tempVal);

    return stack;
}

Stack interpretingData(Stack stack) {

    float a, b;
    string temp;
    NodeValue tempVal;
    tempVal.val_type = float_type;

    if (stack.top().val_type == 0) {
        temp = stack.top().val.stringVal;
        stack.pop();

        if (stack.top().val_type == 0) {
            stack = interpretingData(stack);
            a = stack.top().val.floatVal;
            stack.pop();
        } else {
            a = stack.top().val.floatVal;
            stack.pop();
        }

        if (stack.top().val_type == 0) {
            stack = interpretingData(stack);
            b = stack.top().val.floatVal;
            stack.pop();
        } else {
            b = stack.top().val.floatVal;
            stack.pop();
        }

        if (temp == "+") {
            tempVal.val.floatVal = b + a;
        } else if (temp == "-") {
            tempVal.val.floatVal = b - a;
        } else if (temp == "*") {
            tempVal.val.floatVal = b * a;
        } else if (temp == "/") {
            tempVal.val.floatVal = b / a;
        }

    } else {
        return stack;
    }

    return stack;
}

int main() {

    Stack stack;
    cout << "Podaj równanie do obliczenia w postaci odwróconej notacji polskiej: " << endl;
    stack = receivingData(stack);
    stack = interpretingData(stack);
    cout << stack.top().val.floatVal;

    return 0;
}
