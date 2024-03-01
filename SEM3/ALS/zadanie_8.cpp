#include <iostream>

using namespace std;

class BTree {
private:
    struct Node {
        int NumbersOfKeys;
        int order;
        int position;
        int* keys;
        Node** childs;

        Node(int order) : NumbersOfKeys(0), order(order), position(-1), keys(new int[order]), childs(new Node*[order]) {}

        int Insert(int value) {
            if (childs[0] == NULL) {
                keys[++position] = value;
                NumbersOfKeys++;
                for (int i = position; i > 0 && keys[i] < keys[i - 1]; i--) {
                    swap(keys[i], keys[i - 1]);
                }
            } else {
                int i = 0;
                while (i < NumbersOfKeys > 0 && value > keys[i]) {
                    i++;
                }
                int check = childs[i]->Insert(value);
                if (check) {
                    int mid;
                    int TEMP = i;
                    Node* newNode = Split(childs[i], &mid);
                    i = InsertInParent(mid, TEMP, i);
                    childs[i] = newNode;
                }
            }
            return (NumbersOfKeys == order) ? 1 : 0;
        }

        Node* Split(Node* node, int* med) {
            int midValue = node->NumbersOfKeys / 2;
            *med = node->keys[midValue];
            Node* newNode = new Node(order);
            int i;
            for (i = midValue + 1; i < node->NumbersOfKeys; ++i) {
                newNode->keys[++newNode->position] = node->keys[i];
                newNode->childs[newNode->position] = node->childs[i];
                ++newNode->NumbersOfKeys;
                --node->position;
                --node->NumbersOfKeys;
                node->childs[i] = NULL;
            }
            newNode->childs[newNode->position + 1] = node->childs[i];
            node->childs[i] = NULL;
            --node->NumbersOfKeys;
            --node->position;
            return newNode;
        }

        int InsertInParent(int mid, int TEMP, int i) {
            for (; i < NumbersOfKeys > 0 && mid > keys[i];) {
                i++;
            }
            for (int j = NumbersOfKeys; j > i; j--) {
                keys[j] = keys[j - 1];
            }
            keys[i] = mid;
            NumbersOfKeys++;
            --position; // Move position to the correct index after insertion
            return i;
        }

        void Print() const {
            int height = getHeight();
            for (int i = 1; i <= height; ++i) {
                if (i == 1) PrintUtil(i, true);
                else PrintUtil(i, false);
                cout << endl;
            }
            cout << endl;
        }

        void PrintUtil(int height, bool checkRoot) const {
            if (height == 1 || checkRoot) {
                for (int i = 0; i < NumbersOfKeys; i++) {
                    if (i == 0) cout << "|";
                    cout << keys[i];
                    if (i != NumbersOfKeys - 1) cout << "|";
                    if (i == NumbersOfKeys - 1) cout << "|" << " ";
                }
            } else {
                for (int i = 0; i <= NumbersOfKeys; i++) {
                    if (childs[i] != NULL) {
                        childs[i]->PrintUtil(height - 1, false);
                        if (i < NumbersOfKeys) cout << "|";
                    }
                }
            }
        }

        int getHeight() const {
            int COUNT = 1;
            Node* Current = const_cast<Node*>(this);
            while (Current->childs[0] != NULL) {
                Current = Current->childs[0];
                COUNT++;
            }
            return COUNT;
        }

        ~Node() {
            delete[] keys;
            for (int i = 0; i <= NumbersOfKeys; ++i)
                delete childs[i];
        }
    };

    Node* Root;
    int order;
    int count;

public:
    BTree(int order) : Root(NULL), order(order), count(0) {}

    void Insert(int value) {
        count++;
        if (Root == NULL) {
            Root = new Node(order);
            Root->keys[++Root->position] = value;
            Root->NumbersOfKeys = 1;
        } else {
            int check = Root->Insert(value);
            if (check) {
                int mid;
                Node* splittedNode = Root->Split(Root, &mid);
                int i = Root->InsertInParent(mid, 0, 0);
                Root->childs[i] = splittedNode;
            }
        }
    }

    void Print() const {
        if (Root != NULL)
            Root->Print();
        else cout << "The B-Tree is Empty" << endl;
    }

    ~BTree() {
        delete Root;
    }

    void Menu() {
        int choice;
        int value;
        do {
            cout << "\nB-Tree Menu\n";
            cout << "1. Insert\n";
            cout << "2. Print\n";
            cout << "0. Exit\n";
            cout << "Enter your choice: ";
            cin >> choice;

            switch (choice) {
                case 1:
                    cout << "Enter value to insert: ";
                    cin >> value;
                    Insert(value);
                    break;
                case 2:
                    cout << "B-Tree:\n";
                    Print();
                    break;
                case 0:
                    cout << "Exiting...\n";
                    break;
                default:
                    cout << "Invalid choice. Please try again.\n";
            }
        } while (choice != 0);
    }
};

int main() {
    BTree t1(5);

    t1.Menu();

    return 0;
}
