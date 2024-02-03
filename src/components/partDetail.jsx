import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import FileUpload from '../common/FileUpload';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import TextField from '@mui/material/TextField';

function partDetail() {
	const { id } = useParams();
	const location = useLocation();
	const { row  } = location.state;

	const props ={
		field:row.field,
		partCode:id,
		partName:row.partName,
		revision:row.revision,
		drawingUrl:row.drawingUrl,
	}

	return (
		<div>
			<Box sx={{ mt: 2, mb:2 }}>
				<TextField
					variant="standard"
					id="partCode"
					name="partCode"
					label="品番"
					value={id}
					InputProps={{
						readOnly: true,
					}}
					sx={{ ml: 1, width: 200 }}
				/>
				<TextField
					variant="standard"
					id="partName"
					name="partName"
					label="品名"
					value={row.partName}
					InputProps={{
						readOnly: true,
					}}
					sx={{ ml: 1, width: 200 }}
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
					sx={{ ml: 1, width: 100 }}
				/>
			</Box>
			<FileUpload {...props} />
			<Button variant="contained" sx={{ m: 1 }} href="/masterpartslist">
				戻る
			</Button>
		</div>
	);
}

export default partDetail;
