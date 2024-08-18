import './App.css';
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PropProvider } from './context/PropContext';

const SignUp = lazy(() => import('./components/SignUp'));
const Home = lazy(() => import('./components/Home'));
const Login = lazy(() => import('./components/Login'));
const MasterPartsList = lazy(() => import('./components/MasterPartsList'));
const CreateNewPart = lazy(() => import('./components/CreateNewPart'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const PartDetail = lazy(() => import('./components/PartDetail'));
const UpdatePassword = lazy(() => import('./components/UpdatePassword'));
const DBTest = lazy(() => import('./components/DBTest'));

function App() {
	return (
		<div className="App">
			<Suspense fallback={<div>Loading...</div>}>
				<AuthProvider>
					<PropProvider>
						<Routes>
							<Route exact path="/" element={<Home />} />
							<Route path="/signup" element={<SignUp />} />
							<Route path="/login" element={<Login />} />
							<Route path="/masterpartslist" element={<MasterPartsList />} />
							<Route path="/createnewpart" element={<CreateNewPart />} />
							<Route path="/userprofile" element={<UserProfile />} />
							<Route path="/updatepassword" element={<UpdatePassword />} />
							<Route path="/partdetail/:id" element={<PartDetail />} />
							<Route path="/dbtest" element={<DBTest />} />
						</Routes>
					</PropProvider>
				</AuthProvider>
			</Suspense>
		</div>
	);
}

export default App;