import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthenticatedLayout } from './layouts/AuthenticatedLayout'
import { AccessRoomPage } from './pages/AccessRoomPage'
import { AddItemPage } from './pages/AddItemPage'
import { CreateRoomPage } from './pages/CreateRoomPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { RoomHistoryPage } from './pages/RoomHistoryPage'
import { RegisterPage } from './pages/RegisterPage'
import { RoomPage } from './pages/RoomPage'
import { RoomShoppingPage } from './pages/RoomShoppingPage'

function App() {
  return (
    <div className="min-h-screen text-on-background">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/rooms/new" element={<CreateRoomPage />} />
            <Route path="/rooms/access" element={<AccessRoomPage />} />
            <Route path="/rooms/:slug" element={<RoomPage />} />
            <Route path="/rooms/:slug/items/new" element={<AddItemPage />} />
            <Route path="/rooms/:slug/shopping" element={<RoomShoppingPage />} />
            <Route path="/rooms/:slug/history" element={<RoomHistoryPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
