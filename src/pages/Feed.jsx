import { useState, useEffect, useRef, useCallback } from 'react'
import ConfessionCard from '../components/ConfessionCard'
import CategoryFilter from '../components/CategoryFilter'
import { useToast } from '../components/ToastContext'

const CATEGORIES = ['general', 'crush', 'rant', 'advice', 'funny', 'regret', 'secret', 'gratitude']

// Generate a session-level ID for reaction dedup (not persisted, not tracking)
const sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)

export default function Feed() {
  const [confessions, setConfessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('latest')
  const [category, setCategory] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const { addToast } = useToast()
  const observerRef = useRef()

  const fetchConfessions = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)

    try {
      const params = new URLSearchParams({ sort, page: pageNum })
      if (category) params.set('category', category)

      const res = await fetch(`/api/confessions?${params}`)
      if (res.ok) {
        const data = await res.json()
        if (append) {
          setConfessions(prev => [...prev, ...data.confessions])
        } else {
          setConfessions(data.confessions)
        }
        setTotalPages(data.pagination.totalPages)
      } else {
        addToast('Failed to load confessions', 'error')
      }
    } catch (err) {
      addToast('Network error', 'error')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [sort, category, addToast])

  // Reset and fetch on sort/category change
  useEffect(() => {
    setPage(1)
    fetchConfessions(1)
  }, [sort, category, fetchConfessions])

  // Infinite scroll
  const lastCardRef = useCallback((node) => {
    if (loadingMore) return
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && page < totalPages) {
        const nextPage = page + 1
        setPage(nextPage)
        fetchConfessions(nextPage, true)
      }
    })

    if (node) observerRef.current.observe(node)
  }, [loadingMore, page, totalPages, fetchConfessions])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Anonymous Confessions</h1>
        <p className="page-subtitle">Share your truth. No judgment. No tracking. Just honesty.</p>
      </div>

      <div className="privacy-banner">
        <span className="shield-icon">🛡️</span>
        You are completely anonymous — no login, no cookies, no IP stored
      </div>

      <div className="sort-toggle">
        <button
          className={`sort-btn ${sort === 'latest' ? 'active' : ''}`}
          onClick={() => setSort('latest')}
          id="sort-latest"
        >
          🕐 Latest
        </button>
        <button
          className={`sort-btn ${sort === 'trending' ? 'active' : ''}`}
          onClick={() => setSort('trending')}
          id="sort-trending"
        >
          🔥 Trending
        </button>
      </div>

      <CategoryFilter
        categories={CATEGORIES}
        selected={category}
        onSelect={setCategory}
      />

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : confessions.length === 0 ? (
        <div className="empty-state fade-in">
          <div className="empty-icon">📭</div>
          <p>No confessions yet. Be the first to share.</p>
        </div>
      ) : (
        <>
          {confessions.map((confession, index) => (
            <div
              key={confession.id}
              ref={index === confessions.length - 1 ? lastCardRef : null}
            >
              <ConfessionCard
                confession={confession}
                sessionId={sessionId}
              />
            </div>
          ))}
          {loadingMore && (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
