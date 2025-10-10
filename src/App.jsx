import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CreateAlbum from "./components/CreateAlbum";
import ExploreMemories from "./components/ExploreMemories";

function App() {
  return (
    <Router>
      <nav className="p-4 bg-blue-600 text-white flex gap-4">
        <Link to="/">Criar Álbum</Link>
        <Link to="/explore">Explorar Memórias</Link>
      </nav>
      <Routes>
        <Route path="/" element={<CreateAlbum />} />
        <Route path="/explore" element={<ExploreMemories />} />
      </Routes>
    </Router>
  );
}

export default App;