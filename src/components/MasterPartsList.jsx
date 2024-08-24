import React, { useState, useEffect, useRef, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import * as fb from '../common/FirestoreUserFunctions';
import { useAuthContext } from '../context/AuthContext';
import { PropContext } from '../context/PropContext';
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid } from '@mui/x-data-grid';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

const muiDataGridPageSize = 25;

function MasterPatrsList() {
	const navigation = useNavigate();

	const { user } = useAuthContext();
	const { companyId, currentCategory, setCurrentCategory } = useContext(PropContext);
	const [rows, setRows] = useState([]);
	const [nameKeyWord, setNameKeyWord] = useState('');
	const [codeKeyWord, setCodeKeyWord] = useState('');
	const [partCategory, setPartCategory] = useState([]);
	const allParts = useRef([]);

	const strageKey = {
		Category: 'Category',
		Name: 'Name',
		Code: 'Code',
		Rows: 'Rows',
		Page: 'Page',
	};

	const columns = [
		{
			field: 'id',
			headerName: '品番',
			headerClassName: 'header',
			headerAlign: 'center',
			align: 'center',
			sortable: true,
			editable: false,
			flex: 15,
		},
		{
			field: 'partName',
			headerName: '品名',
			headerClassName: 'header',
			headerAlign: 'center',
			align: 'center',
			sortable: true,
			editable: false,
			flex: 35,
		},
		{
			field: 'revision',
			headerName: '版数',
			headerClassName: 'header',
			headerAlign: 'center',
			align: 'center',
			sortable: true,
			editable: false,
			flex: 10,
			type: 'number',
		},
		{
			field: 'partClass',
			headerName: '工法',
			headerClassName: 'header',
			headerAlign: 'center',
			align: 'center',
			sortable: true,
			editable: false,
			flex: 20,
		},
		{
			headerClassName: 'header',
			field: 'drawingUrl',
			headerName: '図面PDF',
			flex: 10,
			headerAlign: 'center',
			align: 'center',
			renderCell: (params) => {
				const hasValue = params.row.drawingUrl !== '' && params.row.drawingUrl !== undefined;
				return (
					<>
						{hasValue && (
							<>
								{/* アイコンを表示 */}
								<CloudDownloadIcon
									onClick={() => {
										handleDownloadPDF(params.id);
									}}
									style={{ cursor: 'pointer', marginRight: '10px' }}
								/>
							</>
						)}
					</>
				);
			},
		},
		{
			headerClassName: 'header',
			field: 'modelDataUrl',
			headerName: '3Dモデル',
			flex: 10,
			headerAlign: 'center',
			align: 'center',
			renderCell: (params) => {
				const hasValue = params.row.modelDataUrl !== '' && params.row.modelDataUrl !== undefined;
				return (
					<>
						{hasValue && (
							<>
								{/* アイコンを表示 */}
								<CloudDownloadIcon
									onClick={() => {
										handleDownloadStep(params.id);
									}}
									style={{ cursor: 'pointer', marginRight: '10px' }}
								/>
							</>
						)}
					</>
				);
			},
		},
		{
			headerClassName: 'header',
			field: 'dxfDataUrl',
			headerName: '図面DXF',
			flex: 10,
			headerAlign: 'center',
			align: 'center',
			renderCell: (params) => {
				const hasValue = params.row.dxfDataUrl !== '' && params.row.dxfDataUrl !== undefined;
				return (
					<>
						{hasValue && (
							<>
								{/* アイコンを表示 */}
								<CloudDownloadIcon
									onClick={() => {
										handleDownloadDxf(params.id);
									}}
									style={{ cursor: 'pointer', marginRight: '10px' }}
								/>
							</>
						)}
					</>
				);
			},
		},
		{
			field: 'updateUser',
			headerName: '最終更新者',
			headerClassName: 'header',
			headerAlign: 'center',
			align: 'center',
			sortable: true,
			editable: false,
			flex: 20,
		},
		{
			field: 'updateNewDate',
			headerName: '最終更新日',
			headerClassName: 'header',
			headerAlign: 'center',
			align: 'center',
			sortable: true,
			editable: false,
			flex: 20,
			type: 'date',
		},
	];

	// 前回表示していた最後のページを読み込む
	const prePage = localStorage.getItem(strageKey.Page);
	const gridPage = prePage !== null ? prePage : 0;

	/**
	 * 品名検索キーを含む品名を検索して、Rowsにセットし、
	 * ローカルストレージに検索キーを保持させる
	 * @param {*} e
	 */
	const handleChangeNameKey = (e) => {
		const item = e.target.value.toUpperCase();
		setNameKeyWord(item);
		setCodeKeyWord('');

		if (item.length > 0) {
			const res = allParts.current.filter((part) => {
				return part.partName.includes(item);
			});
			setRows(res);
		} else {
			setRows([]);
		}
		localStorage.setItem(strageKey.Name, item);
		localStorage.setItem(strageKey.Code, '');
	};

	/**
	 * 品番検索キーを含む品番を検索して、Rowsにセットし、
	 * ローカルストレージに検索キーを保持させる
	 * @param {*} e
	 */
	const handleChangeCodeKey = (e) => {
		const item = e.target.value.toUpperCase();
		setNameKeyWord('');
		setCodeKeyWord(item);

		if (item.length > 0) {
			const res = allParts.current.filter((part) => {
				return part.id.includes(item);
			});
			setRows(res);
		} else {
			setRows([]);
		}
		localStorage.setItem(strageKey.Name, '');
		localStorage.setItem(strageKey.Code, item);
	};

	/**
	 * カテゴリーが選択されたとき、対象となるすべての部品をDBから呼び出し、
	 * 保持されている検索キーで対象となる部品をRowsにセット
	 * @param {*} e
	 */
	const handleChangeSelect = (e) => {
		const item = e.target.value;
		setCurrentCategory(item);

		const header = partCategory.find((elem) => elem.category === item);
		fb.getAllParts(companyId, header.field).then((item) => {
			allParts.current = item.map((elem) => {
				const crDate = elem.createdDate.toDate();
				const upDate = elem.updateDate.toDate();
				return { field: header.field, createdNewDate: crDate, updateNewDate: upDate, ...elem };
			});

			// 前回の検索キーを読み込む
			const nameWord = localStorage.getItem(strageKey.Name);
			if (nameWord) {
				setNameKeyWord(nameWord);

				const res = allParts.current.filter((part) => {
					return part.partName.includes(nameWord);
				});
				setRows(res);
			}

			// 前回表の検索キーを読み込む
			const codeWord = localStorage.getItem(strageKey.Code);
			if (codeWord) {
				setCodeKeyWord(codeWord);

				const res = allParts.current.filter((part) => {
					return part.id.includes(codeWord);
				});
				setRows(res);
			}
		});

		localStorage.setItem(strageKey.Category, item);
	};

	const handleRowDoubleClick = (params) => {
		navigation(`/partDetail/${params.id}`, { state: { row: params.row } });
	};

	const handlePageChange = (e) => {
		if (e.page >= 0) {
			localStorage.setItem(strageKey.Page, e.page);
		}
	};

	/**
	 * 部品情報からURLを取得してSTEPをダウンロードする
	 * @param {*} code
	 */
	const handleDownloadStep = (code) => {
		const res = allParts.current.find((part) => {
			return part.id === code;
		});

		const link = document.createElement('a');
		link.href = res.modelDataUrl;
		link.download = '';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	/**
	 * 部品情報からURLを取得してDXFをダウンロードする
	 * @param {*} code
	 */
	const handleDownloadDxf = (code) => {
		const res = allParts.current.find((part) => {
			return part.id === code;
		});

		const link = document.createElement('a');
		link.href = res.dxfDataUrl;
		link.download = '';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	/**
	 * 部品情報からURLを取得してPDFをダウンロードする
	 * @param {*} code
	 */
	const handleDownloadPDF = async (code) => {
		const res = allParts.current.find((part) => {
			return part.id === code;
		});
		const responce = await fetch(res.drawingUrl);

		// URLからファイル名を取得
		const path = getFileNameFromStorageUrl(res.drawingUrl);
		const _fname = path.split('%2F');
		const fileName = _fname[1].replace('%20', ' ');
		console.log('fileName🔵 ', fileName);

		// ブラウザに拡張子PDFが関連付けされている場合があるため、Blobデータとして取得してダウンロード
		const blob = await responce.blob();
		const url = window.URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	function getFileNameFromStorageUrl(storageUrl) {
		// URLをパースしてパスを取得
		const url = new URL(storageUrl);
		const path = url.pathname;

		// パスからファイル名を取得
		const fileName = path.split('/').pop();

		return fileName;
	}

	useEffect(() => {
		// リロードされるとuseContextが消えるので、ホームへ戻す
		if (!companyId) {
			navigation('/');
		}

		fb.getCategory(companyId).then((item) => {
			const item_array = Object.entries(item).map(([key, value]) => {
				return {
					field: key,
					headCode: value.headCode,
					category: value.category,
					lastNumber: value.lastNumber,
				};
			});
			setPartCategory(item_array);

			const value = localStorage.getItem(strageKey.Category);
			setCurrentCategory(value);

			if (value) {
				const header = item_array.find((elem) => elem.category === value);

				fb.getAllParts(companyId, header.field)
					.then((item) => {
						allParts.current = item.map((elem) => {
							const crDate = elem.createdDate.toDate();
							const upDate = elem.updateDate.toDate();
							return { field: header.field, createdNewDate: crDate, updateNewDate: upDate, ...elem };
						});

						// 前回表の検索キーを読み込む
						const nameWord = localStorage.getItem(strageKey.Name);
						if (nameWord) {
							setNameKeyWord(nameWord);

							const res = allParts.current.filter((part) => {
								return part.partName.includes(nameWord);
							});
							setRows(res);
						}

						// 前回表の検索キーを読み込む
						const codeWord = localStorage.getItem(strageKey.Code);
						if (codeWord) {
							setCodeKeyWord(codeWord);

							const res = allParts.current.filter((part) => {
								return part.id.includes(codeWord);
							});
							setRows(res);
						}
					})
					.catch((e) => console.log(e));
			}
		});
	}, []);

	if (!user) {
		return <Navigate replace to="/login" />;
	}

	return rows ? (
		<div>
			<Box sx={{ marginTop: 1, fontSize: 'h4', fontWeight: 'bold' }}>マスター部品一覧</Box>
			<FormControl
				variant="standard"
				sx={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'flex-start',
					p: 0,
					mt: 1,
					ml: 1,
					border: 'none',
					borderRadius: 2,
				}}
			>
				<Box sx={{ mb: 1, width: 200 }}>
					<InputLabel sx={{ ml: 0 }} id="select-category">
						カテゴリ
					</InputLabel>
					<Select
						required
						labelId="select-category"
						id="categorySelect"
						value={currentCategory}
						label="Item"
						onChange={handleChangeSelect}
						sx={{ textAlign: 'left', mr: 2, width: '100%' }}
					>
						{partCategory.map((item) => (
							<MenuItem key={item.field} value={item.category}>
								{item.category}
							</MenuItem>
						))}
					</Select>
				</Box>
			</FormControl>
			<FormControl
				variant="standard"
				sx={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'flex-start',
					p: 0,
					ml: 0,
					mt: 0,
					border: 'none',
					borderRadius: 2,
				}}
			>
				<Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-left', m: 0 }}>
					<TextField
						variant="standard"
						id="serchNameKey"
						name="serchNameKey"
						label="品名検索"
						onChange={handleChangeNameKey}
						value={nameKeyWord}
						sx={{ ml: 1, width: 200 }}
					/>
					{/* <Button startIcon={<SearchIcon />} variant="contained" sx={{ m: 1 }} onClick={handleNameSerch}>
							品名検索
						</Button> */}
					<TextField
						variant="standard"
						id="serchCodeKey"
						name="serchCodeKey"
						label="品番検索"
						onChange={handleChangeCodeKey}
						value={codeKeyWord}
						sx={{ ml: 1, width: 200 }}
					/>
					{/* <Button startIcon={<SearchIcon />} variant="contained" sx={{ m: 1 }} onClick={handleCodeSerch}>
							品番検索
						</Button> */}
				</Box>
			</FormControl>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'left',
					flexDirection: 'column',
					borderRadius: 2,
					border: 1,
					mt: 1,
					'& .header': {
						backgroundColor: 'lightgrey',
						fontSize: '1em',
					},
				}}
			>
				<DataGrid
					sx={{ m: 0, p: 0, borderRadius: 2 }}
					columnHeaderHeight={30}
					rowHeight={30}
					rows={rows}
					columns={columns}
					initialState={{
						pagination: {
							paginationModel: {
								pageSize: muiDataGridPageSize,
								page: Number(gridPage),
							},
						},
					}}
					onRowDoubleClick={handleRowDoubleClick}
					onPaginationModelChange={handlePageChange}

					// sortModel={[{
					//     field: 'bizName', // ここでソートする列を指定
					//     sort: 'asc', // 降順でソート
					// }]}
				/>
			</Box>
			<Button startIcon={<HomeIcon />} variant="contained" sx={{ m: 1 }} href="/">
				ホーム
			</Button>
		</div>
	) : (
		<CircularProgress />
	);
}

export default MasterPatrsList;
