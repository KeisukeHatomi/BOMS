import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { Navigate, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';

const Collection = 'USER';

function UserProfile() {
	const { user } = useAuthContext();
	const [purpose, setPurpose] = useState('');
	const [message, setMessage] = useState('');
	const [lastName, setLastName] = useState('');
	const [firstName, setFirstName] = useState('');
	const [isResisted, setIsResisted] = useState(true);
	const navigation = useNavigate();

	const wait = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	useEffect(() => {
		if (user) {
			getData(user.email).then((data) => {
				if (data !== null) {
					setLastName(data.lastName);
					setFirstName(data.firstName);
					setPurpose(data.purpose);
				} else {
					setIsResisted(false);
				}
			});
		}
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();

		const userProfile = {
			lastName: lastName,
			firstName: firstName,
			displayName: lastName + " " + firstName,
			purpose: purpose,
			createdDate: new Date(),
		};

		try {
			setData(user.email, userProfile).then(async () => {
				if (isResisted) {
					setMessage('更新しました。');
				} else {
					setMessage('ご登録ありがとうございます。');
				}
				await wait(2000);
				navigation('/');
			});
		} catch (e) {
			setMessage(e);
		}

		updateProfile(auth.currentUser, {
			displayName: userProfile.displayName,
		}).then();
	};

	const setData = async (code, prop) => {
		await setDoc(doc(db, Collection, code), prop);
	};

	const getData = async (code) => {
		const docSnap = await getDoc(doc(db, Collection, code));
		let result = null;
		if (docSnap.exists()) {
			result = docSnap.data();
		}
		return result;
	};

	const handleChangePurpose = (e) => {
		setPurpose(e.target.value);
	};

	const handleChangeLastName = (e) => {
		setLastName(e.target.value);
	};

	const handleChangeFirstName = (e) => {
		setFirstName(e.target.value);
	};

	if (!user) {
		return <Navigate replace to="/login" />;
	} else {
		return (
			<div>
				<h1>ユーザ情報登録</h1>

				<form onSubmit={handleSubmit}>
					<div>
						<TextField
							sx={{ width: '300px', m: 1 }}
							name="email"
							id="email-print"
							label="E-mail"
							type="email"
							autoComplete=""
							variant="standard"
							defaultValue={user.email}
							InputProps={{
								readOnly: true,
							}}
						/>
					</div>
					<div>
						<TextField
							required
							sx={{ width: '300px', m: 1 }}
							name="lastName"
							id="last-name-input"
							label="姓 / last name"
							type="text"
							autoComplete=""
							variant="standard"
							value={lastName}
							onChange={handleChangeLastName}
						/>
					</div>
					<div>
						<TextField
							required
							sx={{ width: '300px', m: 1 }}
							name="firstName"
							id="first-name-input"
							label="名 / first name"
							type="text"
							autoComplete=""
							variant="standard"
							value={firstName}
							onChange={handleChangeFirstName}
						/>
					</div>
					<div>
						<FormControl variant="standard" sx={{ m: 1, minWidth: 300 }}>
							<InputLabel id="purposSelect-label">利用目的 / purpose of use</InputLabel>
							<Select
								required
								labelId="purposSelect"
								id="purposSelect"
								value={purpose}
								onChange={handleChangePurpose}
								sx={{ textAlign: 'left' }}
							>
								<MenuItem value=""></MenuItem>
								<MenuItem value={'personal'}>個人利用 / personal use</MenuItem>
								<MenuItem value={'business'}>業務利用 / business use</MenuItem>
							</Select>
						</FormControl>
					</div>
					{isResisted ? (
						<div>
							<Button type="submit" variant="contained">
								更新
							</Button>
							<Button variant="contained" sx={{ margin: '10px' }} href="/">
								キャンセル
							</Button>
						</div>
					) : (
						<div>
							<Button type="submit" variant="contained">
								登録
							</Button>
						</div>
					)}
					{message ? <div>{message}</div> : <div>&nbsp;</div>}
				</form>
			</div>
		);
	}
}

export default UserProfile;
