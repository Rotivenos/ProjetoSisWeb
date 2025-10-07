import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import useMemories from '../services/useMemories'
import Lightbox from '../shared/Lightbox'

export default function Album(){
  const { id } = useParams()
  const { getMemoryById } = useMemories()
  const memory = getMemoryById(id)
  const [open, setOpen] = useState(false)

  if(!memory) return <p>Carregando...</p>

  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h1 className="text-2xl font-semibold">{memory.title}</h1>
      <p className="text-sm text-slate-500 mb-4">{memory.location} • {new Date(memory.createdAt).toLocaleDateString()}</p>
      {memory.mediaUrl && (
        <div className="mb-4 cursor-pointer" onClick={()=>setOpen(true)}>
          {memory.mediaType.startsWith('image') ? (
            <img src={memory.mediaUrl} alt={memory.title} className="w-full rounded" />
          ) : (
            <video controls src={memory.mediaUrl} className="w-full rounded" />
          )}
        </div>
      )}

      <p className="mb-4">{memory.description}</p>

      <div className="flex gap-4">
        <button className="px-3 py-1 border rounded">Curtir ({memory.likes || 0})</button>
        <button className="px-3 py-1 border rounded">Comentar ({(memory.comments && memory.comments.length) || 0})</button>
      </div>

      <Lightbox open={open} onClose={()=>setOpen(false)} items={[memory]} startIndex={0} />
    </div>
  )
}