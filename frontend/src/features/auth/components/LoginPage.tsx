import axios from 'axios'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../../../theme/ThemeToggle'
import { login } from '../authApi'
import { getAuthUser } from '../auth'
import { setToken } from '../tokenStorage'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const existingUser = getAuthUser()

  const [email, setEmail] = useState('manager@officeflow.local')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (existingUser) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await login({
        email,
        password: password || undefined,
      })

      setToken(result.token)

      const redirectTo =
        (location.state as { from?: string } | null)?.from ??
        (result.role === 'Manager' ? '/dashboard' : '/')

      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            'Login failed. Check the email and try again.',
        )
      } else {
        setError('Login failed. Check the email and try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-hero items-center justify-center overflow-hidden px-4 py-12 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(3rem,env(safe-area-inset-bottom))]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(47,111,94,0.18), transparent 42%), radial-gradient(circle at 80% 10%, rgba(90,120,160,0.14), transparent 40%)',
        }}
      />

      <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10">
        <ThemeToggle />
      </div>

      <div className="of-material-thick of-enter relative w-full max-w-[420px] rounded-[28px] p-8 sm:p-10">
        <div className="mb-8 space-y-3 text-center">
          <p className="of-display text-brand-700">OfficeFlow</p>
          <h1 className="of-title">Sign in</h1>
          <p className="of-body mx-auto max-w-sm">
            Passwordless demo login by email. Try manager@officeflow.local,
            jan.kowalski@officeflow.local or anna.nowak@officeflow.local
            (password optional).
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-1.5">
            <span className="of-label">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="of-field"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="of-label">Password (optional)</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="of-field"
              placeholder="Not required in demo mode"
              autoComplete="current-password"
            />
          </label>

          {error ? (
            <p className="of-alert-error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="of-btn-primary w-full py-3.5"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
