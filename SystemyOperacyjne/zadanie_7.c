#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <unistd.h>

int pid;
int ppid;

void sig_handler (int sig){
    psignal(sig, "\n Odebralem sygnal");
    fprintf(stderr, "Moj pid : %d , nr sygnalu : %d \n", getpid(), sig);
    return;
}

void sigx() {
    kill(getppid(), SIGUSR2);
    return;
}

void sigusr() {
    kill(pid, SIGKILL);
    kill(getpid(), SIGKILL);
    return;
}

int main(void) {

    pid = fork();
    printf("ZMIENNA PID: %d", pid);

    if(pid == 0)
	{
        ppid = getppid();
		printf("Fork PID: %d, PPID: %d\n", getpid(), getppid());
        signal(SIGXFSZ, sigx);

        int i = 0;
        for (i = 1; i <= 24; i++) {
        signal(i, sig_handler);
        }

        for (i = 26; i <= 64; i++) {
        signal(i, sig_handler);
        }

		for(;;);
            pause();
		return 0;
	}

	sigset_t mask_set, old_mask;
	sigfillset(&mask_set);
	sigdelset(&mask_set, SIGUSR2);
 	sigprocmask(SIG_SETMASK, &mask_set, &old_mask);
	printf("PID: %d\n", getpid());
    signal(SIGUSR2, sigusr);

    for(;;)
        pause();
	return 0;
}
