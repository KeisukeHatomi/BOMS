import './App.css'
import { lazy, Suspense } from 'react'
import { AuthProvider } from './context/AuthContext'
import { Routes, Route } from 'react-router-dom'

const SignUp = lazy(() => import('./components/SignUp'));
const Home = lazy(() => import('./components/Home'));
const Login = lazy(() => import('./components/Login'));
const MasterPartsList = lazy(() => import('./components/MasterPartsList'));
const CreateNewPart = lazy(() => import('./components/CreateNewPart'));

function App() {

  return (
    <div className="App">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthProvider>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/masterpartslist" element={<MasterPartsList />} />
            <Route path="/createnewpart" element={<CreateNewPart />} />
          </Routes>
        </AuthProvider>
      </Suspense>
    </div>
  )
}

export default App
