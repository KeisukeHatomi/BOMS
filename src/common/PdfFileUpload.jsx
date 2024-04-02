import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import * as fb from './FirestoreUserFunctions';

import { Box, Button, Typography, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CloudSyncIcon from '@mui/icons-material/CloudSync';

function PdfFileUpload(props) {
	const [companyId, setCompanyId] = useState('');
	const [pdfUploading, setPdfUploading] = useState(false);
	const [previewPdfUrl, setPreviewPdfUrl] = useState(props.drawingUrl);

	const onDrop = (files) => {
		const file = files[0];
		if (file.type !== 'application/pdf') {
			alert('PDFファイルのみアップロード可能です。');
			return;
		}
		setPdfUploading(true);
		const fileName = `${props.partCode}_${props.partName}_Rev${props.revision}.pdf`;

		const storageRef = ref(storage, `${companyId}/${fileName}`);
		uploadBytes(storageRef, file)
			.then((snapshot) => {
				getDownloadURL(snapshot.ref).then((downloadURL) => {
					setPreviewPdfUrl(downloadURL);
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
	const { getRootProps, getInputProps, open } = useDropzone({
		onDrop,
		noClick:true,
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
					mb: 1,
				}}
			>
				<input {...getInputProps()} />
				{pdfUploading ? (
					<CircularProgress />
				) : (
					<>
						{previewPdfUrl ? (
							<Box mb={1}>
								<object data={previewPdfUrl} type="application/pdf" width="100%" height="870px">
									図面プレビューが表示されない場合は、<a href={previewPdfUrl}>こちら</a>
									をクリックしてください。
								</object>
								<Button
									startIcon={<CloudSyncIcon />}
									variant="contained"
									component="span"
									sx={{ mr: 1 }}
									onClick={open}
								>
									図面の差し替え
								</Button>
								<Button startIcon={<DeleteForeverIcon />} variant="contained" component="span">
									削除
								</Button>
							</Box>
						) : (
							<Box mb={1}>
								<Typography variant="body2">図面(PDF)ファイルをドラッグ&ドロップ、または</Typography>
								<Button
									startIcon={<CloudUploadIcon />}
									variant="contained"
									component="span"
									onClick={open}
								>
									図面(PDF)を選択
								</Button>
							</Box>
						)}
					</>
				)}
			</Box>
		</Box>
	);
}

export default PdfFileUpload;
