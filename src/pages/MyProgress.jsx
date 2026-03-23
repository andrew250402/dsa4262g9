import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AnalyticsChart from '../components/AnalyticsChart'
import { anxietyTypeList, anxietyTypes } from '../data/anxietyTypes'
import { ensureSessionId, getResultHistory, getSessionIdForUser } from '../lib/session'
import { getCurrentAuthUser, getResultsBySessionId, hasSupabase } from '../lib/supabaseClient'

function formatDate(timestamp) {
  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '-'
  }
}

function scoreFromRow(row, key) {
  return Number(row[`${key}_score`])
}

function scoreTone(score) {
  if (score >= 4) {
    return {
      text: 'text-rose-700',
      bar: 'bg-rose-400',
      badge: 'bg-rose-100 text-rose-800',
    }
  }

  if (score >= 3) {
    return {
      text: 'text-orange-700',
      bar: 'bg-orange-400',
      badge: 'bg-orange-100 text-orange-800',
    }
  }

  return {
    text: 'text-emerald-700',
    bar: 'bg-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800',
  }
}

function MyProgress() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [identityLabel, setIdentityLabel] = useState('Anonymous mode')

  useEffect(() => {
    async function loadProgress() {
      let sessionId = ensureSessionId()
      let label = 'Anonymous mode'
      let authUser = null

      try {
        if (hasSupabase) {
          authUser = await getCurrentAuthUser()
        }

        if (authUser?.id) {
          sessionId = getSessionIdForUser(authUser.id)
          label = authUser.email ?? 'Signed-in account'
          const rows = await getResultsBySessionId(sessionId)
          setIdentityLabel(label)
          setResults(rows)
        } else {
          const localRows = getResultHistory(sessionId)
          setIdentityLabel(label)
          setResults(localRows)
        }
      } catch (requestError) {
        if (authUser?.id) {
          setError(requestError.message)
        } else {
          setIdentityLabel(label)
          setResults(getResultHistory(sessionId))
        }
      } finally {
        setLoading(false)
      }
    }

    loadProgress()
  }, [])

  const series = useMemo(
    () => anxietyTypeList.map((type) => ({ key: type.code, label: type.name.replace(' Anxiety', '') })),
    [],
  )

  const trendData = useMemo(
    () =>
      results.map((row) => ({
        attempt: `Attempt ${row.attempt_number}`,
        communication: Number(row.communication_score),
        appearance: Number(row.appearance_score),
        social: Number(row.social_score),
        performance: Number(row.performance_score),
        behavioural: Number(row.behavioural_score),
      })),
    [results],
  )

  const overallTrend = useMemo(
    () =>
      results.map((row) => {
        const average =
          (Number(row.communication_score) +
            Number(row.appearance_score) +
            Number(row.social_score) +
            Number(row.performance_score) +
            Number(row.behavioural_score)) /
          5

        return {
          attempt: `Attempt ${row.attempt_number}`,
          average: Number(average.toFixed(2)),
        }
      }),
    [results],
  )

  const summary = useMemo(() => {
    if (results.length === 0) {
      return null
    }

    const first = results[0]
    const latest = results[results.length - 1]

    const firstAvg =
      (Number(first.communication_score) +
        Number(first.appearance_score) +
        Number(first.social_score) +
        Number(first.performance_score) +
        Number(first.behavioural_score)) /
      5
    const latestAvg =
      (Number(latest.communication_score) +
        Number(latest.appearance_score) +
        Number(latest.social_score) +
        Number(latest.performance_score) +
        Number(latest.behavioural_score)) /
      5

    return {
      attempts: results.length,
      firstTakenAt: first.taken_at,
      latestTakenAt: latest.taken_at,
      firstAvg: Number(firstAvg.toFixed(2)),
      latestAvg: Number(latestAvg.toFixed(2)),
      delta: Number((latestAvg - firstAvg).toFixed(2)),
    }
  }, [results])

  if (loading) {
    return <main className="text-slate-600">Loading your progress...</main>
  }

  if (error) {
    return (
      <main className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
        <h1 className="text-4xl text-slate-900">My Progress</h1>
        <p className="mt-3 text-rose-700">{error}</p>
        <Link
          to="/quiz"
          className="mt-5 inline-flex rounded-full bg-orange-400 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-500"
        >
          Take Assessment
        </Link>
      </main>
    )
  }

  if (results.length === 0) {
    return (
      <main className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
        <h1 className="text-4xl text-slate-900">My Progress</h1>
        <p className="mt-2 text-sm text-slate-600">Viewing history for: {identityLabel}</p>
        <p className="mt-4 text-slate-700">
          No saved attempts yet for this profile. Take the quiz once and your trend view will appear here.
        </p>
        <Link
          to="/quiz"
          className="mt-5 inline-flex rounded-full bg-orange-400 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-500"
        >
          Start Assessment
        </Link>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
        <h1 className="text-4xl text-slate-900 md:text-5xl">My Progress Over Time</h1>
        <p className="mt-2 text-sm text-slate-600">Viewing history for: {identityLabel}</p>
        {summary ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Attempts</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{summary.attempts}</p>
            </article>
            <article className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">First attempt</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{formatDate(summary.firstTakenAt)}</p>
            </article>
            <article className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Latest attempt</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{formatDate(summary.latestTakenAt)}</p>
            </article>
            <article className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Overall anxiety delta</p>
              <p
                className={`mt-1 text-2xl font-bold ${
                  summary.delta < 0 ? 'text-emerald-700' : summary.delta > 0 ? 'text-rose-700' : 'text-slate-700'
                }`}
              >
                {summary.delta >= 0 ? '+' : ''}
                {summary.delta.toFixed(2)}
              </p>
            </article>
          </div>
        ) : null}

        {results.length === 1 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3">
            <p className="text-sm text-slate-700">
              You&apos;ve completed your first check-in. Retake after your next interview to unlock trend insights.
            </p>
            <Link
              to="/quiz"
              className="inline-flex rounded-full border border-teal-600 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
            >
              Retake Quiz
            </Link>
          </div>
        ) : null}
      </header>

      <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
        <h2 className="text-3xl text-slate-900">Overall Anxiety Trend</h2>
        <p className="mt-1 text-sm text-slate-600">Lower values indicate improvement.</p>
        <div className="mt-4 h-80">
          <AnalyticsChart
            type="line"
            data={overallTrend}
            xKey="attempt"
            series={[{ key: 'average', label: 'Average Anxiety Score' }]}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
        <h2 className="text-3xl text-slate-900">Anxiety Type Trends</h2>
        <p className="mt-1 text-sm text-slate-600">Track how each anxiety type changes across your attempts.</p>
        <div className="mt-4 h-80">
          <AnalyticsChart type="line" data={trendData} xKey="attempt" series={series} />
        </div>
      </section>

      <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
        <h2 className="text-3xl text-slate-900">Attempt History</h2>
        <div className="mt-4 grid gap-3">
          {results
            .slice()
            .reverse()
            .map((row) => (
              <article key={row.id} className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
                      Attempt {row.attempt_number}
                    </span>
                    <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-800">
                      {anxietyTypes[row.dominant_type]?.name ?? row.dominant_type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{formatDate(row.taken_at)}</p>
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-5">
                  {anxietyTypeList.map((type) => {
                    const score = scoreFromRow(row, type.code)
                    const tone = scoreTone(score)
                    const shortName = type.name.replace(' Anxiety', '')

                    return (
                      <div key={type.code} className="rounded-xl border border-orange-100 bg-white p-3">
                        <p className="text-xs font-medium text-slate-600">{shortName}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <p className={`text-sm font-bold ${tone.text}`}>{score.toFixed(2)}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.badge}`}>
                            {score >= 4 ? 'High' : score >= 3 ? 'Moderate' : 'Low'}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-orange-100">
                          <div
                            className={`h-full rounded-full ${tone.bar}`}
                            style={{ width: `${Math.min(100, Math.max(0, (score / 5) * 100))}%` }}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </article>
            ))}
        </div>
      </section>

      <Link
        to="/quiz"
        className="inline-flex rounded-full border border-teal-600 px-6 py-3 font-semibold text-teal-700 transition hover:bg-teal-50"
      >
        Retake the Quiz
      </Link>
    </main>
  )
}

export default MyProgress