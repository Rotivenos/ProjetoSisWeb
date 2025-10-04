import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../services/auth'

export default function Login(){
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({username:'', password:'', email:''})
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    try{
      if(mode==='signin'){
        await signIn(form.username, form.password)
        nav('/')
      }else{
        await signUp(form)
        alert('Registrado. Confirme seu e-mail e faça login.')
        setMode('signin')
      }
    }catch(err){ console.error(err); alert(err.message || 'Erro') }
    finally{ setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{mode==='signin' ? 'Entrar' : 'Registrar'}</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="Usuário" className="w-full p-2 border rounded" />
        {mode==='signup' && (
          <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="E-mail" className="w-full p-2 border rounded" />
        )}
        <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Senha" className="w-full p-2 border rounded" />
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Aguarde...' : (mode==='signin' ? 'Entrar' : 'Registrar')}</button>
          <button type="button" onClick={()=>setMode(mode==='signin'?'signup':'signin')} className="px-4 py-2 border rounded">{mode==='signin' ? 'Criar conta' : 'Já tenho conta'}</button>
        </div>
      </form>
    </div>
  )
}