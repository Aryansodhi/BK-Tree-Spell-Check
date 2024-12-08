// api/server.js

const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');

// The handler for Vercel's Serverless Function
module.exports = async (req, res) => {
  // Enable CORS for all origins (you can specify specific origins if needed)
  cors()(req, res, () => {});

  // Handling Search Request
  if (req.method === 'POST' && req.url === '/api/search') {
    const { word, tolerance } = req.body;  // Extract word and tolerance from the body

    console.log(`Received search request with word: ${word}, tolerance: ${tolerance}`);

    const exePath = path.resolve(__dirname, 'bk_tree.exe');  // Path to your executable
    const command = `"${exePath}" ${word} ${tolerance}`;  // Command to run the executable

    console.log(`Executing command: ${command}`);

    // Execute the command and capture output
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error executing C program:", error.message);
        return res.status(500).json({ error: 'Execution error', details: error.message });
      }

      if (stderr) {
        console.error("Error output from C program:", stderr);
        return res.status(500).json({ error: 'Command error', details: stderr });
      }

      console.log("Command output:", stdout);

      // Parse the output to get tolerance and matching words
      const match = stdout.trim().match(/^Tolerance (\d+): (.+)$/);
      if (match) {
        const tolerance = parseInt(match[1], 10);  // Extract tolerance level
        const words = match[2].split(", ").map(word => word.trim());  // Extract matching words
        return res.json({ tolerance, words });  // Return the result as JSON
      }

      return res.status(404).json({ error: 'No words found within the given tolerance.' });
    });
  }

  // Handle Add Word to Dictionary Request
  else if (req.method === 'POST' && req.url === '/api/add-word') {
    const { word } = req.body;  // Extract word from the body

    console.log(`Received request to add word: ${word}`);

    const exePath = path.resolve(__dirname, 'bk_tree.exe');  // Path to your executable
    const command = `"${exePath}" ${word} 0 add`;  // Command to add word to dictionary

    console.log(`Executing command: ${command}`);

    // Execute the command and capture output
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error adding word to dictionary:", error.message);
        return res.status(500).json({ error: 'Failed to add word to dictionary.' });
      }

      if (stderr) {
        console.error("Error output from C program:", stderr);
        return res.status(500).json({ error: 'Command error', details: stderr });
      }

      console.log("Command output:", stdout);
      res.json({ message: `Word '${word}' added successfully.` });
    });
  }

  // Serve the dictionary file
  else if (req.method === 'GET' && req.url === '/api/download-dictionary') {
    const dictionaryPath = path.resolve(__dirname, 'dictionary.txt');
    res.download(dictionaryPath, 'dictionary.txt', (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error downloading dictionary file.");
      }
    });
  } 

  // Fallback for unsupported routes
  else {
    res.status(404).send('Not Found');
  }
};


