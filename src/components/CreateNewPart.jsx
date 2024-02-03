import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import * as fb from '../common/FirestoreUserFunctions';
import CommonDialog, { ButtonType } from '../common/Dialog';

import { Navigate, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

import CircularProgress from '@mui/material/CircularProgress';

const COMPANY = 'MUSE';

const PART_CATEGORY = {
	mecha: 'MECHA',
	elec: 'ELEC',
	harness: 'HARNESS',
	assy: 'ASSY',
	purchase: 'PURCHASE',
};

const part_category = {
	category: {
		[PART_CATEGORY.mecha]: { headCode: 'M', category: '機械部品', lastNumber: 0 },
		[PART_CATEGORY.elec]: { headCode: 'E', category: '電気部品', lastNumber: 0 },
		[PART_CATEGORY.harness]: { headCode: 'H', category: 'ハーネス部品', lastNumber: 0 },
		[PART_CATEGORY.assy]: { headCode: 'A', category: '組立品', lastNumber: 0 },
		[PART_CATEGORY.purchase]: { headCode: 'P', category: '購入品', lastNumber: 0 },
	},
};

const part_category_array = Object.entries(part_category.category).map(([key, value]) => {
	return {
		field: key,
		headCode: value.headCode,
		category: value.category,
		lastNumber: value.lastNumber,
	};
});

function CreateNewPart() {
	const [partName, setPartName] = useState('');
	const [partCode, setPartCode] = useState('');
	const [method, setMethod] = useState('');
	const [usedInAssy, setUsedInAsssy] = useState([]);
	const [revision, setRevision] = useState(1);
	const { user } = useAuthContext();
	const [selectCategory, setSelectCategory] = useState('');
	const [partCategory, setPartCategory] = useState(part_category_array);
	const [digOpen, setDigOpen] = useState(false);

	const handleTest = async (e) => {
		const res = await fb.getComanyId(COMPANY);

		await fb.setField(COMPANY, part_category);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const header = partCategory.find((e) => e.category === selectCategory);
		const newCode = await createCodeNumber(header);
		setPartCode(newCode.value);

		const partProp = {
			createdDate: new Date(),
			updateDate: new Date(),
			createdUser: user.uid,
			drawingUrl: '',
			modelDataUrl: '',
			method: method,
			partName: partName,
			revision: revision,
			usedInAssy: usedInAssy,
		};

		fb.getPart(COMPANY, header.field, newCode.value).then((data) => {
			if (data === null) {
				fb.setPart(COMPANY, header.field, newCode.value, partProp);
				setDigOpen(true);
			} else {
			}
		});
	};

	const onChangeCode = (e) => {
		const id = e.target.id;
		const val = e.target.value;
		console.log('val🔵 ', val);
		switch (id) {
			case 'name':
				setPartName(val);
				break;
			default:
		}
	};

	const handleChange = (e) => {
		const item = e.target.value;
		setSelectCategory(item);
	};

	const createCodeNumber = async (head) => {
		const res = await fb.getCategory(COMPANY);
		// 対象ヘッドコードの最終番号を取得して新番を設定
		const newVal = res[head.field].lastNumber + 1;
		const code = {
			value: head.headCode + newVal.toString().padStart(4, '0'),
			number: newVal,
		};
		// 品番カテゴリーの最終番号をアップデート
		await fb.updateCategory(COMPANY, {
			category: {
				[head.field]: { lastNumber: newVal },
			},
		});
		return code;
	};

	useEffect(() => {}, []);

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
					<Box sx={{ fontSize: 'h4', fontWeight: 'bold' }}>部品登録</Box>
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
								{part_category_array.map((item) => (
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
								onChange={onChangeCode}
								value={partName}
								sx={{ textAlign: 'left', m: 1 }}
							/>
							<Button type="submit" variant="contained" sx={{ m: 1 }}>
								登録
							</Button>
							<Button variant="contained" sx={{ m: 1 }} href="/">
								ホーム
							</Button>
							<Button variant="contained" sx={{ m: 1 }} onClick={handleTest}>
								test
							</Button>
						</FormControl>
					</form>
				</Box>
				<CommonDialog
					title="部品登録"
					message={'品番 : ' + partCode + '\n' + '品名 : ' + partName}
					buttonType={ButtonType.OkOnly}
					open={digOpen}
					onAccept={() => setPartName('')}
					onClose={() => setDigOpen(false)}
				/>
			</div>
		);
	}
}

export default CreateNewPart;
