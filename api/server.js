const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5002;  // Use Render's dynamic port

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for all origins

// Function to compile C code on the server
const compileCCode = (callback) => {
  const compileCommand = `gcc -o bk_tree BK_structure.c Ukkonen_Levenshtein_Distance.c dictionary.c -lm`;

  exec(compileCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('Compilation error:', error.message);
      callback(error, null);
      return;
    }
    if (stderr) {
      console.error('Compilation stderr:', stderr);
      callback(stderr, null);
      return;
    }
    console.log('Compilation successful:', stdout);
    callback(null, 'bk_tree'); // Return the name of the compiled binary
  });
};

// Search endpoint
app.post('/api/search', (req, res) => {
  const { word, tolerance } = req.body;

  console.log(`Received search request with word: ${word}, tolerance: ${tolerance}`);

  compileCCode((error, binaryName) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to compile C code.', details: error });
    }

    const exePath = path.resolve(__dirname, binaryName);
    const command = `"${exePath}" ${word} ${tolerance}`;

    console.log(`Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing C program:', error.message);
        return res.status(500).json({ error: 'Execution error', details: error.message });
      }

      if (stderr) {
        console.error('Error output from C program:', stderr);
        return res.status(500).json({ error: 'Command error', details: stderr });
      }

      console.log('Command output:', stdout);

      const match = stdout.trim().match(/^Tolerance (\d+): (.+)$/);
      if (match) {
        const tolerance = parseInt(match[1], 10);
        const words = match[2].split(', ').map((word) => word.trim());
        return res.json({ tolerance, words });
      }

      return res.status(404).json({ error: 'No words found within the given tolerance.' });
    });
  });
});

// Add word to dictionary endpoint
app.post('/api/add-word', (req, res) => {
  const { word } = req.body;

  console.log(`Received request to add word: ${word}`);

  compileCCode((error, binaryName) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to compile C code.', details: error });
    }

    const exePath = path.resolve(__dirname, binaryName);
    const command = `"${exePath}" ${word} 0 add`;

    console.log(`Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error adding word to dictionary:', error.message);
        return res.status(500).json({ error: 'Failed to add word to dictionary.' });
      }

      if (stderr) {
        console.error('Error output from C program:', stderr);
        return res.status(500).json({ error: 'Command error', details: stderr });
      }

      console.log('Command output:', stdout);
      res.json({ message: `Word '${word}' added successfully.` });
    });
  });
});

// Serve the dictionary file
app.get('/api/download-dictionary', (req, res) => {
  const dictionaryPath = path.resolve(__dirname, 'dictionary.txt');
  res.download(dictionaryPath, 'dictionary.txt', (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send('Error downloading dictionary file.');
    }
  });
});

// Handle unsupported routes
app.all('*', (req, res) => {
  res.status(404).send('Not Found');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
