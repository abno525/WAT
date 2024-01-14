#include <iostream>
#include <string>

using namespace std;

struct Node {
    int value;
    Node* prev;

    Node(int value, Node* prev) : value(value), prev(prev) {}
};

class Stack {
private:
    Node *head;
public:

    Stack() : head(NULL) {}

    void push(int value) {
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

void solveHanoi(int n, Stack &source, Stack &destination, Stack &auxiliary, char sourceStackName, char destinationStackName, char auxiliaryStackName) {
    if (n == 1) {
        cout << "Move disk from " << sourceStackName << " to " << destinationStackName << endl;
        destination.push(source.top());
        source.pop();
    } else {
        solveHanoi(n - 1, source, auxiliary, destination, sourceStackName, auxiliaryStackName, destinationStackName);
        cout << "Move disk from " << sourceStackName << " to " << destinationStackName << endl;
        destination.push(source.top());
        source.pop();
        solveHanoi(n - 1, auxiliary, destination, source, auxiliaryStackName, destinationStackName, sourceStackName);
    }
}

int main() {

    Stack source, destination, auxiliary;
    int n;
    cin >> n;
    for (int i = n; i > 0; i--) {
        source.push(i);
    }

    solveHanoi(n, source, destination, auxiliary, 'A', 'B', 'C');

    return 0;
}
