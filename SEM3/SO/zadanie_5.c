#include <unistd.h>
#include <stdio.h>

int main(void)
{
    if(fork()==0) // P1
    {
        printf("1 PID: %d, PPID: %d\n", getpid(), getppid());
        if(fork()==0) // P2
        {
            printf("2 PID: %d, PPID: %d\n", getpid(), getppid());

            if(fork()==0) // P3
            {
                printf("3 PID: %d, PPID: %d\n", getpid(), getppid());
                sleep(120);
                return 0;
            }

            sleep(120);
            return 0;
        }

        sleep(120);
        return 0;

    }
    if(fork()==0) // P5
    {
        printf("5 PID: %d, PPID: %d\n", getpid(), getppid());
        if(fork()==0) // P6
        {
            printf("6 PID: %d, PPID: %d\n", getpid(), getppid());
            execlp("pstree", "pstree","-c",(char *)NULL);
            sleep(120);
            return 0;
        }
        if(fork()==0) // P7
        {
            printf("7 PID: %d, PPID: %d\n", getpid(), getppid());
            sleep(120);
            return 0;
        }
        if(fork()==0) // P8
        {
            printf("8 PID: %d, PPID: %d\n", getpid(), getppid());
            sleep(120);
            return 0;
        }
        sleep(120);
        return 0;
    }
    if(fork()==0) // P9
    {
        printf("9 PID: %d, PPID: %d\n", getpid(), getppid());
        if(fork()==0) // P10
        {
            printf("10 PID: %d, PPID: %d\n", getpid(), getppid());
            sleep(120);
            return 0;
        }
        if(fork()==0) // P11
        {
            printf("11 PID: %d, PPID: %d\n", getpid(), getppid());
            sleep(120);
            return 0;
        }
        if(fork()==0) // P12
        {
            printf("12 PID: %d, PPID: %d\n", getpid(), getppid());
            sleep(120);
            return 0;
        }
        sleep(120);
        return 0;
    }


    sleep(120);
    return 0;
}
