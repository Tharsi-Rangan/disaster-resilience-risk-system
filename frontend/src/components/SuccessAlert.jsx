import React, { useEffect } from 'react'
import './SuccessAlert.css'

const SuccessAlert = ({ message, onClose, autoClose = 5000 }) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoClose)
      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose])

  if (!message) return null

  return (
    <div className="success-alert">
      <div className="success-content">
        <span className="success-icon">✓</span>
        <p>{message}</p>
      </div>
      {onClose && (
        <button className="success-close" onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  )
}

export default SuccessAlert
