import React, { useState } from "react";
import "./App.css"; // Ensure styles include vibration and pop-up

const BKTreeUI: React.FC = () => {
  const [word, setWord] = useState<string>("");
  const [tolerance, setTolerance] = useState<string>("");
  const [results, setResults] = useState<{ tolerance: number; words: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
  const [vibrate, setVibrate] = useState<boolean>(false);

  // Use different base URL depending on the environment (local or production)
  const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5002' : 'https://<your-vercel-deployment-url>.vercel.app';

  const handleSearch = async () => {
    setResults(null);
    setError(null);
    setShowAddPopup(false);

    if (!word.trim()) {
      setError("Please enter a word to search.");
      return;
    }
    if (!tolerance.trim() || isNaN(Number(tolerance))) {
      setError("Please enter a valid tolerance.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, tolerance: Number(tolerance) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);

      if (data.tolerance > 0) {
        setShowAddPopup(true); // Show add-to-dictionary popup
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/add-word`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });

      if (!response.ok) {
        throw new Error("Failed to add word to the dictionary.");
      }

      const data = await response.json();
      alert(data.message);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setShowAddPopup(false); // Dismiss the popup
    }
  };

  const handleDismissPopup = () => {
    setShowAddPopup(false); // Dismiss the popup
  };

  // Close the pop-up if any input is changed
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (showAddPopup) {
      setShowAddPopup(false); // Hide pop-up if input is changed
    }
    setter(e.target.value);
  };

  const handleDownloadDictionary = () => {
    if (window.confirm("Do you want to download and view the dictionary file?")) {
      const link = document.createElement("a");
      link.href = `${baseUrl}/api/download-dictionary`;
      link.download = "dictionary.txt";
      link.click();
    }
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">BK Tree Spell Checker</span>
          <button className="btn btn-secondary ms-auto" onClick={handleDownloadDictionary}>
            View Dictionary
          </button>
        </div>
      </nav>
      <div className="container mt-4">
        <h4 className="text-center">BK Tree Spell Checker</h4>
        <p className="text-center text-muted">
          Enter a word and a tolerance to search in the BK Tree.
        </p>

        <div className="d-flex justify-content-center mb-4">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Enter word"
            value={word}
            onChange={(e) => handleInputChange(e, setWord)} // Close pop-up when input changes
          />
          <input
            type="text"
            className="form-control me-2"
            placeholder="Enter tolerance"
            value={tolerance}
            onChange={(e) => handleInputChange(e, setTolerance)} // Close pop-up when input changes
          />
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        {results && (
          <div className="mt-4 text-center">
            <h5>Search Results</h5>
            <p>
              <strong>
                Distance {results.tolerance}:
              </strong>{" "}
              {results.words.length === 1 && results.words[0] === "No matches found"
                ? "No matches found"
                : results.words.join(", ")}
            </p>
          </div>
        )}

        {showAddPopup && (
          <div className={`popup ${vibrate ? "vibrate" : ""}`}>
            <div className="popup-content">
              <h5>The word "{word}" is not in the dictionary. Add it?</h5>
              <div className="d-flex justify-content-center mt-3">
                <button
                  className="btn btn-success me-2"
                  onClick={handleAddWord}
                >
                  Yes
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDismissPopup}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BKTreeUI;


