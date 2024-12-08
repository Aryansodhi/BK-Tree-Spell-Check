#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int min(int a, int b, int c) {
    if(a <= b && a <= c) return a;
    if(b <= a && b <= c) return b;
    return c;
}

char* tail(char* s, int l) {
    char* t = (char*)malloc((l-1) * sizeof(char));
    for(int i = 0; i < l-1; i++) {
        t[i] = s[i+1];
    }
    return t;
}

int levenshtein_distance(char* a, char* b) {    
    int len_a = strlen(a);
    int len_b = strlen(b);

    if(len_a == 0) return len_b;
    if(len_b == 0) return len_a;

    if(a[0] == b[0]) {
        return levenshtein_distance(tail(a,len_a), tail(b,len_b));
    }

    int x = levenshtein_distance(tail(a,len_a), b);
    int y = levenshtein_distance(a, tail(b,len_b));
    int z = levenshtein_distance(tail(a,len_a), tail(b,len_b));

    return 1 + min(x, y, z);
}

int edit_dist(char* a, char* b) {
    int len_a = strlen(a);
    int len_b = strlen(b);

    int** dp = (int**)malloc((len_a+1) * sizeof(int*));
    for(int i = 0; i <= len_a; i++) {
        dp[i] = (int*)malloc((len_b+1) * sizeof(int));
    }

    for(int i = 0; i <= len_a; i++) {
        for(int j = 0; j <= len_b; j++) {
            if(i == 0) {
                dp[i][j] = j;
            } else if(j == 0) {
                dp[i][j] = i;
            } else if(a[i-1] == b[j-1]) {
                dp[i][j] = dp[i-1][j-1];
            } else {
                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
            }
        }
    }

    printf("Edit distance matrix:\n");
    for(int i = 0; i <= len_a; i++) {
        for(int j = 0; j <= len_b; j++) {
            printf("%d ", dp[i][j]);
        }
        printf("\n");
    }

    return dp[len_a][len_b];
}

int main() {
    char* a = "sitting";
    char* b = "kitten";
    printf("Levenshtein distance between %s and %s: %d\n", a, b, edit_dist(a, b));
}