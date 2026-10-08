import { Component, lazy, Suspense, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import LandingPage from './pages/LandingPage'
import { useAuth } from './auth/useAuth'
import { navigate } from './auth/navigation'
import RequireArtisan from './auth/RequireArtisan'
import './components/auth/AuthForm.css'
import './App.css'

const BuilderPage = lazy(() => import('./pages/BuilderPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'))
const MyProductsPage = lazy(() => import('./pages/MyProductsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

class PageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? <main className="page-message">
      <h1>This page could not load.</h1><p>Check your connection and try again.</p>
      <button className="button-primary" onClick={() => window.location.reload()}>Reload page</button>
    </main> : this.props.children
  }
}

export default function App() {
  const auth = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const sync = () => setPath(window.location.pathname)
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])
  async function signOut() {
    if (signingOut) return
    setSigningOut(true); setSignOutError('')
    try { await auth.signOut(); navigate('/', true) }
    catch (error) { setSignOutError(error instanceof Error ? error.message : 'Could not sign out. Please retry.') }
    finally { setSigningOut(false) }
  }
  const productMatch = /^\/product\/([^/]+)\/?$/.exec(path)
  const builder = path === '/builder' || path === '/builder/'
  const myProducts = path === '/my-products' || path === '/my-products/'
  const profile = path === '/profile' || path === '/profile/'
  return (
    <>
      <header className="app-header">
        <a className="brand" href="/"><span className="brand-mark" aria-hidden="true">S3</span> ShowRoom 3D</a>
        <nav className="account-nav" aria-label="Artisan navigation">
          <a className="header-link" href="/builder" aria-current={builder ? 'page' : undefined}>Artisan studio</a>
          {auth.session && <><a className="header-link" href="/my-products" aria-current={myProducts ? 'page' : undefined}>My products</a><a className="header-link" href="/profile" aria-current={profile ? 'page' : undefined}>Profile</a></>}
          {auth.loading ? <span className="header-link" role="status">Checking account…</span> : auth.session ?
            <button className="text-button" disabled={signingOut} onClick={() => void signOut()}>{signingOut ? 'Signing out…' : 'Sign out'}</button> : <a className="header-link" href="/login">Sign in</a>}
        </nav>
      </header>
      {signOutError && <p className="account-error" role="alert">{signOutError}</p>}
      <PageBoundary key={path}>
        <Suspense fallback={<main className="page-message" role="status"><p>Loading your page…</p></main>}>
          {path === '/' ? <LandingPage /> : path === '/login' ? <LoginPage /> : path === '/signup' ? <SignupPage /> : path === '/auth/callback' ? <AuthCallbackPage /> : builder || myProducts || profile ? <RequireArtisan><Suspense fallback={<main className="page-message" role="status">Loading your workspace…</main>}>{builder ? <BuilderPage key={auth.session?.user.id} /> : profile ? <ProfilePage key={auth.session?.user.id} /> : <MyProductsPage key={auth.session?.user.id} />}</Suspense></RequireArtisan> : productMatch ? <ProductPage key={productMatch[1]} id={productMatch[1]} /> : (
            <main className="page-message"><h1>Page not found.</h1><a href="/builder">Open the furniture builder</a></main>
          )}
        </Suspense>
      </PageBoundary>
    </>
  )
}
