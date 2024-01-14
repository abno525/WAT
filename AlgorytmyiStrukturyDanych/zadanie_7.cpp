#include<iostream>

using namespace std;

struct node {
    int data;
    node *parent;
    char color;
    node *left;
    node *right;
};

class RBtree {
    node *root;

public :
    void insert() {
        int data;
        cout<<"\nEnter value of the node: ";
        cin >> data;
        node *newNode = new node;
        newNode->data = data;
        node *parent;

        if(root==nullptr) {
            newNode->parent = nullptr;
            newNode->color = 'b';
            root = newNode;
        } else {
            node *ptr;
            ptr = root;
            while(ptr!=nullptr) {
                parent = ptr;
                if(data > ptr->data) {
                    ptr = ptr->right;
                } else {
                    ptr = ptr->left;
                }
            }
            newNode->parent = parent;
            newNode->color = 'r';
            if(data < parent->data) {
                parent->left = newNode;
            } else {
                parent->right = newNode;
            }
            treeFix(newNode);
        }
    }

    void treeFix(node *newNode) {

        node *parent;
        node *grandparent;
        node *uncle;
        node *ptr = newNode;

        while (ptr->parent->color == 'r') {
            parent = ptr->parent;
            grandparent = parent->parent;
            if (parent == grandparent->left) {
                uncle = grandparent->right;
                if (uncle->color == 'r') {
                    grandparent->color = 'r';
                    parent->color = 'b';
                    uncle->color = 'b';
                    ptr = grandparent;
                } else {
                    if (ptr == parent->right) {
                        rotate(false, parent);
                        ptr = parent;
                        parent = ptr->parent;
                    }
                    rotate(true, grandparent);
                    swap(parent->color, grandparent->color);
                    ptr = parent;
                }
            } else {
                uncle = grandparent->left;
                if (uncle->color == 'r') {
                    grandparent->color = 'r';
                    parent->color = 'b';
                    uncle->color = 'b';
                    ptr = grandparent;
                } else {
                    if (ptr == parent->left) {
                        rotate(true, parent);
                        ptr = parent;
                        parent = ptr->parent;
                    }
                    rotate(false, grandparent);
                    swap(parent->color, grandparent->color);
                    ptr = parent;
                }
            }
        }
    }

    void rotate(bool direction, node *newNode) {

        node *parent = newNode->parent;
        node *grandparent = parent->parent;
        if (direction) {
            parent->right = newNode->left;
            newNode->left->parent = parent;
            newNode->left = parent;
        } else {
            parent->left = newNode->right;
            newNode->right->parent = parent;
            newNode->right = parent;
        }
        parent->parent = newNode;
        newNode->parent = grandparent;
        if (grandparent == nullptr) {
            root = newNode;
        } else {
            if (grandparent->left == parent) {
                grandparent->left = newNode;
            } else {
                grandparent->right = newNode;
            }
        }
    }
    

    void inOrderDisplay() {
        inOrder(root);
    }

    void preOrderDisplay() {
        preOrder(root);
    }

    void postOrderDisplay() {
        postOrder(root);
    }

    void inOrder(node *ptr) {

        if(ptr!=nullptr) {
            inOrder(ptr->left);
            cout << " " << ptr->data << " ";
            inOrder(ptr->right);
        }
    }

    void preOrder(node *ptr) {

        if(ptr!=nullptr) {
            cout << " " << ptr->data << " ";
            preOrder(ptr->left);
            preOrder(ptr->right);
        }
    }

    void postOrder(node *ptr) {

        if(ptr!=nullptr) {
            postOrder(ptr->left);
            postOrder(ptr->right);
            cout << " " << ptr->data << " ";
        }
    }
};

void menu() {
    cout<<"\n1. Insert Element"<<endl;
    cout<<"2. Display Tree"<<endl;
    cout<<"3. Exit"<<endl;
    cout<<"Enter your choice: ";
}

int main() {

    RBtree tree{};
    int choice;
    menu();
    cin >> choice;
    while(choice!=3) {
        switch(choice) {
            case 1:
                tree.insert();
                break;
            case 2:
                cout << "\nInorder Traversal of Tree: " << endl;
                tree.inOrderDisplay();
                cout << "\nPreorder Traversal of Tree: " << endl;
                tree.preOrderDisplay();
                cout << "\nPostorder Traversal of Tree: " << endl;
                tree.postOrderDisplay();
                break;
            default:
                cout << "\nWrong Choice" << endl;
                break;
        }
        menu();
        cin >> choice;
    }

    return 0;
}
