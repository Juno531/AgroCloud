import { RouterProvider } from 'react-router-dom'
import { FarmProvider } from './context/FarmContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { router } from './routes'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FarmProvider>
          <RouterProvider router={router} />
        </FarmProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
