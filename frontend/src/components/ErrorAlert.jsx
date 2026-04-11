import React from 'react'
import './ErrorAlert.css'

const ErrorAlert = ({ message, onClose }) => {
  if (!message) return null

  return (
    <div className="error-alert">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <p>{message}</p>
      </div>
      {onClose && (
        <button className="error-close" onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  )
}

export default ErrorAlert
