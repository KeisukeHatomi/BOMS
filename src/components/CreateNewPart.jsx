import React, { useState, useEffect, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import * as fb from '../common/FirestoreUserFunctions';
import DlgComfirm from '../common/DlgComfirmResistNerPart';
import { PropContext } from '../context/PropContext';

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

const COMPANY = 'MUSE';

function CreateNewPart() {
	const navigation = useNavigate();

	const { companyId } = useContext(PropContext);
	const [partName, setPartName] = useState('');
	const [partCode, setPartCode] = useState('');
	const [method, setMethod] = useState('');
	const [usedInAssy, setUsedInAsssy] = useState([]);
	const [revision, setRevision] = useState(1);
	const [notes, setNotes] = useState('');
	const { user } = useAuthContext();
	const [selectCategory, setSelectCategory] = useState('');
	const [partCategory, setPartCategory] = useState([]);
	const [digOpen, setDigOpen] = useState(false);
	const strageKey = {
		Category: 'N_Category',
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const header = partCategory.find((e) => e.category === selectCategory);
		const newCode = await createCodeNumber(header);
		setPartCode(newCode.value);

		const partProp = {
			createdDate: new Date(),
			updateDate: new Date(),
			createdUser: user.displayName,
			updateUser: user.displayName,
			drawingUrl: '',
			modelDataUrl: '',
			method: method,
			partName: partName,
			revision: revision,
			usedInAssy: usedInAssy,
			notes: notes,
		};

		fb.getPart(companyId, header.field, newCode.value).then((data) => {
			if (data === null) {
				fb.setPart(companyId, header.field, newCode.value, partProp).then(()=>{
					fb.setLog(companyId, { // Log
						date: new Date(),
						user: user.displayName,
						action: '新設 : ' + newCode.value,
					});
				});
				setDigOpen(true);
			} else {
			}
		});
	};

	const handleChange = (e) => {
		const item = e.target.value;
		setSelectCategory(item);
		localStorage.setItem(strageKey.Category, item);
	};

	const onChangeCodeName = (e) => {
		const item = e.target.value.toUpperCase();
		setPartName(item);
	};

	const createCodeNumber = async (head) => {
		const res = await fb.getCategory(companyId);
		// 対象ヘッドコードの最終番号を取得して新番を設定
		const newVal = res[head.field].lastNumber + 1;
		console.log('newVal🔵 ', newVal);
		const code = {
			value: head.headCode + newVal.toString().padStart(4, '0'),
			number: newVal,
		};
		// 品番カテゴリーの最終番号をアップデート
		await fb.updateCategory(companyId, {
			category: {
				[head.field]: { lastNumber: newVal },
			},
		});
		return code;
	};

	useEffect(() => {
		// リロードされるとuseContextが消えるので、ホームへ戻す
		if (!companyId) {
			navigation('/');
		}

		fb.getCategory(companyId).then((item) => {
			const item_array = Object.entries(item).map(([key, value]) => {
				return {
					field: key,
					headCode: value.headCode,
					category: value.category,
					lastNumber: value.lastNumber,
				};
			});
			setPartCategory(item_array);

			const value = localStorage.getItem(strageKey.Category);
			console.log('value🔵 ', value);
			setSelectCategory(value);
		});
	}, []);

	if (!user) {
		return <Navigate replace to="/login" />;
	} else {
		return (
			<div>
				<Box
					sx={{ m: 1 }}
					noValidate
					autoComplete="off"
					display={'flex'}
					flexDirection={'column'}
					justifyContent={'center'}
				>
					<Box sx={{ fontSize: 'h4', fontWeight: 'bold' }}>マスター部品登録</Box>
					<form onSubmit={handleSubmit}>
						<FormControl variant="standard" sx={{ width: 300 }}>
							<InputLabel id="select-category">カテゴリ</InputLabel>
							<Select
								required
								labelId="select-category"
								id="categorySelect"
								value={selectCategory}
								label="Item"
								onChange={handleChange}
								sx={{ textAlign: 'left', m: 1 }}
							>
								{partCategory.map((item) => (
									<MenuItem key={item.field} value={item.category}>
										{item.category}
									</MenuItem>
								))}
							</Select>
							<TextField
								required
								variant="standard"
								id="name"
								name="name"
								label="品名"
								onChange={onChangeCodeName}
								value={partName}
								sx={{ textAlign: 'left', m: 1 }}
							/>
							<Button type="submit" variant="contained" sx={{ m: 1 }}>
								登録
							</Button>
							<Button startIcon={<HomeIcon />} variant="contained" sx={{ m: 1 }} href="/">
								ホーム
							</Button>
						</FormControl>
					</form>
				</Box>
				<DlgComfirm
					title="登録完了"
					pCode={partCode}
					pName={partName}
					onAccept={() => {
						setPartName('');
					}}
					onClose={() => setDigOpen(false)}
					open={digOpen}
				/>
			</div>
		);
	}
}

export default CreateNewPart;
