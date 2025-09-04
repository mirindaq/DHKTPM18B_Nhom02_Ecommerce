
import './App.css'
import useRouteElements from './routes/useRouteElements'

function App() {
  const router = useRouteElements()
  return (
    <>
      <div>
        {router}
      </div>
    </>
  )
}

export default App
