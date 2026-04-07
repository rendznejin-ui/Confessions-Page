import { useState } from 'react'
import { getCategoryEmoji } from './CategoryFilter'
import ReplySection from './ReplySection'

export default function ConfessionCard({ confession, sessionId, onLikeUpdate }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(confession.likes)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/confessions/${confession.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setLikes(data.likes)
        if (data.liked) {
          setIsAnimating(true)
          setTimeout(() => setIsAnimating(false), 400)
        }
        if (onLikeUpdate) onLikeUpdate(confession.id, data.likes)
      }
    } catch (err) {
      console.error('Failed to react:', err)
    }
  }

  const timeAgo = getTimeAgo(confession.created_at)

  return (
    <div className="confession-card fade-in" id={`confession-${confession.id}`}>
      <div className="confession-card-header">
        <div className="confession-meta">
          <span className={`category-badge ${confession.category}`}>
            {getCategoryEmoji(confession.category)} {confession.category}
          </span>
        </div>
        <span className="confession-time">{timeAgo}</span>
      </div>

      <div className="confession-body">{confession.body}</div>

      <div className="confession-actions">
        <button
          className={`action-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          id={`like-btn-${confession.id}`}
        >
          <span className={`icon ${isAnimating ? 'animating' : ''}`}>
            {liked ? '❤️' : '🤍'}
          </span>
          <span>{likes}</span>
        </button>

        <button className="action-btn replies-toggle-btn" id={`reply-toggle-${confession.id}`}>
          <span className="icon">💬</span>
          <span>{confession.reply_count || 0}</span>
        </button>
      </div>

      <ReplySection confessionId={confession.id} replyCount={confession.reply_count} />
    </div>
  )
}

function getTimeAgo(dateStr) {
  const date = new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z'))
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}
