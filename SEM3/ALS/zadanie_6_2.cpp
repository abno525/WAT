#include <fstream>
#include <iostream>

using namespace std;

class Node {
public:
    int data;
    Node* left;
    Node* right;

    Node(int d) {
        data = d;
        left = NULL;
        right = NULL;
    }

    void insert(int value) {
        if (value < data) {
            if (left == NULL) {
                left = new Node(value);
            } else {
                left->insert(value);
            }
        } else {
            if (right == NULL) {
                right = new Node(value);
            } else {
                right->insert(value);
            }
        }
    }

    Node* deleteNode(Node* root, int value) {
        if (root == NULL) {
            return root;
        }
        if (value < root->data) {
            root->left = deleteNode(root->left, value);
        } else if (value > root->data) {
            root->right = deleteNode(root->right, value);
        } else {
            if (root->left == NULL) {
                Node* temp = root->right;
                delete root;
                return temp;
            } else if (root->right == NULL) {
                Node* temp = root->left;
                delete root;
                return temp;
            }
            Node* temp = minValueNode(root->right);
            root->data = temp->data;
            root->right = deleteNode(root->right, temp->data);
        }
        return root;
    }

    Node* minValueNode(Node* node) {
        Node* current = node;
        while (current && current->left != NULL) {
            current = current->left;
        }
        return current;
    }

    bool search(int value) {
        if (value == data) {
            return true;
        } else if (value < data) {
            return left != NULL && left->search(value);
        } else {
            return right != NULL && right->search(value);
        }
    }

    void clear() {
        if (left != NULL) {
            left->clear();
            delete left;
            left = NULL;
        }
        if (right != NULL) {
            right->clear();
            delete right;
            right = NULL;
        }
    }

    void display(int level = 0) {
        if (right != NULL) {
            right->display(level + 1);
        }
        for (int i = 0; i < level; i++) {
            cout << "   ";
        }
        cout << data << "\n";
        if (left != NULL) {
            left->display(level + 1);
        }
    }

    void preorder() {
        std::cout << data << " ";
        if (left != NULL) {
            left->preorder();
        }
        if (right != NULL) {
            right->preorder();
        }
    }

    void inorder() {
        if (left != NULL) {
            left->inorder();
        }
        cout << data << " ";
        if (right != NULL) {
            right->inorder();
        }
    }

    void postorder() {
        if (left != NULL) {
            left->postorder();
        }
        if (right != NULL) {
            right->postorder();
        }
        cout << data << " ";
    }
};

void loadDataFromFile(const char* filename, Node*& root) {

    ifstream file(filename);
    if (!file) {
        cerr << "Unable to open file " << filename << "\n";
        return;
    }

    int value;
    if (file >> value) {
        root = new Node(value);
        while (file >> value) {
            root->insert(value);
        }
    }
    file.close();
}

int main() {
    Node* root = NULL;
    loadDataFromFile("/home/plato/CLionProjects/als6/input.txt", root);
    int choice, value;

    while (true) {
        cout << "\n------------------\n";
        cout << "Binary Search Tree Operations\n";
        cout << "1. Insert\n";
        cout << "2. Delete\n";
        cout << "3. Search\n";
        cout << "4. Display\n";
        cout << "5. Preorder\n";
        cout << "6. Inorder\n";
        cout << "7. Postorder\n";
        cout << "8. Clear\n";
        cout << "9. Exit\n";
        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                cout << "Enter value to be inserted: ";
                cin >> value;
                root->insert(value);
                break;
            case 2:
                cout << "Enter value to be deleted: ";
                cin >> value;
                root = root->deleteNode(root, value);
                break;
            case 3:
                cout << "Enter value to be searched: ";
                cin >> value;
                if (root->search(value)) {
                    cout << "Found\n";
                } else {
                    cout << "Not Found\n";
                }
                break;
            case 4:
                root->display();
                break;
            case 5:
                cout << "Preorder: ";
                root->preorder();
                cout << "\n";
                break;
            case 6:
                cout << "Inorder: ";
                root->inorder();
                cout << "\n";
                break;
            case 7:
                cout << "Postorder: ";
                root->postorder();
                cout << "\n";
                break;
            case 8:
                root->clear();
                break;
            case 9:
                root->clear();
                delete root;
                return 0;
            default:
                cout << "Invalid choice\n";
        }
    }
}
