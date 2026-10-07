import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingScreen from '../components/LoadingScreen'

const ROLE_HOME = {
  ADMIN: '/admin',
  SUB_ADMIN: '/consultant',
}

export default function PublicOnlyRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />
  }

  return <Outlet />
}
