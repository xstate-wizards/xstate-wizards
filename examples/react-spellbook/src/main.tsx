import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ExampleSpellBook } from "./ExampleSpellBook";
import { GlobalStyle } from "./styled/GlobalStyle";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalStyle />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExampleSpellBook />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
