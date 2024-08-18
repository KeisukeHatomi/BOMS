import React from 'react';
import * as fb from '../common/FirestoreUserFunctions';
import { Button } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { PropContext } from '../context/PropContext';

function dbTest() {
	const navigation = useNavigate();
	const { companyId } = useContext(PropContext);

	const func = {
		setField: 1,
		getCompanyId: 2,
		getPart: 3,
		getPartClass: 4,
		updatePartClass: 5,
	};

	// 実行したい関数を設定
	const execFunc = func.getPartClass;

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

			default:
				break;
		}
	};

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
