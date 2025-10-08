
import './App.css'
import useRouteElements from './routes/useRouteElements'
import { Toaster } from 'sonner'
import { UserProvider } from './context/UserContext'

function App() {
  const router = useRouteElements()
  return (
    <UserProvider>
      <div>
        {router}
        <Toaster />
      </div>
    </UserProvider>
  )
}

export default App
