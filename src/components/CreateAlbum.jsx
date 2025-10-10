import React, { useState } from "react";
import { addMemory } from "../api";

const CreateAlbum = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    theme: "",
    location: "",
    date: "",
    mediaFiles: [],
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMediaUpload = (e) => {
    setForm({ ...form, mediaFiles: Array.from(e.target.files) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addMemory(form);
    alert("Álbum criado com sucesso!");
    setForm({
      title: "",
      description: "",
      theme: "",
      location: "",
      date: "",
      mediaFiles: [],
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Criar Álbum de Memórias</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          type="text"
          placeholder="Título do Álbum"
          value={form.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Descrição"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded h-24"
        />
        <select
          name="theme"
          value={form.theme}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Selecione um tema</option>
          <option value="viagem">Viagem</option>
          <option value="família">Família</option>
          <option value="evento">Evento</option>
        </select>
        <input
          name="location"
          type="text"
          placeholder="Localização"
          value={form.location}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleMediaUpload}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Criar Álbum
        </button>
      </form>
    </div>
  );
};

export default CreateAlbum;