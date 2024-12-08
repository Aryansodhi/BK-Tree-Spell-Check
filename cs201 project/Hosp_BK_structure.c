//Ashutosh Rajput
//2023CSB1289
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <stdbool.h>
#include <string.h>
#include <limits.h>
#include <time.h>

#define M_PI 3.14159265358979323846

struct Node
{
    float longitude;
    float latitude;
    char *name;
    struct Node **children;
    int numChildren;
};

//function to create a new node
struct Node* createNode(float longitude, float latitude, char *name)
{
    struct Node *newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->longitude = longitude;
    newNode->latitude = latitude;
    newNode->name = strdup(name);
    newNode->numChildren = 23;
    newNode->children = (struct Node**)malloc(sizeof(struct Node*) * newNode->numChildren);
    for(int i = 0; i < newNode->numChildren; i++)
    {
        newNode->children[i] = NULL;
    }
    return newNode;
}

//function to create a BK tree
struct Node* createBKTree(float longitude, float latitude, char *name)
{
    struct Node *root = createNode(longitude, latitude, name);
    return root;
}

 

//function to calculate haversine distance
int haversine_distance(float lon1, float lat1, float lon2, float lat2)
{
    float dLat = (lat2 - lat1) * M_PI / 180.0;
    float dLon = (lon2 - lon1) * M_PI / 180.0;
    lat1 = (lat1) * M_PI / 180.0;
    lat2 = (lat2) * M_PI / 180.0;
    float a = pow(sin(dLat / 2), 2) + pow(sin(dLon / 2), 2) * cos(lat1) * cos(lat2);
    float rad = 6371;
    float c = 2 * asin(sqrt(a));
    return rad * c;
}

//function to insert a new node in BK tree
void insertNode(struct Node *root, float longitude, float latitude, char *name)
{
    struct Node *currentNode = root;
    int distance = 0;
    while(currentNode != NULL)
    {
        distance = haversine_distance(currentNode->longitude, currentNode->latitude, longitude, latitude);
        if(currentNode->children[distance/15] == NULL)
        {
            currentNode->children[distance/15] = createNode(longitude, latitude, name);
            break;
        }
        else
        {
            currentNode = currentNode->children[distance/15];
        }
    }
}

void depth_traverse(struct Node *root)
{
    if(root == NULL)
    {
        return;
    }
    for(int i = 0; i < root->numChildren; i++)
    {
        depth_traverse(root->children[i]);
    }
    printf("Hospital %s\n", root->name);
    
}

int is_valid_coordinate(char *str, float *coordinate) {
    char *end;
    double value = strtod(str, &end);
    if (end == str || *end != '\0' || value == 0.0) {
        return 0;  // Invalid or zero
    }
    *coordinate = (float)value;
    return 1;
}
         
struct Node** read_csv(const char* filename, int* count) {
    FILE* file = fopen(filename, "r");
    if (!file) {
        perror("Error opening file");
        return NULL;
    }

    char line[200];
    int line_count = 0;

    while (fgets(line, sizeof(line), file)) {
        line_count++;
    }
    line_count--;  // Exclude the header line
    *count = line_count;

    struct Node** nodes = malloc(line_count * sizeof(struct Node*));
    if (!nodes) {
        perror("Memory allocation error");
        fclose(file);
        return NULL;
    }

    rewind(file);  
    fgets(line, sizeof(line), file);  // Skip the header line

    int index = 0;
    while (fgets(line, sizeof(line), file)) {
        char name[100];
        float latitude, longitude;

        char* first_comma = strchr(line, ',');
        if (!first_comma) continue;  

        char* rest_of_line = first_comma + 1;

        char* second_comma = strchr(rest_of_line, ',');
        if (!second_comma) continue;  

        // Extract name
        size_t name_length = second_comma - rest_of_line;
        strncpy(name, rest_of_line, name_length);
        name[name_length] = '\0';  

        if (sscanf(second_comma + 1, "%f,%f", &latitude, &longitude) != 2) {
            continue; 
        }
        if (latitude == 0.0 || longitude == 0.0) {
            continue;
        }

        nodes[index++] = createNode(longitude, latitude, name);
    }

    fclose(file);
    *count = index;  
    return nodes;
}

struct Node* hosp_loader(char* filename) {
    int count;
    struct Node** nodes = read_csv(filename, &count);
    if (!nodes) {
        return NULL;
    }

    struct Node* root = nodes[0];
    for (int i = 1; i < count; i++) {
        insertNode(root, nodes[i]->longitude, nodes[i]->latitude, nodes[i]->name);
    }

    free(nodes);
    return root;
}

void searchBKTree(struct Node *root, float longitude, float latitude, char ***results, int *result_count) {
    if (root == NULL) return;

    int distance = haversine_distance(root->longitude, root->latitude, longitude, latitude);
    int index = distance / 15;
    if (index < 23 && result_count[index] < 23) {
        results[index][result_count[index]] = strdup(root->name);
        result_count[index]++;
    }

    // Recursively call search on the child at index
    // if (index < root->numChildren && root->children[index] != NULL) {
    //     searchBKTree(root->children[index], longitude, latitude, results, result_count);
    // }

    // recursively call search on children at index-1 to index+1
    for (int i = fmax(0, index - 1); i <= fmin(22, index + 1); i++) {
        if (root->children[i] != NULL) {
            searchBKTree(root->children[i], longitude, latitude, results, result_count);
        }
    }
}

void search_preprocessor(struct Node* root) {
    float longitude, latitude;
    char input[100];
    char **results[23];
    int result_count[23] = {0};

    for (int i = 0; i < 23; i++) {
        results[i] = (char **)malloc(23 * sizeof(char *));
    }

    printf("Enter the longitude: ");
    fgets(input, sizeof(input), stdin);
    sscanf(input, "%f", &longitude);

    printf("Enter the latitude: ");
    fgets(input, sizeof(input), stdin);
    sscanf(input, "%f", &latitude);

    searchBKTree(root, longitude, latitude, results, result_count);

    for (int i = 0; i < 23; i++) {
        if (result_count[i] != 0) {
            printf("Hospitals found within distance %d-%d km\n", i * 15, (i + 1) * 15);
            for (int j = 0; j < result_count[i]; j++) {
                printf("%s\n", results[i][j]);
                free(results[i][j]);
            }
            for (int k = 0; k < 23; k++) {
                free(results[k]);
            }
            return;
        }
        free(results[i]);
    }
    printf("No hospitals found nearby\n");
}



int main()
{
    struct Node *root = hosp_loader("hospital_data.csv");
    // depth_traverse(root);
    search_preprocessor(root);
    return 0;
}

