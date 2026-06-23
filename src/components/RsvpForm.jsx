import { useState } from 'react'
import { weddingConfig } from '../config/wedding'
import { submitRsvp } from '../api/rsvp'

const initialForm = {
  name: '',
  attending: 'yes',
  guestCount: '',
  guestNames: [],
}

function buildGuestNames(name, guestNames, guestCount) {
  if (guestCount <= 1) {
    return [name.trim()]
  }

  return [name.trim(), ...guestNames.map((guestName) => guestName.trim())]
}

export default function RsvpForm() {
  const language = 'en'
  const copy = {
    hy: {
      intro: 'Խնդրում ենք հաստատել Ձեր ներկայությունը միջոցառմանը',
      deadline: 'Սպասում ենք ձեր պատասխանին մինչև',
      namePlaceholder: 'Անուն Ազգանուն',
      attendingYes: 'Մենք կգանք',
      attendingNo: 'Չենք կարող գալ :(',
      guestCountPlaceholder: 'Հյուրերի թիվ',
      guestNamePlaceholder: (index) => `Հյուր ${index + 2} — Անուն Ազգանուն`,
      submitIdle: 'Ուղարկել',
      submitLoading: 'Ուղարկվում է...',
      successTitle: 'Շնորհակալություն',
      successBody: 'Ձեր պատասխանը հաջողությամբ ստացվել է։',
      newReply: 'Նոր պատասխան',
      errorName: 'Անունը սխալ է նշված',
      errorGuestCount: 'Հյուրերի թիվը սխալ է նշված',
      submitError: 'Չհաջողվեց ուղարկել։ Խնդրում ենք փորձել կրկին։',
    },
    en: {
      intro: 'Please confirm your attendance at the event',
      deadline: 'Please reply by',
      namePlaceholder: 'Full name',
      attendingYes: 'We will attend',
      attendingNo: 'We cannot attend :(',
      guestCountPlaceholder: 'Number of guests',
      guestNamePlaceholder: (index) => `Guest ${index + 2} — Full name`,
      submitIdle: 'Send',
      submitLoading: 'Sending...',
      successTitle: 'Thank you',
      successBody: 'Your response has been received successfully.',
      newReply: 'New response',
      errorName: 'Name is invalid',
      errorGuestCount: 'Guest count is invalid',
      submitError: 'Failed to submit. Please try again.',
    },
  }

  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const guestCountNumber =
    form.attending === 'yes' && form.guestCount !== ''
      ? Math.max(1, Number(form.guestCount) || 0)
      : 0

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  function updateGuestCount(value) {
    const count = Number(value)

    setForm((current) => {
      const guestNames = [...current.guestNames]

      if (!Number.isInteger(count) || count < 1) {
        return { ...current, guestCount: value }
      }

      const extraGuests = Math.max(0, count - 1)

      while (guestNames.length < extraGuests) {
        guestNames.push('')
      }

      while (guestNames.length > extraGuests) {
        guestNames.pop()
      }

      return { ...current, guestCount: value, guestNames }
    })

    setErrors((current) => ({ ...current, guestCount: '', guestNames: {} }))
  }

  function updateGuestName(index, value) {
    setForm((current) => {
      const guestNames = [...current.guestNames]
      guestNames[index] = value
      return { ...current, guestNames }
    })

    setErrors((current) => ({
      ...current,
      guestNames: { ...current.guestNames, [index]: '' },
    }))
  }

  function validate() {
    const nextErrors = {}
    const guestNameErrors = {}

    if (!form.name.trim() || form.name.trim().length < 2) {
      nextErrors.name = copy[language].errorName
    }

    if (form.attending === 'yes') {
      const count = Number(form.guestCount)

      if (!Number.isInteger(count) || count < 1 || count > 20) {
        nextErrors.guestCount = copy[language].errorGuestCount
      }

      if (count > 1) {
        form.guestNames.forEach((guestName, index) => {
          if (!guestName.trim() || guestName.trim().length < 2) {
            guestNameErrors[index] = copy[language].errorName
          }
        })
      }
    }

    if (Object.keys(guestNameErrors).length > 0) {
      nextErrors.guestNames = guestNameErrors
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    if (!validate()) {
      return
    }

    setStatus('loading')

    const guestCount = form.attending === 'yes' ? Number(form.guestCount) : 0
    const guestNames = buildGuestNames(form.name, form.guestNames, guestCount)

    try {
      await submitRsvp({
        ...form,
        name: form.name.trim(),
        phone: '',
        email: '',
        message: '',
        guestCount,
        guestNames,
      })
      setStatus('success')
      setForm(initialForm)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error.message || copy[language].submitError)
    }
  }

  if (status === 'success') {
    return (
      <section className="section rsvp">
        <div className="rsvp__success">
          <h2>{copy[language].successTitle}</h2>
          <p>{copy[language].successBody}</p>
          <p className="rsvp__success-note">{weddingConfig.footerText[language]}</p>
          <button type="button" className="button button--secondary" onClick={() => setStatus('idle')}>
            {copy[language].newReply}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="section rsvp">
      <p className="rsvp__intro">
        <strong>{copy[language].intro}</strong>
      </p>
      <p className="rsvp__deadline">
        {copy[language].deadline} {weddingConfig.rsvpDeadlineDisplay}
      </p>

      <form className="rsvp__form" onSubmit={handleSubmit} noValidate>
        <label className="field field--underline">
          <input
            type="text"
            value={form.name}
            placeholder={copy[language].namePlaceholder}
            onChange={(event) => updateField('name', event.target.value)}
          />
          {errors.name && <small className="field__error">{errors.name}</small>}
        </label>

        <fieldset className="rsvp__group">
          <div className="rsvp__options">
            <label className="radio-inline">
              <input
                type="radio"
                name="attending"
                value="yes"
                checked={form.attending === 'yes'}
                onChange={(event) => updateField('attending', event.target.value)}
              />
              <span>{copy[language].attendingYes}</span>
            </label>
            <label className="radio-inline">
              <input
                type="radio"
                name="attending"
                value="no"
                checked={form.attending === 'no'}
                onChange={(event) => updateField('attending', event.target.value)}
              />
              <span>{copy[language].attendingNo}</span>
            </label>
          </div>
        </fieldset>

        {form.attending === 'yes' && (
          <>
            <label className="field field--underline">
              <input
                type="number"
                min="1"
                max="20"
                value={form.guestCount}
                placeholder={copy[language].guestCountPlaceholder}
                onChange={(event) => updateGuestCount(event.target.value)}
              />
              {errors.guestCount && <small className="field__error">{errors.guestCount}</small>}
            </label>

            {guestCountNumber > 1 &&
              form.guestNames.map((guestName, index) => (
                <label key={index} className="field field--underline">
                  <input
                    type="text"
                    value={guestName}
                    placeholder={copy[language].guestNamePlaceholder(index)}
                    onChange={(event) => updateGuestName(index, event.target.value)}
                  />
                  {errors.guestNames?.[index] && (
                    <small className="field__error">{errors.guestNames[index]}</small>
                  )}
                </label>
              ))}
          </>
        )}

        {errorMessage && <p className="rsvp__error">{errorMessage}</p>}

        <button type="submit" className="button button--pill" disabled={status === 'loading'}>
          {status === 'loading' ? copy[language].submitLoading : copy[language].submitIdle}
        </button>
      </form>
    </section>
  )
}
