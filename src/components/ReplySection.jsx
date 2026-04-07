import { useState } from 'react'
import { useToast } from './ToastContext'

export default function ReplySection({ confessionId, replyCount }) {
  const [expanded, setExpanded] = useState(false)
  const [replies, setReplies] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [count, setCount] = useState(replyCount || 0)
  const { addToast } = useToast()

  const loadReplies = async () => {
    if (loaded) {
      setExpanded(!expanded)
      return
    }

    try {
      const res = await fetch(`/api/confessions/${confessionId}`)
      if (res.ok) {
        const data = await res.json()
        setReplies(data.replies || [])
        setLoaded(true)
        setExpanded(true)
      }
    } catch (err) {
      addToast('Failed to load replies', 'error')
    }
  }

  const handleSubmitReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/confessions/${confessionId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: replyText.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        setReplies(prev => [...prev, data])
        setReplyText('')
        setCount(prev => prev + 1)
        addToast('Reply posted anonymously ✓', 'success')
      } else {
        const err = await res.json()
        addToast(err.error || 'Failed to post reply', 'error')
      }
    } catch (err) {
      addToast('Network error', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="replies-section">
      <button className="replies-toggle" onClick={loadReplies}>
        <span>{expanded ? '▾' : '▸'}</span>
        <span>{count} {count === 1 ? 'reply' : 'replies'}</span>
      </button>

      {expanded && (
        <div className="fade-in">
          {replies.length === 0 && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
              No replies yet. Be the first!
            </p>
          )}

          {replies.map(reply => (
            <div key={reply.id} className="reply-item fade-in">
              <div className="reply-body">{reply.body}</div>
              <div className="reply-time">{getTimeAgo(reply.created_at)}</div>
            </div>
          ))}

          <form className="reply-form" onSubmit={handleSubmitReply}>
            <input
              type="text"
              placeholder="Reply anonymously..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              maxLength={500}
              id={`reply-input-${confessionId}`}
            />
            <button type="submit" disabled={submitting || !replyText.trim()}>
              {submitting ? '...' : 'Reply'}
            </button>
          </form>
        </div>
      )}
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
  return `${Math.floor(seconds / 86400)}d ago`
}
