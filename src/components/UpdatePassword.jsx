import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from 'firebase/auth';
import { useAuthContext } from '../context/AuthContext';
import { auth } from '../firebase';
import { Button, InputAdornment, TextField } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

function UpdatePassword() {
	const navigation = useNavigate();

	const { user } = useAuthContext();

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

		const { password, comfirm } = e.target.elements;

		if (password.value !== comfirm.value) {
			alert('入力したパスワードが異なります。\n確認してください。');
		} else {
			try {
				await updatePassword(user, password.value);
				alert('パスワードを変更しました。\n再度ログインしてください。');
				auth.signOut().then(() => navigation('/login'));
			} catch (e) {
				console.log(e);
			}
		}
	};

	return (
		<div>
			<h1>新しいパスワードの登録</h1>
			<form onSubmit={handleSubmit}>
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
						パスワード変更
					</Button>
					<Button variant="contained" sx={{ margin: '10px' }} href="/">
						キャンセル
					</Button>
				</div>
			</form>
		</div>
	);
}

export default UpdatePassword;
