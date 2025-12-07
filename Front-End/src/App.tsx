
import './App.css'
import useRouteElements from './routes/useRouteElements'
import { Toaster } from 'sonner'
import { UserProvider } from './context/UserContext'
import { ImportProvider } from './context/ImportContext'
import GlobalImportNotification from './components/common/GlobalImportNotification'
import GlobalImportResultDialog from './components/common/GlobalImportResultDialog'

function App() {
  const router = useRouteElements()
  return (
    <UserProvider>
      <ImportProvider>
        <div>
          {router}
          <Toaster />
          <GlobalImportNotification />
          <GlobalImportResultDialog />
        </div>
      </ImportProvider>
    </UserProvider>
  )
}

export default App
