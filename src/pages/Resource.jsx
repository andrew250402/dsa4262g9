import { Link, useLocation } from 'react-router-dom'
import ResourceCard from '../components/ResourceCard'
import { anxietyTypes } from '../data/anxietyTypes'
import { getLatestResult } from '../lib/session'

function Resource() {
  const location = useLocation()
  const result = location.state?.result ?? getLatestResult()

  if (!result) {
    return (
      <main className="rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl text-slate-900">No profile found</h1>
        <p className="mt-2 text-slate-700">Complete the assessment to get a matched resource.</p>
        <Link
          to="/quiz"
          className="mt-6 inline-flex rounded-full bg-orange-400 px-6 py-3 font-semibold text-white transition hover:bg-orange-500"
        >
          Start the Assessment
        </Link>
      </main>
    )
  }

  const dominantCodes = result.dominant_types ?? [result.dominant_type]
  const dominantCode = dominantCodes[0]
  const dominantType = anxietyTypes[dominantCode]
  const featuredResource = dominantType?.resources?.primary

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
        <h1 className="text-4xl text-slate-900 md:text-5xl">Your Recommended Next Step</h1>
        <p className="mt-3 text-slate-700">
          Based on your profile, your current focus area is <strong>{dominantType.name}</strong> {dominantType.icon}.
        </p>
        <p className="mt-2 text-slate-700">
          This focused resource is selected for your profile so you can take one practical next step immediately.
        </p>
      </header>

      {featuredResource ? (
        <ResourceCard
          roleLabel="Primary Resource"
          title={featuredResource.title}
          description={featuredResource.description}
          href={featuredResource.url}
          ctaLabel="Access Resource"
          mindlinePowered={Boolean(featuredResource.mindlinePowered)}
        />
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          to="/resources"
          className="inline-flex rounded-full border border-orange-300 px-6 py-3 font-semibold text-orange-700 transition hover:bg-orange-50"
        >
          Browse All Resources
        </Link>
        <Link
          to="/quiz"
          className="inline-flex rounded-full border border-teal-600 px-6 py-3 font-semibold text-teal-700 transition hover:bg-teal-50"
        >
          Retake the Quiz After Your Next Interview →
        </Link>
      </div>
    </main>
  )
}

export default Resource