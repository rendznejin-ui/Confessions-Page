import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import Feed from './pages/Feed'
import Submit from './pages/Submit'
import About from './pages/About'
import { ToastProvider } from './components/ToastContext'

export default function App() {
  return (
    <ToastProvider>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
      <Toast />
    </ToastProvider>
  )
}
