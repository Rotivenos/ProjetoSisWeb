import React, { useState, useEffect } from "react";
import { getMemories } from "../api";

const ExploreMemories = () => {
  const [filters, setFilters] = useState({
    theme: "",
    location: "",
    date: "",
  });
  const [memories, setMemories] = useState([]);

  useEffect(() => {
    setMemories(getMemories());
  }, []);

  const filtered = memories.filter((m) => {
    return (
      (filters.theme === "" || m.theme === filters.theme) &&
      (filters.location === "" || m.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (filters.date === "" || m.date === filters.date)
    );
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Explorar Memórias</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          value={filters.theme}
          onChange={(e) => setFilters({ ...filters, theme: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">Todos os temas</option>
          <option value="viagem">Viagem</option>
          <option value="família">Família</option>
          <option value="evento">Evento</option>
        </select>
        <input
          type="text"
          placeholder="Localização"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="p-2 border rounded"
        />
      </div>
      <div className="grid gap-4">
        {filtered.map((m, i) => (
          <div key={i} className="border p-4 rounded shadow">
            <h3 className="text-xl font-semibold">{m.title}</h3>
            <p><strong>Tema:</strong> {m.theme}</p>
            <p><strong>Localização:</strong> {m.location}</p>
            <p><strong>Data:</strong> {m.date}</p>
            <p>{m.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreMemories;