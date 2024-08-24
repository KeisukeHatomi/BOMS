import React, { useEffect, useState, useContext } from 'react';
import { PropContext } from '../context/PropContext';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as fb from './FirestoreUserFunctions';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { useDropzone } from 'react-dropzone';
import CommonDialog, { ButtonType } from './Dialog';

function PdfFileUpload(props) {
	const { companyId } = useContext(PropContext);
	const [digOpen, setDigOpen] = useState(false);
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
					fb.setDrawingUrl(companyId, props.field, props.partCode, downloadURL).then(() => {
						fb.setLog(companyId, {
							// Log
							date: new Date(),
							user: props.user.displayName,
							action: 'PDFアップロード : ' + fileName,
						});
					});
				});
			})
			.catch((error) => {
				console.error('Upload failed', error);
				setPdfUploading(false);
			});
	};

	const handleDelete = () => {
		setDigOpen(true);
	};

	const deletePDF = () => {
		const fileName = `${props.partCode}_${props.partName}_Rev${props.revision}.pdf`;
		const storageRef = ref(storage, `${companyId}/${fileName}`);
		deleteObject(storageRef)
			.then(() => {
				fb.setLog(companyId, {
					// Log
					date: new Date(),
					user: props.user.displayName,
					action: 'PDF削除 : ' + fileName,
				});
				// ダウンロードurlを削除
				fb.setDrawingUrl(companyId, props.field, props.partCode, '');
				setPreviewPdfUrl('');
			})
			.catch((e) => console.log(e));
	};

	const { getRootProps, getInputProps, open } = useDropzone({
		onDrop,
		accept: {
			'application/pdf': ['.pdf'],
		},
		noClick: true,
		multiple: false, // 複数ファイルのアップロードを禁止
	});

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
								<Button
									startIcon={<DeleteForeverIcon />}
									variant="contained"
									component="span"
									onClick={handleDelete}
								>
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
			<CommonDialog
				title="確認"
				message="ファイルを削除します。復活はできません。よろしいですか？"
				buttonType={ButtonType.YesNo}
				onAccept={() => {
					console.log('OK');
					deletePDF();
					setDigOpen(false);
				}}
				onClose={() => {
					console.log('NO');
					setDigOpen(false);
				}}
				open={digOpen}
			/>
		</Box>
	);
}

export default PdfFileUpload;
