#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>

#define READ		0
#define WRITE		1
#define N			100
char string[N];

void czysc()
{
    int i;
    for(i = 0; i < N; i++)
    {
        string[i] = 0;
    }
}

int main(void){

    /* tablica przechowujaca uchwyty na pliki odczytu i zapisu */
    int pdes[2];
    /* tworzymy pipe skladajaca sie z uchwytu do plikow do odczytu
    * i do zapisu (R i W); deskryptory zostana umieszczone w tablicy */
    pipe(pdes);
    /* rozdwajamy proces */
    if(fork())
    {
        /* zamykamy niepotrzebny deskryptor */
        close(pdes[READ]);

            sleep(1);

            int max = 0;
            char content[200];

            FILE *input = fopen("/etc/pajvj", "r");

            if (input == NULL ) {

                fprintf(stderr, "Error opening file!\n");

                // string[] = "dsfsdfs";
                //char error[] = "ERROR!";

                // strcpy(string, "ERROR!");


                write(pdes[WRITE], string, strlen(string));

                return 1;
            }

            fgets(content, 200, input);
            while (max < 10) {
                max++;

                fgets(content, 200, input);
                strcat(string, content);
            }

            write(pdes[WRITE], string, strlen(string));

            fclose(input);

    }else
    {
        close(pdes[WRITE]);
        while(1)
        {
            read(pdes[READ], string, sizeof(string));
            printf("%s", string);
            czysc();
        }
    }
    return 0;
}

