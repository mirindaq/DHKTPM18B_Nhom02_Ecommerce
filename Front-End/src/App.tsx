
import './App.css'
import useRouteElements from './routes/useRouteElements'
import { Toaster } from 'sonner'

function App() {
  const router = useRouteElements()
  return (
    <>
      <div>
        {router}
        <Toaster />
      </div>
    </>
  )
}

export default App
