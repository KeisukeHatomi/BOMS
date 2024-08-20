import React, { useEffect, useState, useContext } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as fb from './FirestoreUserFunctions';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { useDropzone } from 'react-dropzone';
import { PropContext } from '../context/PropContext';
import CommonDialog, { ButtonType } from '../common/Dialog';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
	Grid,
	OrbitControls,
	Backdrop,
	Center,
	AccumulativeShadows,
	RandomizedLight,
	Environment,
	useGLTF,
	CameraControls,
} from '@react-three/drei';
import { Leva, useControls, button, buttonGroup, folder } from 'leva';
import { LoadStep } from './geometryLoader';
import { Straight } from '@mui/icons-material';

function StepModel({ data, ...props }) {
	const [obj, setObj] = useState(null);
	useEffect(() => {
		async function load() {
			const mainObject = await LoadStep(data);
			setObj(mainObject);
		}
		load();
	}, []);

	if (!obj) {
		return null;
	}
	return (
		<group {...props}>
			<mesh>
				<primitive object={obj} />
			</mesh>
		</group>
	);
}

function StepFileUpload(props) {
	const { companyId } = useContext(PropContext);
	const [digOpen, setDigOpen] = useState(false);

	const [stepUploading, setStepUploading] = useState(false);
	const [previewStepUrl, setPreviewStepUrl] = useState(props.modelDataUrl);

	const [file, setFile] = useState('');
	const [isLoaded, setIsLoaded] = useState(false);

	const onDrop = (files) => {
		const file = files[0];
		const path = file.path.split('.');
		const extension = path[1].toLowerCase();
		if (extension !== 'step' && extension !== 'stp') {
			alert('Stepファイルのみアップロード可能です。');
			return;
		}
		setIsLoaded(false);

		setStepUploading(true);
		const fileName = `${props.partCode}_${props.partName}_Rev${props.revision}.step`;

		const storageRef = ref(storage, `${companyId}/${fileName}`);
		uploadBytes(storageRef, file)
			.then((snapshot) => {
				getDownloadURL(snapshot.ref).then((downloadURL) => {
					setPreviewStepUrl(downloadURL);
					setStepUploading(false);
					// Firestoreに図面Urlを保存
					fb.setModelDataUrl(companyId, props.field, props.partCode, downloadURL).then(() => {
						fb.setLog(companyId, {
							// Log
							date: new Date(),
							user: props.user.displayName,
							action: 'STEPアップロード : ' + fileName,
						});
					});

					// file 形式からarrayBuf形式へ変換
					const reader = new FileReader();
					reader.onload = (e) => {
						const arrayBuf = e.target.result;
						setFile(arrayBuf);
					};
					reader.readAsArrayBuffer(file);
					setIsLoaded(true);
				});
			})
			.catch((error) => {
				console.error('Upload failed', error);
				setStepUploading(false);
			});
	};

	const handleClick = (e) => {
		console.log('e🔵 ', e);
	};

	const handleDelete = () => {
		setDigOpen(true);
	};

	const deleteStepData = () => {
		const fileName = `${props.partCode}_${props.partName}_Rev${props.revision}.step`;
		const storageRef = ref(storage, `${companyId}/${fileName}`);
		deleteObject(storageRef)
			.then(() => {
				fb.setLog(companyId, {
					// Log
					date: new Date(),
					user: props.user.displayName,
					action: 'STEP削除 : ' + fileName,
				});
				// ダウンロードurlを削除
				fb.setModelDataUrl(companyId, props.field, props.partCode, '');
				setPreviewStepUrl('');
			})
			.catch((e) => console.log(e));
	};

	const { getRootProps, getInputProps, open } = useDropzone({
		onDrop,
		noClick: true, // クリック時ファイルダイアログを開かせない
		multiple: false, // 複数ファイルのアップロードを禁止
	});

	useEffect(() => {
		const fetchFile = async () => {
			if (previewStepUrl) {
				try {
					const response = await fetch(previewStepUrl);
					const arrayBuffer = await response.arrayBuffer();
					setFile(arrayBuffer);
					setIsLoaded(true);
				} catch (error) {
					console.error('Error downloading file:', error);
				}
			}
		};

		fetchFile();
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
				{stepUploading ? (
					<CircularProgress />
				) : (
					<>
						{previewStepUrl ? (
							<Box>
								<Box mb={1} height={580}>
									<Canvas
										shadows
										raycaster={{ params: { Line: { threshold: 0.15 } } }}
										camera={{ position: [-10, 10, 10], fov: 20 }}
									>
										<ambientLight intensity={0.2} />
										<directionalLight position={[0, -50, 0]} />
										<directionalLight
											castShadow
											position={[2.5, 5, 5]}
											intensity={1.0}
											shadow-mapSize={[1024, 1024]}
										>
											<orthographicCamera attach="shadow-camera" args={[-5, 5, 5, -5, 1, 50]} />
										</directionalLight>
										{/* <Ground /> */}
										{isLoaded && <StepModel scale={[0.1, 0.1, 0.1]} data={file} />}
										<OrbitControls dampingFactor={0.2} enableDamping={true} />
									</Canvas>
								</Box>
								<Box>
									<Button
										startIcon={<CloudSyncIcon />}
										type="file"
										variant="contained"
										component="span"
										sx={{ mr: 1 }}
										onClick={open}
									>
										3Dモデル(STEP)の差し替え
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
							</Box>
						) : (
							<Box mb={3}>
								<Typography variant="body2">
									3Dモデル(STEP)ファイルをドラッグ&ドロップ、または
								</Typography>
								<Button
									startIcon={<CloudUploadIcon />}
									variant="contained"
									component="span"
									onClick={open}
								>
									3Dモデル(STEP)を選択
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
					deleteStepData();
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

export default StepFileUpload;
