import { db } from '../firebase';
import {
	doc,
	setDoc,
	getDoc,
	addDoc,
	deleteDoc,
	getDocs,
	collection,
	updateDoc,
	arrayUnion,
	arrayRemove,
	getAggregateFromServer,
	sum,
	query,
	where,
} from 'firebase/firestore';

const COMPANY = 'COMPANY';

export const setField = async (company, prop) => {
	const companyId = await getComanyId(company);
	console.log('prop🔵 ', prop);
	console.log('companyId🔵 ', companyId);
	await setDoc(doc(db, COMPANY, companyId), prop, { merge: true });
};

/**
 * 会社IDを取得する
 * @param {*} company
 * @returns
 */
export const getComanyId = async (company) => {
	const companiesRef = collection(db, COMPANY);
	const q = query(companiesRef, where('companyName', '==', company));
	const querySnapshot = await getDocs(q);
	const documentIds = querySnapshot.docs.map((doc) => doc.id);
	return documentIds[0];
};

/**
 * 品番を指定して情報を取得
 * @param {*} company
 * @param {*} field
 * @param {*} code
 * @returns
 */
export const getPart = async (company, field, code) => {
	const companyId = await getComanyId(company);
	const docSnap = await getDoc(doc(db, COMPANY, companyId, field, code));
	let result = null;
	if (docSnap.exists()) {
		result = docSnap.data();
	}
	return result;
};

export const getAllParts = async (company, field) => {
	const companyId = await getComanyId(company);
	const docSnap = await getDocs(collection(db, COMPANY, companyId, field));
	return docSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};
/**
 * 品番情報を新設する
 * @param {*} company
 * @param {*} code
 * @param {*} prop
 */
export const setPart = async (company, field, code, prop) => {
	const companyId = await getComanyId(company);
	await setDoc(doc(db, COMPANY, companyId, field, code), prop);
};

/**
 *品番カテゴリーを取得する
 * @param {*} company
 * @returns
 */
export const getCategory = async (company) => {
	const companyId = await getComanyId(company);
	const docSnap = await getDoc(doc(db, COMPANY, companyId));
	let result = null;
	if (docSnap.exists()) {
		result = docSnap.data();
	}
	return result.category;
};

/**
 * 品番カテゴリーを更新する
 * @param {*} company
 * @param {*} prop
 */
export const updateCategory = async (company, prop) => {
	const companyId = await getComanyId(company);
	await setDoc(doc(db, COMPANY, companyId), prop, { merge: true });
};

/**
 * Strageに保存した図面urlを書き込む
 * @param {*} company 
 * @param {*} field 
 * @param {*} code 
 * @param {*} url 
 */
export const setDrawingUrl = async (company, field, code, url) => {
	const companyId = await getComanyId(company);
	const prop = {
		drawingUrl:url,
	};
	await setDoc(doc(db, COMPANY, companyId, field, code), prop, { merge: true });
};


