import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

if (typeof window !== 'undefined' && window.IntersectionObserver) {
  const originalObserve = window.IntersectionObserver.prototype.observe
  window.IntersectionObserver.prototype.observe = function patchedObserve(target, ...rest) {
    if (!(target instanceof Element)) {
      return
    }
    return originalObserve.call(this, target, ...rest)
  }
}

if (typeof window !== 'undefined') {
  window.gm_authFailure = () => {
    window.dispatchEvent(new CustomEvent('google-maps-auth-failure'))
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)