#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/msg.h>
#include <string.h>
#include <signal.h>

struct mymsgbuf {
    long    mtype;          /* typ komunikatu >0 */
    char   i[1000] ;
} msg;

struct mymsgbuf buf;

int open_queue( key_t keyval ) {
    int     qid;

    if((qid = msgget( keyval, IPC_CREAT | 0660 )) == -1)
        return(-1);

    return(qid);
}

int send_message( int qid, struct mymsgbuf *qbuf ){
    int result, length;

    /* lenght jest rozmiarem struktury minus sizeof(mtype) */
    length = sizeof(struct mymsgbuf) - sizeof(long);

    if((result = msgsnd( qid, qbuf, length, 0)) == -1)
        return(-1);

    return(result);
}

int remove_queue( int qid ){
    if( msgctl( qid, IPC_RMID, 0) == -1)
        return(-1);

    return(0);
}

int read_message( int qid, long type, struct mymsgbuf *qbuf ){
    int     result, length;

    /* lenght jest rozmiarem struktury minus sizeof(mtype) */
    length = sizeof(struct mymsgbuf) - sizeof(long);

    if((result = msgrcv( qid, qbuf, length, type,  0)) == -1)
        return(-1);

    return(result);
}

int main(int argc, char *argv[]){
    int    qid;
    key_t  msgkey;
    int c1_pid;
    sigset_t set;
    int sig;

    sigemptyset(&set);
    sigaddset(&set, SIGUSR1);
    sigprocmask(SIG_BLOCK, &set, NULL);

    /* tworzymy wartość klucza IPC */
    msgkey = ftok(".", 'm');

    /* otwieramy/tworzymy kolejkę */
    if(( qid = open_queue( msgkey)) == -1) {
        perror("Otwieranie_kolejki");
        exit(1);
    }

    if(c1_pid = fork()) {

        msg.mtype   = 1;

        if (argc != 2) {
            fprintf(stderr, "Nazwa pliku nie zostal podany");
            strcpy(msg.i, "Nazwa pliku nie zostal podany");
            return 1;
        } else {
            FILE *input = fopen(argv[1], "r");

            if (input == NULL) {
                fprintf(stderr, "Blad odczytu pliku");
                strcpy(msg.i, "Nazwa pliku nie zostal podany");
                return 1;
            } else {
                char content[200];

                while (fgets(content, sizeof(content), input) != NULL) {
                    strcat(msg.i, content);
                }
            }
        }

        // Wysylamy
        if((send_message( qid, &msg )) == -1) {
            perror("Wysylanie");
            exit(1);
        }

        sigwait(&set, &sig);
        remove_queue(qid);

        fprintf(stdout, "Koniec programu\n");
        exit(0);

    } else {

        buf.mtype   = 1;

        // Odbieramy wiadomosc
        read_message(qid, buf.mtype, &buf);
        printf("Zawartosc:\n%s\n", buf.i);

        kill(c1_pid, SIGUSR1);
        return 0;
    }
}
