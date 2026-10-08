import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../auth/useAuth'
import { ApiError, getProfile, updateProfile } from '../lib/api'
import './ProfilePage.css'

export default function ProfilePage() {
  const { session } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [needsSignIn, setNeedsSignIn] = useState(false)
  const [retry, setRetry] = useState(0)
  const busy = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    getProfile(controller.signal).then(profile => {
      if (controller.signal.aborted) return
      setDisplayName(profile?.displayName ?? '')
      setWhatsapp(profile?.whatsapp ?? '')
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : 'Could not load your profile.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [retry])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current) return
    busy.current = true; setSaving(true); setSaved(false); setSaveError(''); setNeedsSignIn(false)
    try {
      const profile = await updateProfile({ displayName, whatsapp })
      setDisplayName(profile.displayName); setWhatsapp(profile.whatsapp); setSaved(true)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save your profile.')
      setNeedsSignIn(error instanceof ApiError && error.status === 401)
    } finally { busy.current = false; setSaving(false) }
  }

  return <main className="profile-page">
    <div className="page-heading"><p className="eyebrow">YOUR ARTISAN WORKSPACE</p><h1>Your profile.</h1><p>Save your contact once. Use it when you create your next product.</p></div>
    <section className="profile-card" aria-labelledby="profile-details-title">
      <h2 id="profile-details-title">Artisan details</h2>
      {loading ? <p role="status">Loading your profile…</p> : loadError ? <div className="error-message"><p role="alert">{loadError}</p><button className="button-small" onClick={() => { setLoading(true); setLoadError(''); setRetry(value => value + 1) }}>Try again</button></div> :
        <form onSubmit={submit}>
          <fieldset disabled={saving} className="form-fields">
            {session?.user.email && <label className="field"><span>Account email</span><input type="email" readOnly value={session.user.email} /></label>}
            <div className="profile-fields">
              <label className="field"><span>Business / display name</span><input required maxLength={80} name="displayName" autoComplete="organization" value={displayName} onChange={event => { setDisplayName(event.target.value); setSaved(false) }} /></label>
              <label className="field"><span>WhatsApp number</span><input required name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" maxLength={40} placeholder="Country code + phone number" value={whatsapp} onChange={event => { setWhatsapp(event.target.value); setSaved(false) }} /></label>
            </div>
            <p className="hint">Include your country code, for example +234. New drafts use this number; published products keep their saved contact.</p>
            <div className="profile-actions"><button type="submit" className="button-primary">{saving ? 'Saving profile…' : 'Save profile'}</button></div>
          </fieldset>
          {saveError && <p className="error-message" role="alert">{saveError}</p>}
          {needsSignIn && <p className="hint"><a href="/login?reauth=1&next=%2Fprofile" target="_blank" rel="noreferrer">Sign in again in a new tab</a>, then retry.</p>}
          {saved && <p className="profile-success" role="status">Profile saved. Your next product can use this WhatsApp number.</p>}
        </form>}
    </section>
    <a className="profile-return" href="/my-products">Back to My products</a>
  </main>
}
