import { useEffect, useState } from 'react'
import type { FinishSelection, Product } from '../types/product.ts'
import Viewer from '../components/viewer/Viewer'
import FinishSelector from '../components/FinishSelector'
import { getProduct } from '../lib/api'
import { calculatePrice, configurationUrl, formatPrice, selectionFromSearch } from '../lib/configuration'
import { whatsappOrderUrl } from '../lib/whatsapp'

export default function ProductPage({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [search, setSearch] = useState(window.location.search)

  useEffect(() => {
    const controller = new AbortController()
    getProduct(id, controller.signal).then((product) => {
      if (!controller.signal.aborted) setProduct(product)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Could not load this product.')
    })
    return () => controller.abort()
  }, [id, retry])

  useEffect(() => {
    const sync = () => setSearch(window.location.search)
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  if (error) return <main className="page-message"><h1>Unable to open this product.</h1><p role="alert">{error}</p><div className="button-row"><button className="button-primary" onClick={() => { setError(''); setRetry((value) => value + 1) }}>Try again</button><a className="button-small" href="/builder">Open builder</a></div></main>
  if (!product) return <main className="page-message" role="status"><p>Loading your furniture…</p></main>

  const selection = selectionFromSearch(product, search)
  const price = calculatePrice(product, selection)
  const orderUrl = whatsappOrderUrl(product, selection, window.location.origin)

  function select(next: FinishSelection) {
    if (!product) return
    const url = new URL(configurationUrl(product, next, window.location.origin))
    window.history.replaceState(null, '', `${url.pathname}${url.search}`)
    setSearch(url.search)
  }

  return (
    <main className="buyer-page">
      <div className="buyer-layout">
        <section className="buyer-view" aria-label="Furniture visualization">
          <Viewer product={product} selection={selection} />
          <p className="model-note">A stylized preview. Compare with the reference photo and dimensions.</p>
        </section>
        <section className="buyer-info" aria-labelledby="product-title">
          <p className="eyebrow">MADE FOR YOUR SPACE</p><h1 id="product-title">{product.name}</h1>
          <p className="buyer-intro">Explore the shape. Find your finish.</p>
          <div className="dimension-block"><span>Dimensions (width × depth × height)</span><strong>{product.dimensions}</strong></div>
          <FinishSelector product={product} selection={selection} onChange={select} />
          <div className="price-block"><span>Your selected price</span><strong aria-live="polite">{formatPrice(price)}</strong></div>
          <a className="button-primary whatsapp-button" href={orderUrl} target="_blank" rel="noreferrer">Order via WhatsApp <span aria-hidden="true">↗</span></a>
          <p className="hint">Your message includes the finishes, dimensions, price, and configuration link.</p>
          {product.photoUrl && <figure className="reference-photo"><img src={product.photoUrl} alt={`Reference photo for ${product.name}`} loading="lazy" /><figcaption>Reference photo</figcaption></figure>}
        </section>
      </div>
    </main>
  )
}
