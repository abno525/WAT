#include <iostream>
#include <fstream>
#include <vector>

// max dictionary and buffer size is 2^16 = 65536
#define DICTIONARY_SIZE 65536
#define BUFFER_SIZE 65536

using namespace std;

ifstream::pos_type getFileSize(const char* filename) {
    ifstream in(filename, ifstream::ate | ifstream::binary);
    return in.tellg();
}

void lz77coding(const string& input, const string& output) {
    ifstream inputFile(input, ios::binary);
    ofstream outputFile(output, ios::binary);

    if (!inputFile.is_open()) {
        cerr << "Failed to open file: " << input << endl;
        exit(EXIT_FAILURE);
    }

    vector<char> fileData((istreambuf_iterator<char>(inputFile)), istreambuf_iterator<char>());
    long fileSize = fileData.size();
    int k = 0;

    while (k < fileSize) {
        int distance = 0;
        int length = 0;
        char nextChar = k + length < fileSize ? fileData[k + length] : 0;

        for (int i = 1; i <= min(k, DICTIONARY_SIZE); i++) {
            int matchLength = 0;
            int dictPos = k - i;
            int bufferPos = k;

            while (matchLength < BUFFER_SIZE && bufferPos < fileSize) {
                if (fileData[dictPos + matchLength] != fileData[bufferPos + matchLength]) {
                    break;
                }
                matchLength++;
            }

            if (matchLength > length) {
                length = matchLength;
                distance = i;
                nextChar = bufferPos + matchLength < fileSize ? fileData[bufferPos + matchLength] : 0;
            }
        }

        auto distance16 = static_cast<uint16_t>(distance);
        auto length16 = static_cast<uint16_t>(length);

        outputFile.write((char *)&distance16, sizeof(distance16));
        outputFile.write((char *)&length16, sizeof(length16));
        outputFile.write(&nextChar, sizeof(nextChar));

        k += length + 1;
    }

    outputFile.flush();
    inputFile.close();
    outputFile.close();
}

void lz77decoding(const string& input, const string& output) {
    ifstream inputFile(input, ios::binary);
    ofstream outputFile(output, ios::binary);

    if (!inputFile.is_open()) {
        cerr << "Failed to open file: " << input << endl;
        exit(EXIT_FAILURE);
    }

    vector<char> text;
    uint16_t distance, length;
    char nextChar;

    while (inputFile.read((char *)&distance, sizeof(distance)) &&
           inputFile.read((char *)&length, sizeof(length)) &&
           inputFile.read(&nextChar, sizeof(nextChar))) {

        if (distance == 0 && length == 0) {
            text.push_back(nextChar);
        } else {
            int start = text.size() - distance;
            for (int i = 0; i < length; ++i) {
                if (start + i >= text.size()) {
                    text.push_back(0);
                } else {
                    text.push_back(text[start + i]);
                }
            }
            text.push_back(nextChar);
        }
    }

    outputFile.write(text.data(), text.size());

    outputFile.flush();
    inputFile.close();
    outputFile.close();
}

int main() {

    string input    =   "input.txt";
    string encoded  =   "encoded.bin";
    string decoded  =   "decodedRandom.png";

    lz77coding(input, encoded);
    lz77decoding(encoded, decoded);

    return 0;
}
