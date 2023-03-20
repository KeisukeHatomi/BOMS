import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, provider, } from '../firebase';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const Login = () => {
    const navigation = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const { email, password } = e.target.elements;
        console.log(email.value, password.value);

        signInWithEmailAndPassword(auth, email.value, password.value)
            .then((userCredential) => {
                const user = userCredential.user;
                navigation('/');
            })
            .catch((err) => {
                console.log(err);
                setError(err.message);
            });
    };

    const handleGoogleLogin = () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                navigation('/');
            })
            .catch((err) => {
                console.log(err);
                setError(err.message);
            });
    }

    const handleSignup=()=>{
        navigation('/signup');

    }

    return (
        <div>
            <h1>ログイン</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <TextField
                        sx={{ width: '300px' }}
                        name='email'
                        id="standard-email-input"
                        label="E-mail"
                        type="email"
                        autoComplete="current-email"
                        variant="standard"
                    />
                </div>
                <div>
                    <TextField
                        sx={{ width: '300px' }}
                        name='password'
                        id="standard-password-input"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        variant="standard"
                    />
                </div>
                <div>
                    <Button type="submit" variant="contained" sx={{margin:'20px'}}>ログイン</Button>
                </div>

                <div>
                    {/* ユーザ登録は<Link to={'/signup'}>こちら</Link>から */}
                    <Button variant="text" onClick={handleSignup}>新規登録</Button>
                </div>
            </form>
            <div>
                <hr style={{marginTop:'10px', content:'OR'}} />
            </div>
            <div>
                <Button variant="contained" sx={{margin:'20px'}} onClick={handleGoogleLogin}>Googleアカウントでログイン</Button>
            </div>

        </div>
    );
};

export default Login;