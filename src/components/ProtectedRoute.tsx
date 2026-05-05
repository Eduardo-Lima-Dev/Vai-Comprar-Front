import type { PropsWithChildren } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
/** Use Outlet when no children — nested routes inside ProtectedRoute */
export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-on-background">
        <div className="font-display text-lg tracking-wide">Carregando…</div>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children ?? <Outlet />
}
