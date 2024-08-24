import React, { useEffect, useState, useContext } from 'react';
import { PropContext } from '../context/PropContext';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as fb from './FirestoreUserFunctions';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { useDropzone } from 'react-dropzone';
import CommonDialog, { ButtonType } from './Dialog';
import JSZip from 'jszip';

function DxfFileUpload(props) {
	const { companyId } = useContext(PropContext);
	const [digOpen, setDigOpen] = useState(false);
	const [dxfUploading, setDxfUploading] = useState(false);
	const [previewDxfUrl, setPreviewDxfUrl] = useState(props.dxfDataUrl);
	const [uploadProgress, setUploadProgress] = useState(0);

	const onDrop = (files) => {
		const path = files.map((item) => {
			return item.path.split('.');
		});
		const isDxf = path.every((item) => {
			return item[1].toLowerCase() === 'dxf';
		});
		if (!isDxf) {
			alert('DXFファイルのみアップロード可能です。');
			return;
		}

		handleZip(files);
	};

	const handleZip = async (files) => {
		const zip = new JSZip();

		files.forEach((file) => {
			zip.file(file.name, file);
		});

		try {
			const content = await zip.generateAsync({ type: 'blob' });
			const zipBlob = new Blob([content], { type: 'application/zip' });

			setDxfUploading(true);
			const fileName = `${props.partCode}_${props.partName}_Rev${props.revision}.zip`;
			const storageRef = ref(storage, `${companyId}/${fileName}`);

			const uploadTask = uploadBytesResumable(storageRef, zipBlob);

			uploadTask.on(
				'state_changed',
				(snapshot) => {
					// プログレスバーの更新
					const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					setUploadProgress(progress);
				},
				(error) => {
					console.error('アップロード中にエラーが発生しました:', error);
				},
				() => {
					// アップロード完了後にダウンロードURLを取得
					getDownloadURL(uploadTask.snapshot.ref).then((url) => {
						setPreviewDxfUrl(url);
						console.log('File available at', url);

						// Firestoreに図面Urlを保存
						fb.setDxfDataUrl(companyId, props.field, props.partCode, url).then(() => {
							fb.setLog(companyId, {
								// Log
								date: new Date(),
								user: props.user.displayName,
								action: 'DXFアップロード : ' + fileName,
							});
						});
						setDxfUploading(false);
					});
				}
			);
		} catch (error) {
			console.error('ZIP圧縮中にエラーが発生しました:', error);
		}
	};

	const handleDelete = () => {
		setDigOpen(true);
	};

	const deleteZIP = () => {
		const fileName = `${props.partCode}_${props.partName}_Rev${props.revision}.zip`;
		const storageRef = ref(storage, `${companyId}/${fileName}`);
		deleteObject(storageRef)
			.then(() => {
				fb.setLog(companyId, {
					// Log
					date: new Date(),
					user: props.user.displayName,
					action: 'DXF削除 : ' + fileName,
				});
				// ダウンロードurlを削除
				fb.setDxfDataUrl(companyId, props.field, props.partCode, '');
				setPreviewDxfUrl('');
			})
			.catch((e) => console.log(e));
	};

	const { getRootProps, getInputProps, open } = useDropzone({
		onDrop,
		accept: {
			'application/dxf': ['.dxf'],
		},
		noClick: true,
		multiple: true, // 複数ファイルのアップロードを許可
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
				{dxfUploading ? (
					<CircularProgress />
				) : (
					<>
						{previewDxfUrl ? (
							<Box mb={1}>
								{/* <object data={previewDxfUrl} type="application/pdf" width="100%" height="870px">
									図面プレビューが表示されない場合は、<a href={previewDxfUrl}>こちら</a>
									をクリックしてください。
								</object> */}
								<Button
									startIcon={<CloudSyncIcon />}
									variant="contained"
									component="span"
									sx={{ mr: 1 }}
									onClick={open}
								>
									図面(DXF)の差し替え
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
								<Typography variant="body2">図面(DXF)ファイルをドラッグ&ドロップ、または</Typography>
								<Button
									startIcon={<CloudUploadIcon />}
									variant="contained"
									component="span"
									onClick={open}
								>
									図面データ(DXF)を選択
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
					deleteZIP();
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

export default DxfFileUpload;
