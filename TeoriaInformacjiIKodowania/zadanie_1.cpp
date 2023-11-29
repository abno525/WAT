#include <iostream>
#include <boost/algorithm/string.hpp>
#include <string>

using namespace std;

#define DICTIONARY_SIZE 8
#define BUFFER_SIZE 4

void printState(const string& dictionary, const string& buffer, const int& loops) {
    cout << " /// STATE " << loops << " ///" << endl;
    cout << "Dictionary: " << dictionary << endl;
    cout << "Buffer: " << buffer << endl;
}

void printCode(const int& index, const int& length, char nextLetter) {
    cout << "<" << index << ", " << length << ", " << nextLetter << ">" << endl;
}

void dictionaryCoding(const string& input) {

    int currentMatching = 0, matchingSize, matchingIndex, loops = 0;
    string dictionary, buffer;

    for (int i = 0; i + DICTIONARY_SIZE + 1 < input.size(); i += (matchingSize + 1)) {

        matchingSize = 0;
        matchingIndex = 0;

        dictionary = input.substr(i, DICTIONARY_SIZE);
        buffer = input.substr(i + DICTIONARY_SIZE, BUFFER_SIZE);

        for (int j = 0; j < dictionary.size(); j++) {

            // sprawdza długoś dopasowania
            currentMatching = 0;
            while (dictionary[j + currentMatching] == buffer[currentMatching]) {
                currentMatching++;
            }

            // sprawdza czy długość dopasowania jest większa od poprzedniej
            if (matchingSize < currentMatching) {
                matchingSize = currentMatching;
                matchingIndex = j;
            }
        }

        loops += 1;
        printState(dictionary, buffer, loops);
        printCode(matchingIndex + 1, matchingSize, input[i + DICTIONARY_SIZE + matchingSize]);

    }
}

int main() {

    string input = "ABCABABCABAAABABABACACBACB";
    cout << "Input: " << input << endl;
    dictionaryCoding(input);

    return 0;
}
