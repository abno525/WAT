#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void* thread_function(void* arg) {
    pthread_t self_id = pthread_self();
    printf("Newly Created Thread ID: %lu\n", self_id);
    int* value = (int*) arg;
    int* ret = malloc(sizeof(int));
    *ret = -(*value);
    pthread_exit(ret);
}

int main(int argc, char* argv[]) {
    int err, cnt;
    int numbers[argc-1];
    int *rets[argc];

    if (argc <= 1) {
        printf("No numbers were passed.\n");
        return -1;
    }

    pthread_t p_thread[argc];

    for (int i = 1; i < argc; i++) {
        char *end;
        numbers[i-1] = strtol(argv[i], &end, 10);
        if (*end) {
            printf("'%s' is not a valid number.\n", argv[i]);
            return -1;
        }
    }

    for (int i = 1; i < argc; i++) {
        printf("argv[%d] = %s\n", i, argv[i]);
        err = pthread_create(&p_thread[i], NULL, thread_function, (void *) &numbers[i-1]);
        if(err != 0) {
            fprintf(stderr, "Error creating the thread");
            return 1;
        }
    }

    for(cnt = 1; cnt < argc; cnt++) {
        pthread_join(p_thread[cnt], (void **)&(rets[cnt]));
    }

    fprintf(stdout, "All threads completed.\n");

    for(cnt = 1; cnt < argc; cnt++) {
        printf("%d\n", *rets[cnt]);
        free(rets[cnt]);
    }

    return 0;
}
