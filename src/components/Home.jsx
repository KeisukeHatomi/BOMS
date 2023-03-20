import { auth } from '../firebase';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import Button from '@mui/material/Button';

const Home = () => {
    const navigation = useNavigate();
    const { user } = useAuthContext();

    const handleLogout = () => {
        auth.signOut().then(() => navigation('/login'));
    };

    const handleMasterParts=()=>{
        navigation('/masterpartslist'); // Dynamic import によるroutes の場合、ref="/***"では、本番環境でnot foundになってしまう
    }

    const handleCreatePart=()=>{
        navigation('/createnewpart'); // Dynamic import によるroutes の場合、ref="/***"では、本番環境でnot foundになってしまう
    }

    if (!user) {
        return <Navigate replace to="/login" />;
    } else {
        return (
            <div>
                <p> {user.email}</p>
                <div>
                    <Button variant="contained" onClick={handleMasterParts} sx={{ marginTop: '10px' }}>マスター部品一覧</Button>
                    <Button variant="contained" onClick={handleCreatePart} sx={{ marginTop: '10px' }}>部品登録</Button>
                </div>
                <div>
                    <Button variant="contained" onClick={handleLogout} sx={{ marginTop: '10px' }}>ログアウト</Button>
                </div>
            </div>
        );
    }
};

export default Home;