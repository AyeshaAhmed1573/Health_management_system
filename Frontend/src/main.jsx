import { createRoot } from "react-dom/client";
import App from "./App";
import { installFetchAuth } from "./lib/session";
import "./index.css";

installFetchAuth();

createRoot(document.getElementById("root")).render(<App />);
