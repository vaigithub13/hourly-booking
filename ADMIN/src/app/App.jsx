import { useRoutes } from 'react-router-dom'

// ROUTES
import AppRoutes from './AppRoutes'

// FAKE SERVER
import '../fake-db'

export default function App() {
  const content = useRoutes(AppRoutes())
  return content
}
