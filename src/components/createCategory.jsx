import React from 'react';
import * as fb from '../common/FirestoreUserFunctions';

const categ = [
	{ headCode: 'M', category: '機加工部品', field: 'PART', lastNumber: 0 },
	{ headCode: 'A', category: '組立品', field: 'ASSY', lastNumber: 0 },
	{ headCode: 'P', category: '購入品', field: 'PURCHASE', lastNumber: 0 },
];

function createCategory() {
    fb.setField('MUSE', )
	return <div>createCategory</div>;
}

export default createCategory;
