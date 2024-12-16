const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5002; // Use Render's dynamic port or default to 5000

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for all origins

// Search endpoint
app.post('/api/search', (req, res) => {
  const { word, tolerance } = req.body;

  console.log(`Received search request with word: ${word}, tolerance: ${tolerance}`);

  const exePath = path.resolve(__dirname, 'bk_tree.exe'); // Path to the executable
  const command = `"${exePath}" ${word} ${tolerance}`; // Command to execute the .exe file

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

    // Parse the output to get tolerance and matching words
    const match = stdout.trim().match(/^Tolerance (\d+): (.+)$/);
    if (match) {
      const tolerance = parseInt(match[1], 10); // Extract tolerance level
      const words = match[2].split(', ').map((word) => word.trim()); // Extract matching words
      return res.json({ tolerance, words }); // Return the result as JSON
    }

    return res.status(404).json({ error: 'No words found within the given tolerance.' });
  });
});

// Add word to dictionary endpoint
app.post('/api/add-word', (req, res) => {
  const { word } = req.body;

  console.log(`Received request to add word: ${word}`);

  const exePath = path.resolve(__dirname, 'bk_tree.exe'); // Path to the executable
  const command = `"${exePath}" ${word} 0 add`; // Command to add the word to the dictionary

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



