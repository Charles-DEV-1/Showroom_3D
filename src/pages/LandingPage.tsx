import { useEffect, useRef, useState } from 'react'
import demoProducts from '../../scripts/demo-products.json'
import './LandingPage.css'

const demoUrl = `/product/${encodeURIComponent(demoProducts.main)}?finish=walnut&secondary=charcoal`

function FurniturePreview() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => {
      if (motion.matches) {
        video.pause()
        video.removeAttribute('src')
        video.load()
      } else {
        video.src = '/demo/showroom-table-loop.mp4'
        // Browsers can block autoplay; the poster and Play button remain usable.
        void video.play().catch(() => {})
      }
    }
    syncMotion()
    motion.addEventListener('change', syncMotion)
    return () => {
      motion.removeEventListener('change', syncMotion)
      video.pause()
    }
  }, [])

  function togglePlayback() {
    const video = videoRef.current
    if (!video) return
    if (!video.paused) video.pause()
    else {
      if (!video.getAttribute('src')) video.src = '/demo/showroom-table-loop.mp4'
      void video.play().catch(() => {})
    }
  }

  return (
    <figure className="landing-furniture-preview">
      <div className="landing-furniture-media">
        <img src="/demo/showroom-table-poster.jpg" alt="The ShowRoom 3D dining table preview with a Walnut top and Charcoal legs" width={960} height={960} fetchPriority="high" />
        <video ref={videoRef} muted loop playsInline preload="none" hidden={failed}
          poster="/demo/showroom-table-poster.jpg"
          aria-label="Recorded 3D table rotation, switching between Walnut and Carrara Marble"
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          onError={() => { setFailed(true); setPlaying(false) }} />
      </div>
      {!failed && <button className="landing-motion-button" type="button" onClick={togglePlayback}
        aria-label={playing ? 'Pause furniture preview' : 'Play furniture preview'}>
        <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>{playing ? 'Pause preview' : 'Play preview'}
      </button>}
      <figcaption><span>YOUR FURNITURE, IN 3D</span><strong>One table. A new perspective.</strong><small>Recorded preview · Walnut & Carrara Marble. Try the demo to rotate and choose a finish yourself.</small></figcaption>
    </figure>
  )
}

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const [videoStatus, setVideoStatus] = useState('')

  function startWalkthrough() {
    const video = videoRef.current
    if (!video) return
    setStarted(true)
    // Start loading and playing inside the user's gesture, including on phones.
    video.src = '/demo/showroom-full-demo.mp4'
    void video.play().catch(() => {
      if (!video.error) setVideoStatus('Use the player controls to start the walkthrough.')
    })
  }

  return (
    <main className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <p className="eyebrow">FOR ARTISANS & THEIR CUSTOMERS</p>
          <h1 id="landing-title">Furniture, made <em>clearer.</em></h1>
          <p className="landing-intro">Bring your furniture idea into view. Customize its dimensions and finishes, see the price, and start an order with confidence.</p>
          <div className="landing-actions">
            <a className="button-primary" href={demoUrl}>Try the demo <span aria-hidden="true">↗</span></a>
            <a className="landing-button-secondary" href="/builder">Create furniture</a>
          </div>
          <p className="landing-reassurance">Start from a template. No 3D modeling skills needed.</p>
          <div className="landing-features" aria-label="Product capabilities">
            <span>Dimensions in cm</span><span>Finishes & live pricing</span><span>Order via WhatsApp</span>
          </div>
        </div>
        <FurniturePreview />
      </section>

      <section className="landing-workflow" aria-labelledby="workflow-title">
        <div className="landing-section-heading"><p className="eyebrow">FROM AN IDEA TO A SHARED CHOICE</p><h2 id="workflow-title">Three simple steps.</h2></div>
        <ol className="landing-steps">
          <li><span className="landing-step-number">01</span><h3>Start with a template.</h3><p>Choose a table, chair, shelf, bed, sofa, coffee table or desk. Enter your measurements and adjust simple parts.</p></li>
          <li><span className="landing-step-number">02</span><h3>Make it yours.</h3><p>Add colors or texture images, assign finishes to parts, and set a base price with finish modifiers.</p></li>
          <li><span className="landing-step-number">03</span><h3>Share. Choose. Order.</h3><p>Send a product link. Buyers rotate the preview, compare finishes and open WhatsApp with their exact selection.</p></li>
        </ol>
      </section>

      <section className="landing-demo" aria-labelledby="demo-title">
        <div className="landing-video-heading">
          <div><p className="eyebrow">SEE SHOWROOM 3D IN ACTION</p><h2 id="demo-title">From your first template<br />to an order enquiry.</h2></div>
          <p>Create, customize, save and share.<br /><span>4:25 narrated walkthrough · English captions</span></p>
        </div>
        <div className="landing-video-shell">
          <video ref={videoRef} controls={started} playsInline preload="metadata"
            poster="/demo/showroom-full-demo-poster.jpg"
            aria-label="ShowRoom 3D narrated walkthrough" aria-describedby="video-description"
            onPlaying={() => setVideoStatus('')}
            onError={() => setVideoStatus('The video could not load. You can still explore the live furniture demo below.')}>
            {started && <track kind="captions" src="/demo/showroom-full-demo.vtt" srcLang="en" label="English" />}
            Your browser does not support video playback.
          </video>
          {!started && <button className="landing-play-button" type="button" onClick={startWalkthrough}>
            <span className="landing-play-symbol" aria-hidden="true">▶</span><span>Play the walkthrough</span>
          </button>}
        </div>
        {videoStatus && <p className="landing-video-status" role="status">{videoStatus}</p>}
        <p className="landing-video-note" id="video-description">Recorded from the working web app, with a phone-sized browser view and a labeled preview of the generated WhatsApp message.</p>
        <a className="landing-text-link" href={demoUrl}>Explore the live demo yourself <span aria-hidden="true">→</span></a>
      </section>

      <section className="landing-closing" aria-labelledby="closing-title">
        <div><p className="eyebrow">BETTER FURNITURE CONVERSATIONS</p><h2 id="closing-title">Same furniture. Same finish.<br />Same understanding.</h2><p>Give customers shape, proportions, finish choices and price clarity before the order conversation.</p></div>
        <a className="button-primary" href="/builder">Create your first product <span aria-hidden="true">↗</span></a>
      </section>
      <footer className="landing-footer"><span>ShowRoom 3D</span><p>Built for furniture artisans. Made to share.</p><a href="/demo/PHOTO_CREDIT.md">Reference image credit</a></footer>
    </main>
  )
}
