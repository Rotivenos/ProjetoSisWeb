import React from 'react'
import { Link } from 'react-router-dom'
import MemoryCard from '../shared/MemoryCard'
import useMemories from '../services/useMemories'

export default function Home(){
  const { memories, loading, loadMore, hasMore } = useMemories({limit: 12})

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Descubra memórias</h1>
      (loading && memories.length===0 ? <p>Carregando...</p> : 
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {memories.map(m => (
              <Link to={`/album/${m.id}`} key={m.id}>
                <MemoryCard memory={m} />
              </Link>
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-6">
              <button onClick={loadMore} className="px-4 py-2 bg-indigo-600 text-white rounded">Carregar mais</button>
            </div>
          )}
        </>
      )
    </div>
  )
}