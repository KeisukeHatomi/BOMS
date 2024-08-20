import React,{useContext, useEffect} from 'react';
import * as fb from '../common/FirestoreUserFunctions';
import { Button } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { PropContext } from '../context/PropContext';
import { useAuthContext } from '../context/AuthContext';

function dbTest() {
	const navigation = useNavigate();
	const { companyId } = useContext(PropContext);
	const { user } = useAuthContext();

	const func = {
		setField: 1,
		getCompanyId: 2,
		getPart: 3,
		getPartClass: 4,
		updatePartClass: 5,
		getLog: 6,
		setLog: 7
	};

	// 実行したい関数を設定
	const execFunc = func.setLog;

	const handleExec = () => {
		const company = 'MUSE';
		const field = 'MECHA';

		switch (execFunc) {
			case func.getCompanyId:
				console.log('🔵getCompanyId');
				fb.getCompanyId(companyId).then((e) => console.log(e));
				break;

			case func.getPart:
				console.log('🔵getPart ');
				const code = 'M0001';
				fb.getPart(companyId, field, code).then((e) => console.log(e));
				break;

			case func.getPartClass:
				console.log('getPartClass🔵 ');
				fb.getPartClass(companyId).then((e) => console.log(e));
				break;

			case func.updatePartClass:
				console.log('updateClass ');
				fb.updateClass(companyId, '金属切削');
				break;

			case func.getLog:
				console.log('getLog ');
				fb.getAllLog(companyId).then((e) => console.log(e));
				break;

			case func.setLog:
				console.log('setLog ');
				fb.setLog(companyId, {
					date: new Date(),
					user: user.displayName,
					action: '新規登録',
				}).then((e) => console.log(e));
				break;

			default:
				break;
		}
	};

	useEffect(()=>{
		// リロードされるとuseContextが消えるので、ホームへ戻す
		if (!companyId) {
			navigation('/');
		}
	},[])

	return (
		<div>
			<p>Firebase Function Test</p>
			<button onClick={handleExec}>実行</button>
			<button
				onClick={() => {
					navigation('/');
				}}
			>
				ホーム
			</button>
		</div>
	);
}

export default dbTest;
