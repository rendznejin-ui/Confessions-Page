import { useToast } from './ToastContext'

export default function Toast() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast ${toast.type} ${toast.exiting ? 'exiting' : ''}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
