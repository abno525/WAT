#include <stdlib.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <stdio.h>
#include <err.h>
#include <sys/stat.h>
#include <sys/sem.h>
#include <string.h>
#include <unistd.h> // for fork

union semun {
    int val;                                
    struct semid_ds *buf;                   
    unsigned short int *array;              
    struct seminfo *__buf;                  
};

int semlock(int semid) {
    struct sembuf opr;

    opr.sem_num = 0;
    opr.sem_op  = -1;        // blocking
    opr.sem_flg = SEM_UNDO;  // add SEM_UNDO

    if (semop(semid, &opr, 1) == -1) {
        warn("Error locking semaphore!");
        return 0;
    } else {
        return 1;
    }
}

int semunlock(int semid) {
    struct sembuf opr;

    opr.sem_num = 0;
    opr.sem_op  = 1;
    opr.sem_flg = SEM_UNDO;   // add SEM_UNDO

    if (semop(semid, &opr, 1) == -1) {
        warn("Error unlocking semaphore!");
        return 0;
    } else {
        return 1;
    }
}

int main(int argc, char *argv[]) {
    printf("Start program:\n");

    if (argc != 2) {
        fprintf(stderr, "Usage: %s <filename>\n", argv[0]);
        return 1;
    }

    struct stat st;
    char c;
    int shmid;
    key_t key;
    char *shm, *s;
    int semid;
    union semun ctl;

    if ((key = ftok(".", 'A')) == -1)
        errx(1, "Blad tworzenia klucza!");

    if ((shmid = shmget(key, 100, IPC_CREAT | 0666)) < 0)
        errx(2, "Blad tworzenia segmentu pamieci dzielonej!");

    if ((shm = shmat(shmid, NULL, 0)) == (char *) -1)
        errx(3, "Blad przylaczania pamieci dzielonej!");

    if ((semid = semget(key, 1, IPC_CREAT | 0600)) == -1)
        errx(4, "Blad tworzenia segmentu pamieci dzielonej!");

    ctl.val = 0;
    if (semctl(semid, 0, SETVAL, ctl) == -1)
        errx(5, "Blad ustawiania semafora!");

    int pid = fork();

    if (pid < 0) {
        errx(6, "Blad tworzenia podprocesu!");
    } else if (pid == 0) {  
        semlock(semid);
        printf("PROGRAM 2\n");

        s = shm;
        while (*s != '\0') {
            putchar(*s);
            s++;
        }
        putchar('\n');

        semunlock(semid);
    } else {  
        FILE *file = fopen(argv[1], "r");
        
        printf("PROGRAM 1 \n");
        if (file == NULL)
            errx(7, "Error opening file!");

        s = shm;
        while ((c = fgetc(file)) != EOF) {
            *s++ = c;
        }

        semunlock(semid); 

        wait(NULL);  
        printf("PROGRAM 1 \n");
        semctl(semid, 0, IPC_RMID, ctl);
        shmdt(shm);
        shmctl(shmid, IPC_RMID, NULL);

        printf("Program finished.\n");
    }

    return 0;
}
