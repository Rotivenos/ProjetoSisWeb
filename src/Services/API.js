const baseUrl = import.meta.env.VITE_API_BASE || 'https://api.example.com'

async function jsonFetch(path, opts={}){
  const res = await fetch(baseUrl + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  })
  if(!res.ok) throw new Error('API error')
  return res.json()
}

export default {
  requestUpload: (meta) => jsonFetch('/memories/request-upload', { method: 'POST', body: JSON.stringify(meta) }),
  // Upload to S3 using Fetch (no progress)
  uploadToS3: async (uploadUrl, file) => {
    const res = await fetch(uploadUrl, { method: 'PUT', body: file })
    if(!res.ok) throw new Error('S3 upload failed')
    return true
  },
  // Upload with progress (XHR) for better UX
  uploadToS3WithProgress: (uploadUrl, file, onProgress) => new Promise((resolve, reject)=>{
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.upload.onprogress = (e)=>{
      if(e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = ()=> xhr.status >=200 && xhr.status<300 ? resolve(true) : reject(new Error('S3 upload failed'))
    xhr.onerror = ()=> reject(new Error('S3 upload error'))
    xhr.send(file)
  }),
  confirmUpload: (payload) => jsonFetch('/memories/confirm-upload', { method: 'POST', body: JSON.stringify(payload) }),
  listMemories: (params) => {
    const qs = params ? ('?' + new URLSearchParams(params).toString()) : ''
    return jsonFetch('/memories' + qs)
  },
}