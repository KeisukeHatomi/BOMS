import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import * as fb from './FirestoreUserFunctions';

import { Box, Button, Typography, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CloudSyncIcon from '@mui/icons-material/CloudSync';

function FileUpload(props) {
	const [companyId, setCompanyId] = useState('');
	const [pdfUploading, setPdfUploading] = useState(false);
	const [stepUploading, setStepUploading] = useState(false);
	const [previewDrawUrl, setPreviewDrawUrl] = useState(props.drawingUrl);
	const [previewStepUrl, setPreviewStepUrl] = useState('');

	const onDrop = (files) => {
		const file = files[0];
		if (file.type !== 'application/pdf') {
			alert('PDFファイルのみアップロード可能です。');
			return;
		}
		setPdfUploading(true);
		const fileName = `${props.partCode}_${props.partName}_Rev${props.revision}`;

		const storageRef = ref(storage, `${companyId}/${fileName}`);
		uploadBytes(storageRef, file)
			.then((snapshot) => {
				getDownloadURL(snapshot.ref).then((downloadURL) => {
					setPreviewDrawUrl(downloadURL);
					setPdfUploading(false);
					// Firestoreに図面Urlを保存
					fb.setDrawingUrl('MUSE', props.field, props.partCode, downloadURL);
				});
			})
			.catch((error) => {
				console.error('Upload failed', error);
				setPdfUploading(false);
			});
	};
	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		multiple: false, // 複数ファイルのアップロードを禁止
	});

	useEffect(() => {
		fb.getComanyId('MUSE').then((item) => {
			setCompanyId(item);
		});
	}, []);

	return (
		<Box>
			<Box
				{...getRootProps()}
				sx={{
					border: '2px dashed #eeeeee',
					borderRadius: 3,
					padding: '20px',
					textAlign: 'center',
					cursor: 'pointer',
					bgcolor: '#fafafa',
					color: '#bdbdbd',
					'&:hover': {
						bgcolor: '#eeeeee',
					},
					mb: 2,
				}}
			>
				<input {...getInputProps()} />
				{pdfUploading ? (
					<CircularProgress />
				) : (
					<>
						{previewDrawUrl && (
							<object data={previewDrawUrl} type="application/pdf" width="100%" height="870px">
								図面プレビューが表示されない場合は、<a href={previewDrawUrl}>こちら</a>
								をクリックしてください。
							</object>
						)}
						{previewDrawUrl ? (
							<Box>
								<Button
									startIcon={<CloudSyncIcon />}
									variant="contained"
									component="span"
									sx={{ mr: 1 }}
								>
									図面の差し替え
								</Button>
								<Button startIcon={<DeleteForeverIcon />} variant="contained" component="span">
									削除
								</Button>
							</Box>
						) : (
							<Box>
								<Typography variant="body2">図面(PDF)ファイルをドラッグ&ドロップ、または</Typography>
								<Button startIcon={<CloudUploadIcon />} variant="contained" component="span">
									図面(PDF)を選択
								</Button>
							</Box>
						)}
					</>
				)}
			</Box>
			<Box
				{...getRootProps()}
				sx={{
					border: '2px dashed #eeeeee',
					borderRadius: 3,
					padding: '20px',
					textAlign: 'center',
					cursor: 'pointer',
					bgcolor: '#fafafa',
					color: '#bdbdbd',
					'&:hover': {
						bgcolor: '#eeeeee',
					},
					mb: 2,
				}}
			>
				<input {...getInputProps()} />
				{stepUploading ? (
					<CircularProgress />
				) : (
					<>
						{previewStepUrl && (
							<object data={previewStepUrl} type="application/pdf" width="100%" height="870px">
								モデルプレビューが表示されない場合は、<a href={previewDrawUrl}>こちら</a>
								をクリックしてください。
							</object>
						)}
						{previewStepUrl ? (
							<Box>
								<Button
									startIcon={<CloudSyncIcon />}
									variant="contained"
									component="span"
									sx={{ mr: 1 }}
								>
									3Dモデル(STEP)の差し替え
								</Button>
								<Button startIcon={<DeleteForeverIcon />} variant="contained" component="span">
									削除
								</Button>
							</Box>
						) : (
							<Box>
								<Typography variant="body2">
									3Dモデル(STEP)ファイルをドラッグ&ドロップ、または
								</Typography>
								<Button startIcon={<CloudUploadIcon />} variant="contained" component="span">
									3Dモデル(STEP)を選択
								</Button>
							</Box>
						)}
					</>
				)}
			</Box>
		</Box>
	);
}

export default FileUpload;
