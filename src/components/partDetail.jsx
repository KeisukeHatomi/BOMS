import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Navigate, useNavigate } from 'react-router-dom';

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

	const { id } = useParams();
	const location = useLocation();
	const { row } = location.state;

	const props = {
		field: row.field,
		partCode: id,
		partName: row.partName,
		revision: row.revision,
		drawingUrl: row.drawingUrl,
		modelDataUrl: row.modelDataUrl,
	};

	const method = ['板金', '切削', '3Dプリント', '切削', 'シート'];

	const [selectMethod, setSelectMethod] = useState(row.method);
	const [partName, setPartName] = useState(row.partName);
	const [notes, setNotes] = useState(row.notes);

	const handleChangeMethod = (e) => {
		setSelectMethod(e.target.value);
		fb.updatePart('MUSE', row.field, id, {
			method: e.target.value,
		}).then(console.log('🟠工法を更新'));
	};

	const handleChangePartName = (e) => {
		const char = e.target.value.replace(/[^\x01-\x7E\xA1-\xDF]+/g, '');
		const name = char.toUpperCase();
		setPartName(name);
		fb.updatePart('MUSE', row.field, id, {
			partName: name,
		});
	};

	const handleChangeNotes = (e) => {
		setNotes(e.target.value);
	};

	const handleBlur = (e) => {
		fb.updatePart('MUSE', row.field, id, {
			notes: notes,
		}).then(console.log('🟠備考を更新'));
	};

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
						value={selectMethod}
						label="Item"
						onChange={handleChangeMethod}
						sx={{ textAlign: 'left', m: 0, width: '8em' }}
					>
						{method.map((item, index) => (
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
					value={format(row.updateNewDate, 'yyyy-MM-dd')}
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
					onBlur={handleBlur}
					multiline
					rows={3}
					fullWidth
					InputProps={{
						readOnly: false,
					}}
					sx={{ mb: 1 }}
				/>
			</Box>

			<PdfFileUpload {...props} />
			<StepFileUpload {...props}></StepFileUpload>
			<Button
				variant="contained"
				sx={{ m: 1 }}
				onClick={() => {
					navigation(-1);
				}}
			>
				戻る
			</Button>
		</div>
	);
}

export default partDetail;
