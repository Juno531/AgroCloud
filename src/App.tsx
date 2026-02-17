import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import PrivateRoute from './components/Auth/PrivateRoute'
import { FarmProvider } from './context/FarmContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import Dashboard from './pages/Dashboard/Dashboard'
import YieldManagement from './pages/Management/YieldManagement'
import SalesManagement from './pages/Management/SalesManagement'
import CultivationManagement from './pages/Management/CultivationManagement'
import FarmManagement from './pages/Management/FarmManagement'
import AdminSettings from './pages/Admin/AdminSettings'
import HRManagement from './pages/HR/HRManagement'
import Attendance from './pages/HR/Attendance'
import SuperAdmin from './pages/SuperAdmin/SuperAdmin'
import Login from './pages/Auth/Login'


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FarmProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/super-admin/*" element={
                <PrivateRoute allowedRoles={['SUPER_ADMIN']}>
                  <Layout>
                    <SuperAdmin />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/cultivation" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <CultivationManagement />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/sales" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <SalesManagement />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/farm" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <FarmManagement />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/admin" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <AdminSettings />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/hr/*" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <HRManagement />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/attendance" element={
                <PrivateRoute>
                  <Layout>
                    <Attendance />
                  </Layout>
                </PrivateRoute>
              } />
            </Routes>
          </BrowserRouter>
        </FarmProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
