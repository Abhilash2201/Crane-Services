import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import App from "./App";
import { GlobalStyles } from "./styles/GlobalStyles";
import { theme } from "./styles/theme";
import "./styles/primereact-theme.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </PrimeReactProvider>
  </React.StrictMode>
);
