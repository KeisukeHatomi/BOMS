import React, { useEffect, useState, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { PropContext } from '../context/PropContext';

import PdfFileUpload from '../common/PdfFileUpload';
import StepFileUpload from '../common/StepFileUpload';

import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import TextField from '@mui/material/TextField';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import * as fb from '../common/FirestoreUserFunctions';

import { format } from 'date-fns';

function partDetail() {
	const navigation = useNavigate();
	const { user } = useAuthContext();
	const { companyId } = useContext(PropContext);

	const { id } = useParams();
	const location = useLocation();
	const { row } = location.state;

	// pdf step アップロード用
	const props = {
		field: row.field,
		partCode: id,
		partName: row.partName,
		revision: row.revision,
		drawingUrl: row.drawingUrl,
		modelDataUrl: row.modelDataUrl,
	};

	const [selectPartClass, setSelectPartClass] = useState(row.partClass);
	const [partName, setPartName] = useState(row.partName);
	const [notes, setNotes] = useState(row.notes);
	const [partClass, setPartClass] = useState([]);
	const [updateDate, setUpdateDate] = useState(row.updateNewDate);

	const handleChangeClass = (e) => {
		setSelectPartClass(e.target.value);
		setUpdateDate(new Date());
		fb.updatePart(companyId, row.field, id, {
			partClass: e.target.value,
			updateDate: new Date(),
			updateUser: user.displayName,
		}).then(console.log('🟠工法を更新'));
	};

	const handleChangePartName = (e) => {
		const char = e.target.value.replace(/[^\x01-\x7E\xA1-\xDF]+/g, '');
		const name = char.toUpperCase();
		setPartName(name);
	};

	// 文字列が多いため、テキストフィールドのフォーカスを失ったときにfbへ書き込む
	const handleBlurPartName = (e) => {
		setUpdateDate(new Date());
		fb.updatePart(companyId, row.field, id, {
			partName: partName,
			updateDate: new Date(),
			updateUser: user.displayName,
		}).then(console.log('🟠品名を更新'));
	};

	const handleChangeNotes = (e) => {
		setNotes(e.target.value);
	};

	// 文字列が多いため、テキストフィールドのフォーカスを失ったときにfbへ書き込む
	const handleBlurNotes = (e) => {
		setUpdateDate(new Date());
		fb.updatePart(companyId, row.field, id, {
			notes: notes,
			updateDate: new Date(),
			updateUser: user.displayName,
		}).then(console.log('🟠備考を更新'));
	};

	useEffect(() => {
		fb.getPartClass(companyId).then((items) => {
			setPartClass(items);
		});
	}, []);

	return (
		<div>
			<Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
				<TextField
					variant="standard"
					id="partCode"
					name="partCode"
					label="品番"
					value={id}
					InputProps={{
						readOnly: true,
					}}
					sx={{ mr: 1, width: '12em' }}
				/>
				<TextField
					variant="standard"
					id="partName"
					name="partName"
					label="品名"
					value={partName}
					onChange={handleChangePartName}
					onBlur={handleBlurPartName}
					InputProps={{
						readOnly: false,
					}}
					sx={{ mr: 1, width: '30em' }}
				/>
				<TextField
					variant="standard"
					id="revision"
					name="revision"
					label="版数"
					value={row.revision}
					InputProps={{
						readOnly: true,
					}}
					sx={{ mr: 1, width: '5em' }}
				/>
				<FormControl
					variant="standard"
					sx={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'flex-start',
						p: 0,
						mt: 0,
					}}
				>
					<InputLabel id="select-method">工法</InputLabel>
					<Select
						labelId="select-method"
						id="methodSelect"
						value={selectPartClass}
						label="Item"
						onChange={handleChangeClass}
						sx={{ textAlign: 'left', m: 0, width: '8em' }}
					>
						{partClass.map((item, index) => (
							<MenuItem key={index} value={item}>
								{item}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<TextField
					variant="standard"
					id="createdDate"
					name="createdDate"
					label="登録日"
					value={format(row.createdNewDate, 'yyyy-MM-dd')}
					InputProps={{
						readOnly: true,
						style: { textAlign: 'center' },
					}}
					type="date"
					sx={{ mr: 1, width: '7em' }}
				/>
				<TextField
					variant="standard"
					id="updateDate"
					name="updateDate"
					label="最終更新日"
					value={format(updateDate, 'yyyy-MM-dd')}
					InputProps={{
						readOnly: true,
					}}
					type="date"
					sx={{ mr: 1, width: '7em' }}
				/>
			</Box>
			<Box
				sx={{
					width: '100%',
					mt: 0,
					mb: 0,
					// bgcolor: 'lightgoldenrodyellow',
					display: 'flex',
					justifyContent: 'flex-start',
				}}
			>
				<TextField
					variant="standard"
					id="notes"
					name="notes"
					label="備考"
					value={notes}
					onChange={handleChangeNotes}
					onBlur={handleBlurNotes}
					multiline
					rows={3}
					fullWidth
					InputProps={{
						readOnly: false,
					}}
					sx={{ mb: 1 }}
				/>
			</Box>
			<Button
				variant="contained"
				sx={{ m: 1 }}
				onClick={() => {
					navigation(-1);
				}}
			>
				マスター部品一覧へ戻る
			</Button>
			<PdfFileUpload {...props} />
			<StepFileUpload {...props}></StepFileUpload>
			<Button
				variant="contained"
				sx={{ m: 1 }}
				onClick={() => {
					navigation(-1);
				}}
			>
				マスター部品一覧へ戻る
			</Button>
		</div>
	);
}

export default partDetail;
