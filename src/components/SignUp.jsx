import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const SignUp = () => {
    const navigation = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const { email, password } = e.target.elements;
        createUserWithEmailAndPassword(auth, email.value, password.value)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log(user);
                navigation("/userprofile");
            })
            .catch((err) => {
                setError(err.message);
                console.log(err);
            });
    };

    return (
        <div>
            <h1>ユーザ登録</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <TextField
                        sx={{ width: '300px' }}
                        name='email'
                        id="standard-email-input"
                        label="E-mail"
                        type="email"
                        autoComplete="email"
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
                        autoComplete="new-password"
                        variant="standard"
                    />
                </div>
                <div>
                    <Button type="submit" variant="contained" sx={{ margin: '20px' }}>次へ</Button>
                </div>
            </form>
        </div>
    );
};

export default SignUp;