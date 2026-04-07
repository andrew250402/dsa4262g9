import { useEffect, useMemo, useState } from 'react'
import AnalyticsChart from '../components/AnalyticsChart'
import InfoHint from '../components/InfoHint'
import { anxietyTypeList } from '../data/anxietyTypes'
import { getAllResults, hasSupabase } from '../lib/supabaseClient'

const timeFilters = [
  { value: 'all', label: 'All time' },
  { value: '30', label: 'Last 30 days' },
  { value: '7', label: 'Last 7 days' },
]

function getTypeScore(row, typeCode) {
  return Number(row[`${typeCode}_score`])
}

function Analytics() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeFilter, setTimeFilter] = useState('all')
  const [granularity, setGranularity] = useState('week')

  useEffect(() => {
    async function load() {
      if (!hasSupabase) {
        setLoading(false)
        return
      }

      try {
        const data = await getAllResults()
        setResults(data)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filteredResults = useMemo(() => {
    if (timeFilter === 'all') {
      return results
    }

    const days = Number(timeFilter)
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    return results.filter((row) => new Date(row.taken_at).getTime() >= cutoff)
  }, [results, timeFilter])

  const trendData = useMemo(() => {
    const startsBySession = filteredResults.reduce((acc, row) => {
      const sessionId = row.session_id
      const timestamp = new Date(row.taken_at).getTime()
      acc[sessionId] = acc[sessionId] == null ? timestamp : Math.min(acc[sessionId], timestamp)
      return acc
    }, {})

    const buckets = new Map()

    for (const row of filteredResults) {
      const sessionStart = startsBySession[row.session_id]
      const current = new Date(row.taken_at).getTime()
      const elapsedDays = Math.max(0, Math.floor((current - sessionStart) / 86400000))
      const relativeIndex =
        granularity === 'month' ? Math.floor(elapsedDays / 30) : Math.floor(elapsedDays / 7)
      const key = relativeIndex

      if (!buckets.has(key)) {
        buckets.set(key, { count: 0 })
      }

      const bucket = buckets.get(key)
      bucket.count += 1

      for (const type of anxietyTypeList) {
        bucket[type.code] = (bucket[type.code] ?? 0) + getTypeScore(row, type.code)
      }
    }

    return [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([relativeIndex, values]) => {
        const periodLabel = granularity === 'month' ? `Month +${relativeIndex}` : `Week +${relativeIndex}`
        const point = { period: periodLabel }
        for (const type of anxietyTypeList) {
          point[type.code] = Number((values[type.code] / values.count).toFixed(2))
        }
        return point
      })
  }, [filteredResults, granularity])

  const returningUsersComparison = useMemo(() => {
    const grouped = filteredResults.reduce((groups, row) => {
      const sessionId = row.session_id
      groups[sessionId] = groups[sessionId] ?? []
      groups[sessionId].push(row)
      return groups
    }, {})

    const returning = Object.values(grouped)
      .filter((attempts) => attempts.length >= 2)
      .map((attempts) => [...attempts].sort((a, b) => a.attempt_number - b.attempt_number))

    if (returning.length === 0) {
      return anxietyTypeList.map((type) => ({
        type: type.name.replace(' Anxiety', ''),
        before: 0,
        after: 0,
      }))
    }

    return anxietyTypeList.map((type) => {
      const before =
        returning.reduce((sum, attempts) => sum + getTypeScore(attempts[0], type.code), 0) /
        returning.length
      const after =
        returning.reduce(
          (sum, attempts) => sum + getTypeScore(attempts[attempts.length - 1], type.code),
          0,
        ) / returning.length

      return {
        type: type.name.replace(' Anxiety', ''),
        before: Number(before.toFixed(2)),
        after: Number(after.toFixed(2)),
      }
    })
  }, [filteredResults])

  const participantMetrics = useMemo(() => {
    const uniqueParticipants = new Set(filteredResults.map((row) => row.session_id)).size

    const groupedBySession = filteredResults.reduce((groups, row) => {
      const sessionId = row.session_id
      groups[sessionId] = groups[sessionId] ?? 0
      groups[sessionId] += 1
      return groups
    }, {})

    const returningParticipants = Object.values(groupedBySession).filter((count) => count >= 2).length
    const averageAttemptsPerParticipant =
      uniqueParticipants === 0 ? 0 : Number((filteredResults.length / uniqueParticipants).toFixed(2))

    return {
      totalAssessments: filteredResults.length,
      uniqueParticipants,
      returningParticipants,
      returningRate:
        uniqueParticipants === 0
          ? 0
          : Number(((returningParticipants / uniqueParticipants) * 100).toFixed(1)),
      averageAttemptsPerParticipant,
    }
  }, [filteredResults])

  if (!hasSupabase) {
    return (
      <main className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
        <h1 className="text-4xl text-slate-900">Analytics Dashboard</h1>
        <p className="mt-3 text-slate-700">
          Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to a <code>.env.local</code>
          file to enable live public analytics.
        </p>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
        <h1 className="flex items-center gap-2 text-4xl text-slate-900">
          Public Analytics Dashboard
          <InfoHint
            label="Why global dashboard"
            text="This view demonstrates aggregate impact across all users for investors. It shows trends without exposing personal identities."
          />
        </h1>
        <p className="mt-3 text-slate-700">All data is anonymised. No personal information is collected.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {timeFilters.map((filter) => (
            <button
              type="button"
              key={filter.value}
              onClick={() => setTimeFilter(filter.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                timeFilter === filter.value
                  ? 'bg-teal-600 text-white'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      {loading ? <p className="text-slate-600">Loading analytics...</p> : null}
      {error ? <p className="text-red-700">Error loading analytics: {error}</p> : null}

      {!loading && !error ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
                Total Assessments
                <InfoHint
                  label="Why total assessments"
                  text="Shows overall adoption volume. Investors use this as a baseline for traction and funnel completion."
                />
              </p>
              <p className="mt-2 text-3xl font-bold text-teal-700">{participantMetrics.totalAssessments}</p>
            </article>

            <article className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
                Participants
                <InfoHint
                  label="Why participants"
                  text="Counts unique users to separate true reach from repeat attempts by the same person."
                />
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{participantMetrics.uniqueParticipants}</p>
            </article>

            <article className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
                Returning Participants
                <InfoHint
                  label="Why returning participants"
                  text="Signals retention and whether users find enough value to come back for another assessment cycle."
                />
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{participantMetrics.returningParticipants}</p>
              <p className="mt-1 text-sm text-slate-600">{participantMetrics.returningRate}% of participants</p>
            </article>

            <article className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
                Avg Attempts / Participant
                <InfoHint
                  label="Why average attempts"
                  text="Measures depth of engagement per user. Higher values indicate stronger habit and follow-up behavior."
                />
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {participantMetrics.averageAttemptsPerParticipant.toFixed(2)}
              </p>
            </article>
          </section>

          <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-3xl text-slate-900">
                  Score Over Time
                  <InfoHint
                    label="Why score over time chart"
                    text="This chart tracks average anxiety trends relative to each participant's first attempt, making progress comparable despite different start dates."
                  />
                </h2>
                <p className="mt-1 text-sm text-slate-600">Relative to each participant&apos;s first assessment.</p>
              </div>
              <div className="inline-flex overflow-hidden rounded-full border border-slate-300 text-sm">
                <button
                  type="button"
                  onClick={() => setGranularity('week')}
                  className={`px-4 py-2 ${
                    granularity === 'week' ? 'bg-teal-600 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  Week
                </button>
                <button
                  type="button"
                  onClick={() => setGranularity('month')}
                  className={`px-4 py-2 ${
                    granularity === 'month' ? 'bg-teal-600 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  Month
                </button>
              </div>
            </div>
            <div className="mt-4 h-80">
              <AnalyticsChart
                type="line"
                data={trendData}
                xKey="period"
                series={anxietyTypeList.map((type) => ({ key: type.code, label: type.name.replace(' Anxiety', '') }))}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-3xl text-slate-900">
              Returning Users: Before vs After
              <InfoHint
                label="Why before after chart"
                text="This chart highlights whether users who return show lower anxiety scores, which is a direct signal of repeated engagement and improvement."
              />
            </h2>
            <div className="mt-4 h-80">
              <AnalyticsChart
                type="bar"
                data={returningUsersComparison}
                xKey="type"
                series={[
                  { key: 'before', label: 'Before' },
                  { key: 'after', label: 'After' },
                ]}
              />
            </div>
          </section>
        </>
      ) : null}
    </main>
  )
}

export default Analytics