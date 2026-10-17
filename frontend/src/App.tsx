import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './features/auth/components/DashboardPage'
import { LoginPage } from './features/auth/components/LoginPage'
import { ProtectedRoute } from './features/auth/components/ProtectedRoute'
import { MyReservations } from './features/reservations/components/MyReservations'
import { ReservationsPage } from './features/reservations/components/ReservationsPage'
import { ServiceManager } from './features/services/components/ServiceManager'
import { SpaceManager } from './features/spaces/components/SpaceManager'
import { SpacesPage } from './features/spaces/components/SpacesPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<SpacesPage />} />
            <Route path="reservations" element={<ReservationsPage />} />

            <Route element={<ProtectedRoute roles="Tenant" />}>
              <Route path="my-reservations" element={<MyReservations />} />
            </Route>

            <Route element={<ProtectedRoute roles="Manager" />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="manage-spaces" element={<SpaceManager />} />
              <Route path="manage-services" element={<ServiceManager />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
