export default function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <div className="category-filter">
      <button
        className={`filter-chip ${!selected ? 'active' : ''}`}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          className={`filter-chip ${selected === cat ? 'active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {getCategoryEmoji(cat)} {cat}
        </button>
      ))}
    </div>
  )
}

export function getCategoryEmoji(category) {
  const emojis = {
    general: '💬',
    crush: '💕',
    rant: '🔥',
    advice: '💡',
    funny: '😂',
    regret: '😔',
    secret: '🤫',
    gratitude: '🙏',
  }
  return emojis[category] || '💬'
}
