import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/auth/forgot-password', { email })
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md card">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Forgot Password</h2>
        <p className="text-sm text-gray-600 mb-6">Enter your email and we'll send a reset link (demo mode).</p>
        {sent ? (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
            ✅ If that email exists, a reset link has been sent (demo mode — no actual email sent).
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <button type="submit" className="btn-primary w-full">Send Reset Link</button>
          </form>
        )}
        <div className="mt-4 text-center text-sm"><Link to="/login" className="text-primary hover:underline">Back to login</Link></div>
      </div>
    </div>
  )
}
