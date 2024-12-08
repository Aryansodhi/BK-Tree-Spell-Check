#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "header.h"

int main() {
    char* a = "hello";
    char* b = "jellybean";

    printf("Levenshtein distance: %d\n", UK_lev_dist(a, b));
}