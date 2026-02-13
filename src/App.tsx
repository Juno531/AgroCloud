import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import PrivateRoute from './components/Auth/PrivateRoute'
import YieldManagement from './pages/YieldManagement'
import SalesManagement from './pages/SalesManagement'
import CultivationManagement from './pages/CultivationManagement'
import FarmManagement from './pages/FarmManagement'
import AdminSettings from './pages/AdminSettings'
import HRManagement from './pages/HRManagement'
import { FarmProvider } from './context/FarmContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'

import Attendance from './pages/Attendance'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FarmProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <YieldManagement />
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
              <Route path="/hr" element={
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
