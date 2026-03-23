import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Quiz from './pages/Quiz'
import Results from './pages/Results'
import Resource from './pages/Resource'
import Analytics from './pages/Analytics'
import MyProgress from './pages/MyProgress'

function AppShell() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto mb-5 flex w-full max-w-5xl items-center justify-between rounded-full border border-orange-100 bg-white/80 px-5 py-3 text-sm shadow-sm backdrop-blur">
        <Link to="/" className="font-semibold tracking-wide text-slate-700 transition hover:text-teal-700">
          Interview Anxiety Tool
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/my-progress" className="text-teal-700 transition hover:text-teal-800">
            My Progress
          </Link>
          {!isHome ? (
            <Link to="/" className="text-teal-700 transition hover:text-teal-800">
              ← Back to Home
            </Link>
          ) : (
            <span className="text-slate-500">Main page</span>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/results" element={<Results />} />
          <Route path="/resource" element={<Resource />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/my-progress" element={<MyProgress />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
