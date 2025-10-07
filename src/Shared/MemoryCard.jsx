import React from 'react'

export default function MemoryCard({memory}){
  return (
    <div className="bg-white rounded overflow-hidden shadow-sm">
      <div className="h-48 bg-gray-100 flex items-center justify-center">
        {memory.mediaUrl ? (
          memory.mediaType && memory.mediaType.startsWith('image') ? (
            <img src={memory.mediaUrl} alt={memory.title} className="object-cover w-full h-48" />
          ) : (
            <video src={memory.mediaUrl} className="object-cover w-full h-48" />
          )
        ) : (
          <div className="text-sm text-slate-400">Sem mídia</div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium truncate">{memory.title}</h3>
        <p className="text-xs text-slate-500 truncate">{memory.location} • {new Date(memory.createdAt).toLocaleDateString()}</p>
        <div className="mt-2 text-sm text-slate-700">{memory.description}</div>
      </div>
    </div>
  )
}