import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { FinishSelection, Product, ProductInput } from '../types/product.ts'
import Viewer from '../components/viewer/Viewer'
import NumberField from '../components/builder/NumberField'
import PartEditor from '../components/builder/PartEditor'
import FinishEditor from '../components/builder/FinishEditor'
import FinishSelector from '../components/FinishSelector'
import { createTemplate, templateParts, tableTemplate, templates } from '../data/templates'
import type { TemplateId } from '../data/templates'
import { ApiError, createProduct, getProfile, uploadReferencePhoto, uploadFinishTexture } from '../lib/api'
import { calculatePrice, configurationUrl, formatDimensions, formatPrice, selectedFinishes } from '../lib/configuration'

export default function BuilderPage() {
  const [draft, setDraft] = useState<ProductInput>(tableTemplate)
  const [templateId, setTemplateId] = useState<TemplateId>('table')
  const [selection, setSelection] = useState<FinishSelection>({})
  const [saved, setSaved] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [needsSignIn, setNeedsSignIn] = useState(false)
  const [contactUnavailable, setContactUnavailable] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const shareInput = useRef<HTMLInputElement>(null)
  const operation = useRef(false)
  const busy = saving || uploading
  const previewSelection = Object.fromEntries(selectedFinishes(draft, selection).map((finish) => [finish.slot, finish.id]))
  const shareUrl = saved ? configurationUrl(saved, previewSelection, window.location.origin) : ''

  useEffect(() => {
    const controller = new AbortController()
    getProfile(controller.signal).then(profile => {
      if (controller.signal.aborted || !profile) return
      setDraft(previous => previous.whatsapp.length > 0 ? previous : { ...previous, whatsapp: profile.whatsapp })
    }).catch(() => { if (!controller.signal.aborted) setContactUnavailable(true) })
    return () => controller.abort()
  }, [])

  function edit(update: (product: ProductInput) => ProductInput) {
    setDraft(update)
    setSaved(null)
    setError('')
    setNeedsSignIn(false)
    setCopyStatus('')
  }

  function dimension(axis: number, value: number) {
    edit((product) => {
      const dimensionsCm = product.dimensionsCm.map((old, index) => index === axis ? value : old) as ProductInput['dimensionsCm']
      return { ...product, dimensionsCm, dimensions: formatDimensions(dimensionsCm), parts: templateParts(templateId, dimensionsCm) }
    })
  }

  function changeTemplate(id: TemplateId) {
    setTemplateId(id)
    setSelection({})
    edit((product) => ({ ...createTemplate(id), whatsapp: product.whatsapp }))
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (operation.current) return
    operation.current = true
    setError('')
    setNeedsSignIn(false)
    setUploading(true)
    try {
      const photoUrl = await uploadReferencePhoto(file)
      edit((product) => ({ ...product, photoUrl }))
    } catch (error) { setError(error instanceof Error ? error.message : 'Photo upload failed.'); setNeedsSignIn(error instanceof ApiError && error.status === 401) }
    finally { operation.current = false; setUploading(false) }
  }

  async function uploadTexture(id: string, file: File) {
    if (operation.current) return
    operation.current = true
    setError('')
    setNeedsSignIn(false)
    setUploading(true)
    try {
      const textureUrl = await uploadFinishTexture(file)
      edit((product) => ({ ...product, finishes: product.finishes.map((finish) =>
        finish.id === id ? { ...finish, textureUrl } : finish) }))
    } catch (error) { setError(error instanceof Error ? error.message : 'Texture upload failed.'); setNeedsSignIn(error instanceof ApiError && error.status === 401) }
    finally { operation.current = false; setUploading(false) }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (operation.current) return
    operation.current = true
    setError('')
    setNeedsSignIn(false)
    setSaving(true)
    try { setSaved(await createProduct(draft)) }
    catch (error) { setError(error instanceof Error ? error.message : 'Saving failed. Please try again.'); setNeedsSignIn(error instanceof ApiError && error.status === 401) }
    finally { operation.current = false; setSaving(false) }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopyStatus('Link copied.')
    } catch {
      shareInput.current?.focus()
      shareInput.current?.select()
      setCopyStatus('Link selected. Copy it from the field above.')
    }
  }

  return (
    <main className="builder-page">
      <div className="page-heading"><p className="eyebrow">ARTISAN STUDIO</p><h1>Build your furniture.</h1><p>Start with a template. Make it yours. Share it with a buyer.</p></div>
      <div className="builder-layout">
        <form className="builder-form" onSubmit={save}>
          <fieldset className="form-fields" disabled={busy}>
            <section className="editor-section">
              <h2>Product information</h2>
              <p className="hint">Changing templates replaces this draft. Save first to keep your product. Your WhatsApp number carries over.</p>
              <label className="field"><span>Furniture template</span><select value={templateId} onChange={(event) => changeTemplate(event.target.value as TemplateId)}>
                {templates.map((template) => <option key={template.id} value={template.id}>{template.label}</option>)}
              </select></label>
              <label className="field"><span>Product name</span><input required maxLength={120} value={draft.name}
                onChange={(event) => edit((product) => ({ ...product, name: event.target.value }))} /></label>
              <label className="field"><span>WhatsApp number</span><input required type="tel" autoComplete="tel" placeholder="Country code + phone number"
                value={draft.whatsapp} maxLength={40} onChange={(event) => edit((product) => ({ ...product, whatsapp: event.target.value }))} /></label>
              <p className="hint">Include your country code, for example +234. Buyers use this number to order.</p>
              {contactUnavailable && <p className="hint">Your saved contact couldn’t load. Enter your WhatsApp number above to continue.</p>}
              <NumberField label="Base price (NGN)" value={draft.price} min={0} max={1000000000} step={1}
                onChange={(price) => edit((product) => ({ ...product, price }))} />
            </section>
            <section className="editor-section">
              <h2>Overall dimensions</h2>
              <p className="hint">All measurements are in centimeters. Changing these dimensions rebuilds the template and replaces manual part edits.{templateId === 'bed' && ' Bed height includes the headboard.'}</p>
              <div className="field-grid three">
                {draft.dimensionsCm.map((value, axis) => <NumberField key={axis} label={['Width', 'Height', 'Depth'][axis]} value={value} min={10} onChange={(value) => dimension(axis, value)} />)}
              </div>
            </section>
            <PartEditor parts={draft.parts} onChange={(parts) => edit((product) => ({ ...product, parts }))} />
            <FinishEditor finishes={draft.finishes} onUploadTexture={uploadTexture} onChange={(finishes) => edit((product) => ({ ...product, finishes }))} />
            <section className="editor-section">
              <h2>Reference photo</h2>
              <label className="field"><span>Upload JPEG, PNG, or WebP (up to 2 MiB)</span><input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={upload} /></label>
              {draft.photoUrl && <div className="photo-preview"><img src={draft.photoUrl} alt="Uploaded furniture reference" />
                <button type="button" className="text-button danger" onClick={() => edit((product) => ({ ...product, photoUrl: null }))}>Remove photo</button></div>}
            </section>
            <button className="button-primary save-button" type="submit">{saving ? 'Saving product…' : 'Save product'}</button>
          </fieldset>
          {uploading && <p className="notice" role="status">Uploading image…</p>}
          {error && <p className="error-message" role="alert">{error}</p>}
          {needsSignIn && <p className="hint">Your draft remains here. <a href="/login?reauth=1&next=%2Fbuilder" target="_blank" rel="noreferrer">Sign in again in a new tab</a> with the same account, then retry.</p>}
          {saved && <section className="share-result" aria-labelledby="share-title">
            <h2 id="share-title">Your product is saved.</h2><p>Open the buyer page or copy its link.</p>
            <label className="field"><span>Product link</span><input ref={shareInput} readOnly value={shareUrl} onFocus={(event) => event.target.select()} /></label>
            <div className="button-row"><button className="button-small" type="button" onClick={copy}>Copy link</button><a className="button-primary" href={shareUrl} target="_blank" rel="noreferrer">Open product</a></div>
            {copyStatus && <p className="hint" role="status">{copyStatus}</p>}
          </section>}
        </form>
        <aside className="builder-preview" aria-label="Live furniture preview">
          <div className="preview-topline"><span>Live preview</span><strong>{formatPrice(calculatePrice(draft, previewSelection))}</strong></div>
          <Viewer product={draft} selection={previewSelection} />
          <p className="dimension-label">{draft.dimensions}</p>
          <FinishSelector product={draft} selection={previewSelection} onChange={setSelection} />
          <p className="model-note">A stylized preview to help buyers understand shape, scale, and finishes.</p>
        </aside>
      </div>
    </main>
  )
}
