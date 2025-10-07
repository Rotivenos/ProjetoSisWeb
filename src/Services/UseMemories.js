import { useEffect, useState } from 'react'
import api from './api'

export default function useMemories({limit=20, filters={}} = {}){
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  async function load(params = {}, append=false){
    setLoading(true)
    try{
      const query = { limit, page, ...params }
      const data = await api.listMemories(query)
      const items = data.items || []
      setMemories(prev => append ? [...prev, ...items] : items)
      setHasMore(!!data.nextPage)
    }catch(err){ console.error(err); setMemories([]) }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ load(filters, false) }, [])

  function refetch(newFilters){ setPage(0); load(newFilters, false) }

  async function loadMore(){
    setPage(p => p+1)
    // wait for page update before loading; simple approach:
    const nextPage = page + 1
    try{
      const data = await api.listMemories({ limit, page: nextPage, ...filters })
      setMemories(prev => [...prev, ...(data.items || [])])
      setHasMore(!!data.nextPage)
      setPage(nextPage)
    }catch(err){ console.error(err) }
  }

  return {
    memories,
    loading,
    refetch,
    loadMore,
    hasMore,
    getMemoryById: (id) => memories.find(m => m.id === id) || null
  }
}