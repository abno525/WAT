#include <iostream>
#include <fstream>
#include <sstream>
#include <cstring>

using namespace std;

string readFileIntoString(const string& filePath) {
    ifstream fileStream(filePath, ios::binary);
    stringstream stringStream;
    stringStream << fileStream.rdbuf();
    return stringStream.str();
}

void appendToFile(const string& filePath, uint32_t data) {
    ofstream fileStream(filePath, ios::binary | ios::app);
    fileStream.write(reinterpret_cast<const char *>(&data), sizeof(data));
    fileStream.close();
}

uint32_t crc32(const char* s, size_t length) {
    uint32_t crc = 0xFFFFFFFF;
    while (length--)
    {
        uint8_t byte = *s++;
        crc = crc ^ byte;
        for (uint8_t j = 8; j > 0; --j)
        {
            crc = (crc >> 1) ^ (0xEDB88320 & (-(crc & 1)));
        }
    }
    return ~crc;
}

bool checkCRC(const string& filePath) {
    string fileContent = readFileIntoString(filePath);

    size_t fileSize = fileContent.size();

    if (fileSize < sizeof(uint32_t)) {
        cerr << "File size is too small: " << filePath << endl;
        return false;
    }

    string contentExceptCRC = fileContent.substr(0, fileSize - sizeof(uint32_t));
    uint32_t calculatedCRC = crc32(contentExceptCRC.c_str(), contentExceptCRC.size());

    uint32_t fileCRC;
    memcpy(&fileCRC, &fileContent[fileSize - sizeof(uint32_t)], sizeof(fileCRC));

    return calculatedCRC == fileCRC;
}

int main() {

    string input = readFileIntoString("input.txt");
    uint32_t crc = crc32(input.c_str(), input.length());
    cout << "CRC32: " << hex << crc << endl;
    appendToFile("input.txt", crc);

    bool check = checkCRC("input.txt");
    cout << "Check CRC: " << check << endl;
    return 0;
}
