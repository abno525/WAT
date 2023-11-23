#include <iostream>

using namespace std;

/*
 * Labolatorium 3
 * Arkadiusz Ostrzyżek
 * WCY22KY2S1
 *
 * 1. Sito Eratostenesa
 * 2. Sito Atkina-Bernsteina
 */

struct Node {
    int value;
    Node* next;
};

// This function implements the sieve of Eratosthenes using one directional linked list with pointers
void sitoEratostenesa(int limit) {
    // Create a new node for each number from 2 to limit
    Node* head = new Node;
    head->value = 2;
    head->next = NULL;
    Node* current = head;
    for (int i = 3; i <= limit; i++) {
        Node* newNode = new Node;
        newNode->value = i;
        newNode->next = NULL;
        current->next = newNode;
        current = newNode;
    }

    // Iterate through the list and remove all multiples of the current number
    current = head;
    while (current != NULL) {
        Node* next = current->next;
        Node* prev = current;
        while (next != NULL) {
            if (next->value % current->value == 0) {
                prev->next = next->next;
                delete next;
                next = prev->next;
            } else {
                prev = next;
                next = next->next;
            }
        }
        current = current->next;
    }

    // Print the remaining numbers
    current = head;
    while (current != NULL) {
        std::cout << current->value << " ";
        current = current->next;
    }

    // Delete the list
    current = head;
    while (current != NULL) {
        Node* next = current->next;
        delete current;
        current = next;
    }
}


// This function implements the sieve of Atkins using one directional linked list with pointers
void sitoAtkina(int limit) {
    // Create a new node for each number from 2 to limit
    Node* head = new Node;
    head->value = 2;
    head->next = NULL;
    Node* current = head;
    for (int i = 3; i <= limit; i++) {
        Node* newNode = new Node;
        newNode->value = i;
        newNode->next = NULL;
        current->next = newNode;
        current = newNode;
    }

    // Iterate through the list and remove all multiples of the current number
    current = head;
    while (current != NULL) {
        Node* next = current->next;
        Node* prev = current;
        while (next != NULL) {
            if (next->value % current->value == 0) {
                prev->next = next->next;
                delete next;
                next = prev->next;
            } else {
                prev = next;
                next = next->next;
            }
        }
        current = current->next;
    }

    // Print the remaining numbers
    current = head;
    while (current != NULL) {
        std::cout << current->value << " ";
        current = current->next;
    }

    // Delete the list
    current = head;
    while (current != NULL) {
        Node* next = current->next;
        delete current;
        current = next;
    }
}

int main() {

    //present that the functions are working
    std::cout << "Sieve of Eratosthenes: " << std::endl;
    sitoEratostenesa(100);
    std::cout << std::endl;
    std::cout << "Sieve of Atkin: " << std::endl;
    sitoAtkina(100);
    std::cout << std::endl;

    return 0;
}
