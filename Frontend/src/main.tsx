import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { warmHomeContent } from "./app/lib/siteContent";
import "./styles/index.css";

if (!window.location.pathname.startsWith("/dashboard")) {
  warmHomeContent();
}

createRoot(document.getElementById("root")!).render(<App />);
