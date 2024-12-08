import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BKTreeUI from './BKTreeUI'
import 'bootstrap/dist/css/bootstrap.css'
import './App.css';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BKTreeUI />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
