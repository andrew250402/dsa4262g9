import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { anxietyTypeList } from '../data/anxietyTypes'
import { ensureSessionId } from '../lib/session'
import {
  getCurrentAuthUser,
  hasSupabase,
  signInWithEmail,
  signOutAuth,
  signUpWithEmail,
} from '../lib/supabaseClient'

function Landing() {
  const [mode, setMode] = useState('signin')
  const [showAuthPanel, setShowAuthPanel] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const [authUser, setAuthUser] = useState(null)

  useEffect(() => {
    ensureSessionId()

    async function loadAuthUser() {
      if (!hasSupabase) {
        return
      }

      try {
        const user = await getCurrentAuthUser()
        setAuthUser(user)
      } catch {
        setAuthUser(null)
      }
    }

    loadAuthUser()
  }, [])

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setAuthError('')
    setAuthMessage('')

    if (!email || !password) {
      setAuthError('Please enter both email and password.')
      return
    }

    setAuthLoading(true)
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password)
        const user = await getCurrentAuthUser()
        setAuthUser(user)
        setAuthMessage('Signed in. Your future results are now stored to your account.')
      } else {
        const response = await signUpWithEmail(email, password)
        if (response.user && response.session) {
          setAuthUser(response.user)
          setAuthMessage('Account created and signed in.')
        } else {
          setAuthMessage('Account created. Check your email if confirmation is required, then sign in.')
        }
      }
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleSignOut() {
    setAuthError('')
    setAuthMessage('')
    setAuthLoading(true)
    try {
      await signOutAuth()
      setAuthUser(null)
      setAuthMessage('Signed out. You can continue in anonymous mode.')
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm md:p-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Interview Anxiety Assessment Tool</p>
        <h1 className="mt-3 text-4xl text-slate-900 md:text-6xl">Find out what&apos;s holding you back in interviews.</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-slate-700">
          Complete a short, supportive questionnaire to understand your interview anxiety profile.
          You&apos;ll get a clear score breakdown, a matched practical resource, and a simple way to
          track improvement after your next interview.
        </p>
        <p className="mt-4 font-medium text-orange-700">30 questions · 5 minutes · No sign-up needed</p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          {authUser ? (
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
              Signed in as {authUser.email}
            </span>
          ) : (
            <span className="text-slate-500">Using anonymous mode</span>
          )}

          {hasSupabase ? (
            <button
              type="button"
              onClick={() => setShowAuthPanel((value) => !value)}
              className="cursor-pointer font-semibold text-teal-700 transition hover:text-teal-800 hover:underline"
            >
              {showAuthPanel ? 'Hide account options' : authUser ? 'Manage account' : 'Optional: Sign in / Sign up'}
            </button>
          ) : null}
        </div>

        {hasSupabase ? (
          <div
            aria-hidden={!showAuthPanel}
            className={`overflow-hidden transition-all duration-300 ease-out ${
              showAuthPanel
                ? 'mt-3 max-h-[420px] translate-y-0 opacity-100'
                : 'max-h-0 -translate-y-1 opacity-0 pointer-events-none'
            }`}
          >
            <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
              {!authUser ? (
                <>
                  <p className="text-sm text-slate-600">
                    Sign in only if you want your results tied to your account. Anonymous mode still works.
                  </p>
                  <form onSubmit={handleAuthSubmit} className="mt-3 space-y-3">
                    <div className="inline-flex overflow-hidden rounded-full border border-slate-300 text-sm">
                      <button
                        type="button"
                        onClick={() => setMode('signin')}
                        className={`px-4 py-2 font-semibold ${
                          mode === 'signin' ? 'bg-teal-600 text-white' : 'bg-white text-slate-700'
                        }`}
                      >
                        Sign in
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('signup')}
                        className={`px-4 py-2 font-semibold ${
                          mode === 'signup' ? 'bg-teal-600 text-white' : 'bg-white text-slate-700'
                        }`}
                      >
                        Sign up
                      </button>
                    </div>

                    <div className="grid gap-2 md:grid-cols-3">
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-slate-800"
                        autoComplete="email"
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-slate-800"
                        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      />
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {authLoading
                          ? 'Please wait...'
                          : mode === 'signin'
                            ? 'Sign in'
                            : 'Create account'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-700">
                    Your attempts are saved under <strong>{authUser.email}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={authLoading}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Sign out
                  </button>
                </div>
              )}

              {authMessage ? <p className="mt-2 text-sm text-emerald-700">{authMessage}</p> : null}
              {authError ? <p className="mt-2 text-sm text-rose-700">{authError}</p> : null}
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/quiz"
            className="rounded-full bg-orange-400 px-6 py-3 font-semibold text-white transition hover:bg-orange-500"
          >
            Start the Assessment
          </Link>
          <Link
            to="/my-progress"
            className="rounded-full border border-orange-300 px-6 py-3 font-semibold text-orange-700 transition hover:bg-orange-50"
          >
            View My Progress
          </Link>
          <Link
            to="/analytics"
            className="rounded-full border border-teal-600 px-6 py-3 font-semibold text-teal-700 transition hover:bg-teal-50"
          >
            View Analytics Dashboard
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {anxietyTypeList.map((type, index) => (
          <article
            key={type.code}
            className={`rounded-3xl border border-orange-100 bg-white p-5 shadow-sm md:col-span-1 lg:col-span-2 ${
              anxietyTypeList.length === 5 && index >= 3 ? 'lg:col-span-3' : ''
            }`}
          >
            <p className="text-2xl" aria-hidden="true">{type.icon}</p>
            <h2 className="mt-2 text-2xl text-slate-800">{type.name}</h2>
            <p className="mt-2 text-slate-700">{type.description}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default Landing