#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
#include <dirent.h>

void printDirectoryInfo(const char *path) {

    struct stat dir_stat;
    if (stat(path, &dir_stat) == -1) {
        fprintf(stderr, "Nie istnieje\n", path);
        exit(EXIT_FAILURE);
    }

    if (!S_ISDIR(dir_stat.st_mode)) {
        fprintf(stderr, "%s Nie jest folderem.\n", path);
        exit(EXIT_FAILURE);
    }

    DIR *dir = opendir(path);
    int fileCount = 0;

    struct dirent *entry;
    while ((entry = readdir(dir)) != NULL) {
        if (entry->d_type == DT_REG) {
            fileCount++;
        }
    }

    printf("1) Ilosc plikow: %d\n", fileCount);
    printf("2) Prawa do folderu: %o\n", dir_stat.st_mode & (S_IRWXU | S_IRWXG | S_IRWXO));
    printf("3) Folder istnieje\n");

    closedir(dir);
}

int main(int argc, char *argv[]) {

    if (argc != 2) {
        fprintf(stderr, "Nie podano danych>\n", argv[0]);
        exit(EXIT_FAILURE);
    }

    const char *directoryPath = argv[1];
    printDirectoryInfo(directoryPath);

    return 0;
}
