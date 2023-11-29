#include <iostream>
#include <string>
#include <fstream>
#include <sstream>

using namespace std;

constexpr int dictionarySize = 1000;
constexpr int bufferSize = 200;
constexpr int codedDictionarySize = 190000;

void printState(const string& dictionary, const string& buffer, const int& loops) {
    cout << " /// STATE " << loops << " ///" << endl;
    cout << "Dictionary: " << dictionary << endl;
    cout << "Buffer: " << buffer << endl;
}
void printCode(const int& index, const int& length, char nextLetter) {
    cout << "<" << index << ", " << length << ", " << nextLetter << ">" << endl;
}
void printCodedDictionary(const string* codedDictionary) {
    for (int i = 0; i < codedDictionarySize; i++) {

        if (codedDictionary[i] == "\n") {
            cout << "\n";
            continue;
        }

        if (codedDictionary[i].empty()) {
            continue;
        }

        cout << codedDictionary[i] << endl;

    }
}

string readFileIntoString(const string& filename) {
    ifstream file(filename);
    stringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}
void writeStringToFile(const string& filename, const string& str){

    ofstream outputFile;
    outputFile.open(filename);

    if(outputFile.is_open()){
        outputFile << str;
        outputFile.close();
    } else {
        cout << "Unable to open file";
    }
}

void saveToCodedFile(const string& filename, const string* codedDictionary) {
    ofstream file;
    file.open(filename);
    for (int i = 0; i < codedDictionarySize; i++) {
        if (!codedDictionary[i].empty()) {
            file << codedDictionary[i] << endl;
        } else {
            break;
        }
    }
    file.close();
}
void readFromCodedFile(const string& filename, string* codedDictionary) {
    ifstream file;
    file.open(filename);
    string line;
    int i = 0;
    while (getline(file, line)) {
        codedDictionary[i] = line;
        i++;
    }
    file.close();
}

string dictionaryCoding(string* codedDictionary, const string& input) {

    if (input.empty()) return "";

    int currentMatching, matchingSize, matchingIndex, loops = 0;
    string modString, dictionary, buffer;

    //printCode (0, 0, input[0]);

    codedDictionary[0] =    to_string(0) + "|" +
                                to_string(0) + "|" +
                                input[0];

    for (int i = 0; i < dictionarySize; i++) {
        modString += input[0];
    }

    modString += input;

    for (int i = 1; i + dictionarySize + 1 < modString.size(); i += (matchingSize + 1)) {

        matchingSize = 0;
        matchingIndex = 0;

        dictionary = modString.substr(i, dictionarySize);
        buffer = modString.substr(i + dictionarySize, bufferSize);

        for (int j = 0; j < dictionary.size(); j++) {

            // sprawdza długość dopasowania
            currentMatching = 0;
            while   (dictionary[j + currentMatching] == buffer[currentMatching] &&
                    dictionary[j + currentMatching] != '\0' &&
                    buffer[currentMatching] != '\0') {
                currentMatching++;
            }

            // sprawdza, czy długość dopasowania jest większa od poprzedniej
            if (matchingSize < currentMatching) {
                matchingSize = currentMatching;
                matchingIndex = j;
            }
        }

        loops += 1;
        //printState(dictionary, buffer, loops);
        //printCode(matchingIndex, matchingSize, modString[i + dictionarySize + matchingSize]);
        codedDictionary[loops] =    to_string(matchingIndex) + "|" +
                                        to_string(matchingSize) + "|" +
                                        modString[i + dictionarySize + matchingSize];

    }

    return modString;
}
string dictionaryDecoding(const string* codedDictionary) {

    int index, length;
    char nextLetter;
    string modString;

    nextLetter = codedDictionary[0].substr(codedDictionary[0].find_last_of('|') + 1, 1)[0];

    for (int i = 0; i < dictionarySize; i++) {
        modString += nextLetter;
    }

    for (int i = 0; i < codedDictionarySize; i++) {

        if (codedDictionary[i].empty()) {
            continue;
        }

        index = stoi(codedDictionary[i].substr(0, codedDictionary[i].find('|')));
        length = stoi(codedDictionary[i].substr(codedDictionary[i].find('|') + 1,
                                                codedDictionary[i].find_last_of('|') - codedDictionary[i].find('|') - 1));
        nextLetter = codedDictionary[i].substr(codedDictionary[i].find_last_of('|') + 1, 1)[0];
        modString += modString.substr(modString.size() - dictionarySize + index, length) + nextLetter;
    }

    // zamiana znaków '\0' na '\n'
    size_t pos = 0;
    while ((pos = modString.find('\0', pos)) != string::npos) {
        modString.replace(pos, 1, "\n");
        pos += 1;
    }

    return modString.substr(dictionarySize, modString.size() - dictionarySize);
}

void testRun() {
    string codedDictionary[codedDictionarySize];
    string input = readFileIntoString("test.txt");
    string output;

    cout << "Input: " << input << endl;
    dictionaryCoding(codedDictionary, input);

    cout << endl << "Coded dictionary: " << endl;
    //printCodedDictionary(codedDictionary);

    saveToCodedFile("output.txt",codedDictionary);

    cout << endl << "Coded dictionary from file: " << endl;
    string codedDictionaryFromFile[codedDictionarySize];
    readFromCodedFile("output.txt", codedDictionaryFromFile);
    //printCodedDictionary(codedDictionaryFromFile);

    cout << endl << "Decoded dictionary: " << endl;
    output = dictionaryDecoding(codedDictionaryFromFile);
    cout << output << endl;

    writeStringToFile("decoded.txt", output);
}

void codeFile(const string& filename1, const string& filename2) {
    string codedDictionary[codedDictionarySize];
    string input = readFileIntoString(filename1);
    string output = dictionaryCoding(codedDictionary, input);
    saveToCodedFile(filename2, codedDictionary);
}

void decodeFile(const string& filename1, const string& filename2) {
    string codedDictionary[codedDictionarySize];
    readFromCodedFile(filename1, codedDictionary);
    string output = dictionaryDecoding(codedDictionary);
    writeStringToFile(filename2, output);
}

int main() {

    //testRun();
    codeFile("test.txt", "output.txt");
    decodeFile("output.txt", "decoded.txt");

    return 0;
}
