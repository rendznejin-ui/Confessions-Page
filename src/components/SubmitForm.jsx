import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from './ToastContext'
import { getCategoryEmoji } from './CategoryFilter'

const CATEGORIES = ['general', 'crush', 'rant', 'advice', 'funny', 'regret', 'secret', 'gratitude']
const MAX_LENGTH = 2000

export default function SubmitForm() {
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('general')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { addToast } = useToast()
  const navigate = useNavigate()

  const charCount = body.length
  const charClass = charCount > MAX_LENGTH * 0.9 ? 'danger' : charCount > MAX_LENGTH * 0.7 ? 'warning' : ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!body.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/confessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim(), category }),
      })

      if (res.ok) {
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          navigate('/')
        }, 2000)
      } else {
        const err = await res.json()
        addToast(err.error || err.reason || 'Failed to submit', 'error')
      }
    } catch (err) {
      addToast('Network error. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="success-overlay">
        <div className="success-content">
          <div className="success-icon">🕊️</div>
          <div className="success-text">Confession Sent</div>
          <div className="success-subtext">Your anonymous confession is now live.</div>
        </div>
      </div>
    )
  }

  return (
    <form className="submit-form slide-up" onSubmit={handleSubmit} id="confession-form">
      <div className="form-group">
        <label className="form-label">Your Confession</label>
        <textarea
          className="form-textarea"
          placeholder="What's on your mind? This is completely anonymous..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={MAX_LENGTH}
          id="confession-textarea"
        />
        <div className={`char-count ${charClass}`}>
          {charCount} / {MAX_LENGTH}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Category</label>
        <div className="category-selector">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              className={`category-option ${category === cat ? 'selected' : ''}`}
              onClick={() => setCategory(cat)}
              id={`category-${cat}`}
            >
              {getCategoryEmoji(cat)} {cat}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="submit-btn"
        disabled={!body.trim() || submitting}
        id="submit-confession-btn"
      >
        {submitting ? 'Posting Anonymously...' : '🕊️ Confess Anonymously'}
      </button>

      <div className="privacy-banner" style={{ marginTop: 'var(--space-lg)' }}>
        <span className="shield-icon">🛡️</span>
        No login • No tracking • No IP stored • Fully anonymous
      </div>
    </form>
  )
}
