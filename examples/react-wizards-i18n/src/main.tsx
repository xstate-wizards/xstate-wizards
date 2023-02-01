import i18next, { t } from "i18next";
import { initReactI18next } from "react-i18next";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./components/Home";

i18next.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        title: "English Title",
        exit: "English Exit",
        h1: "English",
        h3: "English",
        p: "English",
        p2: "English 2",
        button: "English",
        label: "English Email",
        continue: "English Continue",
        sectionBar: "English Section",
      },
    },
    es: {
      translation: {
        title: "Spanish Title",
        exit: "Spanish Exit",
        h1: "Spanish",
        h3: "Spanish",
        p: "Spanish",
        p2: "Spanish 2",
        button: "Spanish",
        label: "Spanish Email",
        continue: "Spanish Continue",
        sectionBar: "Spanish Section",
      },
    },
  },
  interpolation: { escapeValue: false },
  lng: "en",
  fallbackLng: "en",
});

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
