function InfoHint({ label = 'More info', text }) {
  return (
    <span className="group relative inline-flex shrink-0 align-middle">
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-xs font-bold text-teal-700 transition hover:border-teal-500 hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
      >
        i
      </button>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-80 -translate-x-1/2 rounded-xl border border-orange-100 bg-white px-3 py-3 text-left normal-case tracking-normal opacity-0 shadow-lg transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Why this matters</span>
        <span className="mt-1 block text-sm font-normal leading-relaxed text-slate-700">{text}</span>
      </span>
    </span>
  )
}

export default InfoHint