function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
      <p className="mt-4 text-sm text-slate-600">{message}</p>
    </div>
  )
}

export default LoadingSpinner
