import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';
import { Button, InputAdornment, TextField, Box } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const SignUp = () => {
	const navigation = useNavigate();
	const [error, setError] = useState('');

	// パスワード表示制御用のstate
	const [pass1Vis, setPass1Vis] = useState(false); // パスワード入力時のトグル
	const [pass2Vis, setPass2Vis] = useState(false); // パスワード入力時のトグル

	const togglePassword1 = () => {
		setPass1Vis(!pass1Vis);
	};

	const togglePassword2 = () => {
		setPass2Vis(!pass2Vis);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const { email, password, comfirm } = e.target.elements;

		if (password.value !== comfirm.value) {
			alert('入力したパスワードが異なります。\n確認してください。');
		} else {
			try {
				const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
				const user = userCredential.user;
				await sendEmailVerification(auth.currentUser);
				alert(
					'ご登録いただいたメールアドレスに確認用 URL を送信しました。\nメール本文内の URL をクリックして確認を済ませてください。'
				);
				auth.signOut().then(() => navigation('/login'));
			} catch (e) {
				setError(e.message);
				console.log(e);
			}
		}
	};

	return (
		<div>
			<Box sx={{ marginTop: 1, fontSize: 'h4', fontWeight: 'bold' }}>ユーザー仮登録</Box>
			{error && <p style={{ color: 'red' }}>{error}</p>}
			<form onSubmit={handleSubmit}>
				<div>
					<TextField
						sx={{ width: '300px' }}
						name="email"
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
						name="password"
						id="standard-new-password-input"
						label="New Password"
						type={pass1Vis ? 'text' : 'password'}
						autoComplete="new-password"
						variant="standard"
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									{pass1Vis ? (
										// 表示
										<VisibilityOffIcon
											onClick={togglePassword1}
											className="Password__visual"
											sx={{
												':hover': {
													cursor: 'default',
												},
											}}
										/>
									) : (
										// 非表示
										<VisibilityIcon
											onClick={togglePassword1}
											className="Password__visual"
											sx={{
												':hover': {
													cursor: 'default',
												},
											}}
										/>
									)}
								</InputAdornment>
							),
						}}
					/>
				</div>
				<div>
					<TextField
						sx={{ width: '300px' }}
						name="comfirm"
						id="standard-comfirm-password-input"
						label="Comfirm Password"
						type={pass2Vis ? 'text' : 'password'}
						autoComplete="new-password"
						variant="standard"
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									{pass2Vis ? (
										// 表示
										<VisibilityOffIcon
											onClick={togglePassword2}
											className="Password2__visual"
											sx={{
												':hover': {
													cursor: 'default',
												},
											}}
										/>
									) : (
										// 非表示
										<VisibilityIcon
											onClick={togglePassword2}
											className="Password2__visual"
											sx={{
												':hover': {
													cursor: 'default',
												},
											}}
										/>
									)}
								</InputAdornment>
							),
						}}
					/>
				</div>
				<div>
					<Button type="submit" variant="contained" sx={{ margin: '20px' }}>
						仮登録
					</Button>
				</div>
			</form>
		</div>
	);
};

export default SignUp;
