import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from './App'
import BKTreeUI from './BKTreeUI'
import 'bootstrap/dist/css/bootstrap.css'

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/bk-tree" element={<BKTreeUI />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
