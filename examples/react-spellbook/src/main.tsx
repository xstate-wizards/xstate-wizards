import "@xstate-wizards/wizards-of-react/styles.css";
import "@xstate-wizards/spellbook/styles.css";
import "./global.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ExampleSpellBook } from "./ExampleSpellBook";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExampleSpellBook />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
