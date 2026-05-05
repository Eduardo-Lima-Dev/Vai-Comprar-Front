import { Outlet } from 'react-router-dom'
import { MobileBottomNav } from '../components/MobileBottomNav'

export function AuthenticatedLayout() {
  return (
    <div className="min-h-screen pb-[5.75rem]">
      <Outlet />
      <MobileBottomNav />
    </div>
  )
}
