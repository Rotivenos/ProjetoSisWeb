import React, { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../services/auth'

export default function CreateMemory(){
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  async function handleSubmit(e){
    e.preventDefault()
    if(!user){ alert('Você precisa entrar para enviar memória'); return }
    if(!file){ alert('Adicione uma foto ou vídeo'); return }
    setUploading(true)
    setProgress(0)
    try{
      const meta = {title, description, location, mediaType: file.type}
      const { uploadUrl, memoryId, s3Key } = await api.requestUpload(meta)

      // Upload with progress (XHR)
      await api.uploadToS3WithProgress(uploadUrl, file, (p)=>setProgress(p))

      await api.confirmUpload({ memoryId, s3Key })

      alert('Memória enviada — será processada em breve')
      setTitle(''); setDescription(''); setLocation(''); setFile(null); setProgress(0)
    }catch(err){ console.error(err); alert('Erro ao enviar') }
    finally{ setUploading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Criar Memória</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título" className="w-full p-2 border rounded" />
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Descrição" className="w-full p-2 border rounded" rows={4} />
        <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Localização (opcional)" className="w-full p-2 border rounded" />
        <input type="file" accept="image/*,video/*" onChange={e=>setFile(e.target.files[0])} />

        {file && (
          <div className="p-2 bg-slate-50 rounded">
            <div className="text-sm">Arquivo: {file.name} ({Math.round(file.size/1024)} KB)</div>
            <div className="text-xs">Tipo: {file.type}</div>
          </div>
        )}

        {uploading && (
          <div className="w-full bg-slate-200 rounded h-3 overflow-hidden">
            <div className="h-3 rounded" style={{width: `${progress}%`, background: 'linear-gradient(90deg,#4f46e5,#06b6d4)'}}></div>
          </div>
        )}

        <div className="flex gap-2">
          <button type="submit" disabled={uploading} className="px-4 py-2 bg-indigo-600 text-white rounded">{uploading ? 'Enviando...' : 'Enviar'}</button>
        </div>
      </form>
    </div>
  )
}