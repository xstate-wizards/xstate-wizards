import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./components/Home";
import { Interview } from "./components/Interview";
import { Outline } from "./components/Outline";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/outline" element={<Outline />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
