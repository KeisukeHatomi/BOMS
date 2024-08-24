import { useEffect, createContext, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import * as fb from '../common/FirestoreUserFunctions';
import { auth } from '../firebase';
import { useAuthContext } from '../context/AuthContext';
import { PropContext } from '../context/PropContext';
import { Button, Box, FormControl } from '@mui/material';

const Home = () => {
	const navigation = useNavigate();
	const { user } = useAuthContext();
	const { companyId, setCompanyId } = useContext(PropContext);

	const handleLogout = () => {
		auth.signOut().then(() => navigation('/login'));
	};

	const handleMasterParts = () => {
		navigation('/masterpartslist'); // Dynamic import によるroutes の場合、ref="/***"では、本番環境でnot foundになってしまう
	};

	const handleCreatePart = () => {
		navigation('/createnewpart'); // Dynamic import によるroutes の場合、ref="/***"では、本番環境でnot foundになってしまう
	};

	const handleProfile = () => {
		navigation('/userprofile');
	};

	const handleUpdatePassword = () => {
		navigation('/updatepassword');
	};

	const handleDbTest = () => {
		navigation('/dbtest');
	};

	useEffect(() => {
		fb.getCompanyId('MUSE').then((e) => {
			setCompanyId(e);
			console.log('Company Name🔵 ', e);
		});
	}, []);

	if (!user) {
		return <Navigate replace to="/login" />;
	} else {
		return (
			<div>
				<Box sx={{ mt: 1 }}> {user.displayName} さん</Box>
				<Box display="flex" flexDirection="coloumn" justifyContent="center">
					<FormControl variant="standard" sx={{ width: 200 }}>
						<Box sx={{ mt: 1, fontSize: 'h4', fontWeight: 'bold' }}>ホームメニュー</Box>
						<Button variant="contained" onClick={handleMasterParts} sx={{ mt: '10px'}}>
							マスター部品一覧
						</Button>
						<Button variant="contained" onClick={handleCreatePart} sx={{ mt: '10px' }}>
							マスター部品登録
						</Button>
						<Button variant="contained" onClick={handleProfile} sx={{ mt: '10px' }}>
							ユーザプロファイル
						</Button>
						<Button variant="contained" onClick={handleUpdatePassword} sx={{ mt: '10px' }}>
							パスワードの変更
						</Button>
						<Button variant="contained" onClick={handleLogout} sx={{ mt: '10px' }}>
							ログアウト
						</Button>
						{/* <Button variant="outlined" onClick={handleDbTest} sx={{ mt: '10px' }}>
							データベーステスト
						</Button> */}
					</FormControl>
				</Box>
			</div>
		);
	}
};

export default Home;
