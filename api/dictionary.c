#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "header.h"

char **array_maker(char *filename, int *count) {
    FILE *fp = fopen(filename, "r");
    if (fp == NULL) {
        perror("Error opening file");
        return NULL;
    }

    char *line = NULL;
    size_t len = 0;
    *count = 0;

    // Count the number of lines in the file
    while (getline(&line, &len, fp) != -1) {
        (*count)++;
    }

    // printf("The number of lines in the file is: %d\n", *count);

    // Rewind the file pointer to the beginning
    rewind(fp);

    // Allocate memory for the array of strings
    char **array = (char **)malloc(sizeof(char *) * (*count));
    if (array == NULL) {
        perror("Error allocating memory");
        fclose(fp);
        free(line);
        return NULL;
    }

    // Read each line and store it in the array
    int i = 0;
    while (getline(&line, &len, fp) != -1) {
        // Remove the trailing newline character
        line[strcspn(line, "\n")] = 0;
        // Allocate memory for the string
        array[i] = strdup(line);
        if (array[i] == NULL) {
            perror("Error allocating memory");
            fclose(fp);
            for (int j = 0; j < i; j++) {
                free(array[j]);
            }
            free(array);
            free(line);
            return NULL;
        }
        i++;
    }

    // Free the temporary buffer
    free(line);

    // Close the file
    fclose(fp);
    return array;
}

struct Node* dic_loader(char *filename) {
    int count;
    char **dictionary = array_maker(filename, &count);
    if (dictionary == NULL) {
        printf("Error loading dictionary\n");
        return NULL;
    }

    struct Node *root = createBKTree(dictionary[0]);

    for (int i = 1; i < count; i++) {
        insertNode(root, dictionary[i]);
    }


    for (int i = 0; i < count; i++) {
        free(dictionary[i]);
    }
    free(dictionary);

    return root;
}

