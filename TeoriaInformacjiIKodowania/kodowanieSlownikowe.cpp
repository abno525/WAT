#include <iostream>

using namespace std;

#define DICTIONARY_SIZE 10
#define BUFFER_SIZE 6

void printState(const string& dictionary, const string& buffer, const int& loops) {
    cout << " /// STATE " << loops << " ///" << endl;
    cout << "Dictionary: " << dictionary << endl;
    cout << "Buffer: " << buffer << endl;
}

void printCode(const int& index, const int& length, char nextLetter) {
    cout << "<" << index << ", " << length << ", " << nextLetter << ">" << endl;
}


void dictionaryCoding(const string& input) {

    int index, loops = 0, move = 0;
    string dictionary, buffer;

    for (int i = 0; i + DICTIONARY_SIZE + 1 < input.size(); i += move) {
        move = 1;
        dictionary = input.substr(i, DICTIONARY_SIZE);
        buffer = input.substr(i + DICTIONARY_SIZE, BUFFER_SIZE);
        for (int j = 0; j < dictionary.size(); j++) {
            if (dictionary[j] == buffer[0]) {
                index = j;
                for (int k = 0; k < buffer.size(); k++) {
                    if (dictionary[j + k] == buffer[k]) {
                        move++;
                    } else {
                        break;
                    }
                }
                break;
            }
        }

        loops += 1;
        printState(dictionary, buffer, loops);
        printCode(index + 1, move - 1, input[i + DICTIONARY_SIZE + move - 1]);

    }
}

int main() {

    string input = "ABAABCBAABACBAAEAAAABAAABABABABABBABABBABABABBBABABABABABBCBCBCBCABBABCBCBABCABCABCBACBACBABCABCABCBZACBACBACBA";
    cout << "Input: " << input << endl;
    int x = input.size();
    dictionaryCoding(input);

    return 0;
}
