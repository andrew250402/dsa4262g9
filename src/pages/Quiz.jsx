import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar'
import QuestionCard from '../components/QuestionCard'
import { likertOptions, questions } from '../data/questions'
import { computeAssessment } from '../lib/scoring'
import {
  appendResultToHistory,
  ensureSessionId,
  getNextLocalAttemptNumber,
  getSessionIdForUser,
  saveLatestResult,
} from '../lib/session'
import { getCurrentAuthUser, getNextAttemptNumber, hasSupabase, insertQuizResult } from '../lib/supabaseClient'

function Quiz() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState(Array(questions.length).fill(null))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [incompleteNotice, setIncompleteNotice] = useState('')
  const [selectionPulse, setSelectionPulse] = useState({
    questionIndex: -1,
    value: null,
    token: 0,
  })
  const advanceTimeoutRef = useRef(null)

  const isLastQuestion = currentIndex === questions.length - 1

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    function onKeyDown(event) {
      if (isSaving || isAdvancing) {
        return
      }

      const targetTag = event.target?.tagName?.toLowerCase()
      if (targetTag === 'input' || targetTag === 'textarea' || event.target?.isContentEditable) {
        return
      }

      if (/^[1-5]$/.test(event.key)) {
        event.preventDefault()
        handleSelect(Number(event.key))
        return
      }

      if (event.key === 'Backspace' && currentIndex > 0) {
        event.preventDefault()
        handleBack()
        return
      }

      if (event.key === 'Enter') {
        const currentAnswer = answers[currentIndex]
        if (currentAnswer == null) {
          return
        }

        event.preventDefault()
        if (isLastQuestion) {
          handleSubmit()
        } else {
          handleNext()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [answers, currentIndex, isAdvancing, isLastQuestion, isSaving])

  function handleSelect(value) {
    if (isSaving || isAdvancing) {
      return
    }

    setIncompleteNotice('')
    setSelectionPulse({
      questionIndex: currentIndex,
      value,
      token: Date.now(),
    })

    setAnswers((previous) => {
      const next = [...previous]
      next[currentIndex] = value
      return next
    })

    if (!isLastQuestion) {
      setIsAdvancing(true)
      advanceTimeoutRef.current = setTimeout(() => {
        setCurrentIndex((previous) => Math.min(previous + 1, questions.length - 1))
        setIsAdvancing(false)
        advanceTimeoutRef.current = null
      }, 220)
    }
  }

  function handleBack() {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current)
      advanceTimeoutRef.current = null
    }
    setIsAdvancing(false)
    setIncompleteNotice('')
    setCurrentIndex((previous) => Math.max(previous - 1, 0))
  }

  function handleNext() {
    if (isSaving || isAdvancing || isLastQuestion || answers[currentIndex] == null) {
      return
    }

    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current)
      advanceTimeoutRef.current = null
    }

    setIsAdvancing(true)
    advanceTimeoutRef.current = setTimeout(() => {
      setCurrentIndex((previous) => Math.min(previous + 1, questions.length - 1))
      setIsAdvancing(false)
      advanceTimeoutRef.current = null
    }, 180)
  }

  async function handleSubmit() {
    if (answers.some((answer) => answer == null)) {
      const firstMissing = answers.findIndex((answer) => answer == null)
      setCurrentIndex(firstMissing)
      setIncompleteNotice(`Please answer question ${firstMissing + 1} before viewing results.`)
      return
    }

    setIncompleteNotice('')

    const assessment = computeAssessment(answers)
    let sessionId = ensureSessionId()
    let attemptNumber = getNextLocalAttemptNumber(sessionId)
    let saveError = null

    try {
      if (hasSupabase) {
        const authUser = await getCurrentAuthUser()
        if (authUser?.id) {
          sessionId = getSessionIdForUser(authUser.id)
          attemptNumber = getNextLocalAttemptNumber(sessionId)
        }
        attemptNumber = await getNextAttemptNumber(sessionId)
      }
    } catch (error) {
      saveError = error.message
    }

    const dbPayload = {
      session_id: sessionId,
      attempt_number: attemptNumber,
      taken_at: new Date().toISOString(),
      communication_score: assessment.scores.communication,
      appearance_score: assessment.scores.appearance,
      social_score: assessment.scores.social,
      performance_score: assessment.scores.performance,
      behavioural_score: assessment.scores.behavioural,
      dominant_type: assessment.dominantType,
      raw_responses: answers.reduce((result, value, index) => {
        result[`Q${index + 1}`] = value
        return result
      }, {}),
    }

    const localResult = {
      ...dbPayload,
      dominant_types: assessment.dominantTypes,
    }

    setIsSaving(true)
    try {
      if (hasSupabase) {
        await insertQuizResult(dbPayload)
      }
      appendResultToHistory(sessionId, localResult)
      saveLatestResult(localResult)
      navigate('/results', { state: { result: localResult, saveError } })
    } catch (error) {
      appendResultToHistory(sessionId, localResult)
      saveLatestResult(localResult)
      navigate('/results', { state: { result: localResult, saveError: error.message } })
    } finally {
      setIsSaving(false)
    }
  }

  function getCardStyle(index) {
    const offset = index - currentIndex

    if (offset <= -2) {
      return {
        transform: 'translateY(-130%) scale(0.94)',
        opacity: 0,
        zIndex: 1,
      }
    }

    if (offset === -1) {
      return {
        transform: 'translateY(-58%) scale(0.96)',
        opacity: 0.4,
        zIndex: 10,
      }
    }

    if (offset === 0) {
      return {
        transform: 'translateY(0%) scale(1)',
        opacity: 1,
        zIndex: 20,
      }
    }

    if (offset === 1) {
      return {
        transform: 'translateY(62%) scale(0.98)',
        opacity: 0.2,
        zIndex: 9,
      }
    }

    return {
      transform: 'translateY(130%) scale(0.96)',
      opacity: 0,
      zIndex: 1,
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-4">
      <header className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm md:p-6">
        <h1 className="text-3xl text-slate-900 md:text-4xl">Interview Anxiety Check-in</h1>
        <p className="mt-1.5 text-slate-700">Answer each statement based on your recent interview experiences.</p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-rose-200 bg-rose-100" />
            Never
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-orange-200 bg-orange-100" />
            Rarely
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-amber-200 bg-amber-100" />
            Sometimes
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-emerald-200 bg-emerald-100" />
            Often
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-teal-200 bg-teal-100" />
            Always
          </span>
        </div>

        <div className="mt-3">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Tip: use 1–5 to answer, Backspace to go back, and Enter to continue.
        </p>
      </header>

      <section className="relative h-[420px] overflow-hidden rounded-3xl border border-orange-100 bg-orange-50/50 p-4 shadow-sm md:p-5">
        {questions.map((question, index) => {
          const isCurrent = index === currentIndex
          const style = getCardStyle(index)

          return (
            <div
              key={question.id}
              className="absolute inset-x-4 top-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:inset-x-5"
              style={style}
              aria-hidden={!isCurrent}
            >
              <QuestionCard
                question={question}
                options={likertOptions}
                selectedValue={answers[index]}
                onSelect={isCurrent ? handleSelect : () => {}}
                disabled={!isCurrent || isSaving || isAdvancing}
                pulseValue={selectionPulse.questionIndex === index ? selectionPulse.value : null}
                pulseToken={selectionPulse.questionIndex === index ? selectionPulse.token : 0}
              />
            </div>
          )
        })}
      </section>

      {incompleteNotice ? (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {incompleteNotice}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentIndex === 0 || isSaving}
          className="rounded-full border border-slate-300 px-5 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>

        {!isLastQuestion ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={answers[currentIndex] == null || isSaving || isAdvancing}
            className="rounded-full border border-teal-500 px-5 py-2 font-semibold text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        ) : null}

        {isLastQuestion ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={answers[currentIndex] == null || isSaving || isAdvancing}
            className="rounded-full bg-orange-400 px-6 py-2 font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'See My Results'}
          </button>
        ) : null}
      </div>
    </main>
  )
}

export default Quiz