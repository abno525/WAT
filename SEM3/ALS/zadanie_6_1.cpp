#include <fstream>
#include <iostream>

using namespace std;

void swap(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

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

    void insert(Node*& root, int value) {
        if (root == NULL) {
            root = new Node(value);
        } else if (root->left == NULL) {
            root->left = new Node(value);
            if (root->left->data > root->data) {
                swap(root->left->data, root->data);
            }
        } else if (root->right == NULL) {
            root->right = new Node(value);
            if (root->right->data > root->data) {
                swap(root->right->data, root->data);
            }
        } else {
            if (root->left->data < root->right->data) {
                insert(root->left, value);
            } else {
                insert(root->right, value);
            }
        }
        if (root->left != NULL && root->left->data > root->data) {
            swap(root->left->data, root->data);
        }
        if (root->right != NULL && root->right->data > root->data) {
            swap(root->right->data, root->data);
        }
    }

    void deleteNode(Node*& root) {
        if (root == NULL) {
            return;
        }
        if (root->left == NULL && root->right == NULL) {
            delete root;
            root = NULL;
        } else if (root->left != NULL && root->right == NULL) {
            swap(root->data, root->left->data);
            deleteNode(root->left);
        } else if (root->left == NULL && root->right != NULL) {
            swap(root->data, root->right->data);
            deleteNode(root->right);
        } else {
            if (root->left->data > root->right->data) {
                swap(root->data, root->left->data);
                deleteNode(root->left);
            } else {
                swap(root->data, root->right->data);
                deleteNode(root->right);
            }
        }
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
            root->insert(root, value);
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
        cout << "Binary Heap Operations\n";
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
                root->insert(root, value);
                break;
            case 2:
                root->deleteNode(root);
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
