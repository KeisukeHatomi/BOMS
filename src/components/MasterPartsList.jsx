import React, { useState, useEffect, useRef } from 'react';
import * as fb from '../common/FirestoreUserFunctions';
import { db } from '../firebase';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { useAuthContext } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid } from '@mui/x-data-grid';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';

const muiDataGridPageSize = 20;

const Collection = 'part';
const COMPANY = 'MUSE';

const columns = [
	{
		field: 'id',
		headerName: '品番',
		headerClassName: 'header',
		headerAlign: 'center',
		align: 'center',
		sortable: true,
		editable: false,
		width: 120,
	},
	{
		field: 'partName',
		headerName: '品名',
		headerClassName: 'header',
		headerAlign: 'center',
		align: 'center',
		sortable: true,
		editable: true,
		width: 120,
	},
	{
		field: 'revision',
		headerName: '版数',
		headerClassName: 'header',
		headerAlign: 'center',
		align: 'center',
		sortable: true,
		editable: true,
		width: 120,
		type: 'number',
	},
	{
		field: 'updateNewDate',
		headerName: '最終更新日',
		headerClassName: 'header',
		headerAlign: 'center',
		align: 'center',
		sortable: true,
		editable: false,
		width: 120,
		type: 'date',
	},
	{
		field: 'createdNewDate',
		headerName: '登録日',
		headerClassName: 'header',
		headerAlign: 'center',
		align: 'center',
		sortable: true,
		editable: false,
		width: 120,
		type: 'date',
	},
	{
		field: 'createdUser',
		headerName: '担当者',
		headerClassName: 'header',
		headerAlign: 'center',
		align: 'center',
		sortable: true,
		editable: false,
		width: 120,
	},
];

function MasterPatrsList() {
	const navigation = useNavigate();

	const [masterParts, setMasterParts] = useState([]);
	const { user } = useAuthContext();
	const [rows, setRows] = useState([]);
	const [nameKeyWord, setNameKeyWord] = useState('');
	const [codeKeyWord, setCodeKeyWord] = useState('');
	const [partCategory, setPartCategory] = useState([]);
	const [selectCategory, setSelectCategory] = useState('');
	const allParts = useRef([]);

	const handleChangeNameKey = (e) => {
		const item = e.target.value;
		setNameKeyWord(item);

		const res = allParts.current.filter((part) => {
			return part.partName.includes(item);
		});
		setRows(res);
	};

	const handleChangeCodeKey = (e) => {
		const item = e.target.value;
		setCodeKeyWord(item);

		const res = allParts.current.filter((part) => {
			return part.id.includes(item);
		});
		setRows(res);
	};

	const handleChangeSelect = (e) => {
		const item = e.target.value;
		setSelectCategory(item);

		const header = partCategory.find((e) => e.category === item);
		fb.getAllParts(COMPANY, header.field).then((item) => {
			allParts.current = item.map((e) => {
				const crDate = e.createdDate.toDate();
				const upDate = e.updateDate.toDate();
				return { field: header.field, createdNewDate: crDate, updateNewDate: upDate, ...e };
			});
		});
	};

	const handleNameSerch = (e) => {
		const res = allParts.current.filter((part) => {
			return part.partName.includes(nameKeyWord);
		});
		setRows(res);
	};

	const handleCodeSerch = (e) => {
		const res = allParts.current.filter((part) => {
			return part.id.includes(codeKeyWord);
		});
		setRows(res);
	};

	const handleRowClick = (params) => {
		const header = partCategory.find((e) => e.category === selectCategory);
		navigation(`/partDetail/${params.id}`, { state: { row: params.row } });
	};

	useEffect(() => {
		fb.getCategory(COMPANY).then((item) => {
			const item_array = Object.entries(item).map(([key, value]) => {
				return {
					field: key,
					headCode: value.headCode,
					category: value.category,
					lastNumber: value.lastNumber,
				};
			});
			setPartCategory(item_array);
		});
	}, []);

	if (!user) {
		return <Navigate replace to="/login" />;
	} else {
		return rows ? (
			<div>
				<FormControl
					variant="standard"
					sx={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'flex-start',
						p: 0,
						mt: 1,
						width: 340,
						border: 1,
						borderRadius: 2,
					}}
				>
					<Box sx={{ mb: 1, width: 200 }}>
						<InputLabel sx={{ ml: 1 }} id="select-category">
							カテゴリ
						</InputLabel>
						<Select
							required
							labelId="select-category"
							id="categorySelect"
							value={selectCategory}
							label="Item"
							onChange={handleChangeSelect}
							sx={{ textAlign: 'left', ml: 1, width: '100%' }}
						>
							{partCategory.map((item) => (
								<MenuItem key={item.field} value={item.category}>
									{item.category}
								</MenuItem>
							))}
						</Select>
					</Box>
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
						<Button startIcon={<SearchIcon />} variant="contained" sx={{ m: 1 }} onClick={handleNameSerch}>
							品名検索
						</Button>
					</Box>
					<Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-left', m: 0 }}>
						<TextField
							variant="standard"
							id="serchCodeKey"
							name="serchCodeKey"
							label="品番検索"
							onChange={handleChangeCodeKey}
							value={codeKeyWord}
							sx={{ ml: 1, width: 200 }}
						/>
						<Button startIcon={<SearchIcon />} variant="contained" sx={{ m: 1 }} onClick={handleCodeSerch}>
							品番検索
						</Button>
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
								},
							},
						}}
						pageSizeOptions={[muiDataGridPageSize]}
						onRowClick={handleRowClick}
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
}

export default MasterPatrsList;
