// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/blog" element={<div>Blog coming soon...</div>} />
    </Routes>
  );
}
