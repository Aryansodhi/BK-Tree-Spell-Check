const express = require("express");
const cors = require("cors"); // Import cors
const { exec } = require("child_process");
const path = require("path");

const app = express();
const port = 5002;

// Middleware
app.use(express.json());
app.use(cors()); // Use cors middleware

// Search endpoint
app.post("/search", (req, res) => {
  const { word, tolerance } = req.body;

  console.log(`Received search request with word: ${word}, tolerance: ${tolerance}`);

  const exePath = path.resolve(__dirname, "bk_tree.exe");
  const command = `"${exePath}" ${word} ${tolerance}`;

  console.log(`Executing command: ${command}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Error executing C program:", error.message);
      return res.status(500).json({ error: "Execution error", details: error.message });
    }
    if (stderr) {
      console.error("Error output from C program:", stderr);
      return res.status(500).json({ error: "Command error", details: stderr });
    }

    console.log("Command output:", stdout);

    const match = stdout.trim().match(/^Tolerance (\d+): (.+)$/);
    if (match) {
      const tolerance = parseInt(match[1], 10);
      const words = match[2].split(", ").map(word => word.trim());
      return res.json({ tolerance, words });
    }

    return res.status(404).json({ error: "No words found within the given tolerance." });
  });
});

// Add word to dictionary endpoint
app.post("/add-word", (req, res) => {
  const { word } = req.body;

  console.log(`Received request to add word: ${word}`);

  const exePath = path.resolve(__dirname, "bk_tree.exe");
  const command = `"${exePath}" ${word} 0 add`;

  console.log(`Executing command: ${command}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Error adding word to dictionary:", error.message);
      return res.status(500).json({ error: "Failed to add word to dictionary." });
    }

    console.log("Command output:", stdout);
    res.json({ message: `Word '${word}' added successfully.` });
  });
});

// Serve the dictionary file
app.get("/download-dictionary", (req, res) => {
  const dictionaryPath = path.resolve(__dirname, "dictionary.txt");
  res.download(dictionaryPath, "dictionary.txt", (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Error downloading dictionary file.");
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

