#include <iostream>
#include <queue>
#include <unordered_map>
#include <vector>
using namespace std;

struct Node {
    char ch;
    int freq;
    Node *left, *right;
    Node(char c, int f) : ch(c), freq(f), left(NULL), right(NULL) {}
};

struct Compare {
    bool operator()(Node* l, Node* r) {
        return l->freq > r->freq;
    }
};

void buildCode(Node* root, string str, unordered_map<char, string>& huffCode) {
    if (!root) return;
    if (!root->left && !root->right) huffCode[root->ch] = str;
    buildCode(root->left, str + "0", huffCode);
    buildCode(root->right, str + "1", huffCode);
}

int main() {
    string text;
    getline(cin, text);

    if (text.empty()) {
        cout << "";
        return 0;
    }

    unordered_map<char, int> freq;
    for (char c : text) freq[c]++;

    priority_queue<Node*, vector<Node*>, Compare> pq;
    for (auto& pair : freq)
        pq.push(new Node(pair.first, pair.second));

    while (pq.size() > 1) {
        Node *l = pq.top(); pq.pop();
        Node *r = pq.top(); pq.pop();
        Node *sum = new Node('\0', l->freq + r->freq);
        sum->left = l; sum->right = r;
        pq.push(sum);
    }

    unordered_map<char, string> huffCode;
    buildCode(pq.top(), "", huffCode);

    for (char c : text) cout << huffCode[c];
    return 0;
}
