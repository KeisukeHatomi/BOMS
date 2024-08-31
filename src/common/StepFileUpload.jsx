import React, { useEffect, useState, useContext, useRef } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as fb from './FirestoreUserFunctions';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { useDropzone } from 'react-dropzone';
import { PropContext } from '../context/PropContext';
import CommonDialog, { ButtonType } from './Dialog';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
	Grid,
	OrbitControls,
	Bounds,
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
import * as THREE from 'three';

const CameraAndLight = () => {
	const { camera } = useThree();
	const cameraLightRef1 = useRef();
	const cameraLightRef2 = useRef();
	const cameraLightRef3 = useRef();

	useFrame(() => {
		if (cameraLightRef1.current && cameraLightRef2.current && cameraLightRef3.current) {
			// カメラの位置と同じ位置にライトを配置
			cameraLightRef1.current.position.copy(camera.position);
			cameraLightRef2.current.position.copy(camera.position);
			cameraLightRef3.current.position.copy(camera.position);

			// ライトをカメラの周りに少しずつずらして配置する
			cameraLightRef2.current.position.add(new THREE.Vector3(50, 50, 50));
			cameraLightRef3.current.position.add(new THREE.Vector3(-50, -50, -50));
		}
	});

	return (
		<>
			<pointLight ref={cameraLightRef1} intensity={1} />
			<pointLight ref={cameraLightRef2} intensity={0.5} />
			<pointLight ref={cameraLightRef3} intensity={0.5} />
		</>
	);
};

function StepModel({ data, canvasRef, cameraRef, ...props }) {
	const [obj, setObj] = useState(null);
	const meshRef = useRef();

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
			<mesh ref={meshRef}>
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
		accept: {
			'application/step': ['.step'],
		},
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
									<Canvas camera={{ fov: 20, position: [0, 2, 5] }}>
										<Bounds fit clip observe margin={1}>
											{/* <ambientLight /> */}
											{/* <pointLight position={[0, 30, 0]} /> */}
											<CameraAndLight />
											{isLoaded && <StepModel position={[0, 0, 0]} data={file} />}
										</Bounds>
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
