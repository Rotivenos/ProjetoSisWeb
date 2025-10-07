import React, { useEffect } from 'react'

export default function Lightbox({open, onClose, items=[], startIndex=0}){
  useEffect(()=>{
    function onKey(e){ if(e.key==='Escape') onClose() }
    if(open) window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[open])

  if(!open) return null

  const item = items[startIndex]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="max-w-4xl w-full p-4" onClick={(e)=>e.stopPropagation()}>
        <div className="bg-white rounded overflow-hidden p-4">
          <div className="flex justify-end"><button onClick={onClose} className="text-sm">Fechar</button></div>
          <div className="mt-2">
            {item.mediaType.startsWith('image') ? (
              <img src={item.mediaUrl} alt={item.title} className="w-full max-h-[70vh] object-contain" />
            ) : (
              <video controls src={item.mediaUrl} className="w-full max-h-[70vh]" />
            )}
            <h3 className="mt-3 font-semibold">{item.title}</h3>
            <p className="text-sm text-slate-600">{item.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}