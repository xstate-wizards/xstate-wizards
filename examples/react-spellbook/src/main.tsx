import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ExampleSpellBook } from "./ExampleSpellBook";
import { GlobalStyle } from "./styled/GlobalStyle";

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyle />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExampleSpellBook />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
