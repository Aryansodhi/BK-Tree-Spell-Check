# BK‑Tree Spell‑Checker UI

A full‑stack fuzzy spell‑checker: C‑based BK‑Tree core wrapped in a Node.js/Express API and a Vite+React frontend.

---

## Live Demo

Try it now: https://bk-tree-spell-check.vercel.app

---

## Tech Stack

- **Core Algorithm:** C (BK‑Tree + Ukkonen’s Levenshtein distance)  
- **Backend:** Node.js · Express · `child_process` (to compile & run C)  
- **Frontend:** Vite · React · TypeScript · CSS  

---

## Local Setup

1. **Clone the repo**  
   ```bash
   git clone https://github.com/Aryansodhi/BK-Tree-Spell-Check.git
   cd BK-Tree-Spell-Check
   ```

2. **Install dependencies**  
   ```bash
   # Backend
   cd api
   npm install

   # Frontend
   cd ../react-app
   npm install
   ```

3. **Run the backend**  
   ```bash
   cd ../api
   npm start
   ```

4. **Run the frontend**  
   ```bash
   cd ../react-app
   npm run dev
   ```

---

## Usage

- Open your browser at `http://localhost:5173`.  
- **Enter** a word and a tolerance (max edit distance).  
- Click **Search** to get live suggestions.  
- If no match is found, a popup lets you **Add** the word to the dictionary.  
- Click **View Dictionary** in the navbar to download `dictionary.txt`.

---

## API Endpoints

- **POST** `/api/search`  
  ```json
  { "word": "<string>", "tolerance": "<number>" }
  ```  
  **Response:**  
  ```json
  { "tolerance": "<number>", "words": ["suggestion1", "suggestion2", "…"] }
  ```

- **POST** `/api/add-word`  
  ```json
  { "word": "<string>" }
  ```  
  **Response:**  
  ```json
  { "message": "Word '<string>' added successfully." }
  ```

- **GET** `/api/download-dictionary`  
  Download the current `dictionary.txt`.

---
