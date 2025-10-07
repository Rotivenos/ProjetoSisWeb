import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Explore from './Pages/Explore';
import CreateMemory from './Pages/CreateMemory';
import Album from './Pages/Album';
import Login from './Pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/create" element={<CreateMemory />} />
        <Route path="/album/:id" element={<Album />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl">Memories</Link>
          <nav className="space-x-4 flex items-center">
            <Link to="/explore" className="hover:underline">Explorar</Link>
            {user ? (
              <>
                <Link to="/create" className="px-3 py-1 bg-indigo-600 text-white rounded-md">Criar</Link>
                <button onClick={signOut} className="ml-2 text-sm">Sair</button>
              </>
            ) : (
              <Link to="/login" className="px-3 py-1 border rounded">Entrar</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/explore" element={<Explore/>} />
          <Route path="/create" element={<CreateMemory/>} />
          <Route path="/album/:id" element={<Album/>} />
          <Route path="/login" element={<Login/>} />
        </Routes>
      </main>

      <footer className="text-center py-6 text-sm text-slate-500">© {new Date().getFullYear()} Memories</footer>
    </div>
  )