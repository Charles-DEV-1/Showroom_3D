import { useEffect, useState } from 'react'
import type { ProductSummary } from '../types/product'
import { getMyProducts } from '../lib/api'
import { formatPrice } from '../lib/configuration'
import './MyProductsPage.css'

export default function MyProductsPage() {
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [copyStatus, setCopyStatus] = useState('')
  const [manualCopy, setManualCopy] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    getMyProducts(controller.signal).then(products => {
      if (!controller.signal.aborted) setProducts(products)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Could not load your products.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [retry])

  async function copy(product: ProductSummary) {
    const url = `${window.location.origin}/product/${encodeURIComponent(product.id)}`
    setManualCopy('')
    try { await navigator.clipboard.writeText(url); setCopyStatus(`Link copied for ${product.name}.`) }
    catch { setManualCopy(url); setCopyStatus('Select and copy the product link below.') }
  }

  return <main className="my-products-page">
    <div className="my-products-heading"><div className="page-heading"><p className="eyebrow">YOUR ARTISAN WORKSPACE</p><h1>My products.</h1><p>Your latest 100 saved products. Prices below are base prices before finish choices.</p></div><a className="button-primary" href="/builder">Create furniture</a></div>
    {loading ? <p role="status">Loading your products…</p> : error ? <div className="error-message"><p role="alert">{error}</p><button className="button-small" onClick={() => { setError(''); setLoading(true); setRetry(value => value + 1) }}>Try again</button></div> : products.length === 0 ?
      <section className="products-empty"><h2>Your first product starts here.</h2><p>You haven’t saved any products with this account yet.</p><a className="button-primary" href="/builder">Create your first product</a></section> :
      <div className="my-products-grid">{products.map(product => <article className="product-card" key={product.id}>
        {product.photoUrl && <img src={product.photoUrl} alt={`Reference photo for ${product.name}`} loading="lazy" />}
        <div className="product-card-content"><h2>{product.name}</h2><p>{product.dimensions}</p><strong>{formatPrice(product.price)} <span>base price</span></strong><div className="button-row"><a className="button-primary" href={`/product/${encodeURIComponent(product.id)}`}>Open product</a><button className="button-small" onClick={() => void copy(product)}>Copy link</button></div></div>
      </article>)}</div>}
    {copyStatus && <p className="notice" role="status">{copyStatus}</p>}
    {manualCopy && <label className="field"><span>Product link</span><input readOnly value={manualCopy} onFocus={event => event.target.select()} /></label>}
  </main>
}
