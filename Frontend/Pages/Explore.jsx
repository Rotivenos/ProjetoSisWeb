import React, { useState } from 'react'
import MemoryCard from '../shared/MemoryCard'
import useMemories from '../services/useMemories'

export default function Explore(){
  const [filters, setFilters] = useState({theme: '', location: '', q: ''})
  const { memories, loading, refetch, loadMore, hasMore } = useMemories({filters, limit: 12})

  function apply(){ refetch(filters) }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Explorar</h1>

      <div className="bg-white p-4 rounded-md shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input placeholder="Palavra-chave" value={filters.q} onChange={e=>setFilters({...filters,q:e.target.value})} className="p-2 border rounded" />
        <input placeholder="Tema (ex: viagem)" value={filters.theme} onChange={e=>setFilters({...filters,theme:e.target.value})} className="p-2 border rounded" />
        <input placeholder="Localização" value={filters.location} onChange={e=>setFilters({...filters,location:e.target.value})} className="p-2 border rounded" />
        <div className="sm:col-span-3 flex gap-2 mt-2">
          <button onClick={apply} className="px-4 py-2 bg-indigo-600 text-white rounded">Aplicar</button>
          <button onClick={()=>{setFilters({theme:'',location:'',q:''}); refetch({})}} className="px-4 py-2 border rounded">Limpar</button>
        </div>
      </div>

      {loading && memories.length===0 ? <p>Carregando...</p> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {memories.map(m => <MemoryCard memory={m} key={m.id} />)}
          </div>
          {hasMore && (
            <div className="text-center mt-6">
              <button onClick={loadMore} className="px-4 py-2 bg-indigo-600 text-white rounded">Carregar mais</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}