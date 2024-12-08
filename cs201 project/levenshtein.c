#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "header.h"

int min(int a, int b, int c) {
    if(a <= b && a <= c) return a;
    if(b <= a && b <= c) return b;
    return c;
}

int lev_dist(char* a, char* b) {
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
            } 
            else if(j == 0) {
                dp[i][j] = i;
            } 
            else if(a[i-1] == b[j-1]) {
                dp[i][j] = dp[i-1][j-1];
            } 
            else {
                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
            }
        }
    }

    return dp[len_a][len_b];
}