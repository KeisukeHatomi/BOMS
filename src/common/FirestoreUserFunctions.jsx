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

/**
 * カテゴリーをセットする
 * @param {*} company
 * @param {*} prop
 */
export const setField = async (company, prop) => {
	const companyId = await getCompanyId(company);
	await setDoc(doc(db, COMPANY, companyId), prop, { merge: true });
};

/**
 * 会社IDを取得する
 * @param {*} company
 * @returns
 */
export const getCompanyId = async (company) => {
	const companiesRef = collection(db, COMPANY);
	const q = query(companiesRef, where('companyName', '==', company));
	const querySnapshot = await getDocs(q);
	const documentIds = querySnapshot.docs.map((doc) => doc.id);
	return documentIds[0];
};

/**
 * 品番を指定して情報を取得
 * @param {*} companyId
 * @param {*} field
 * @param {*} code
 * @returns
 */
export const getPart = async (companyId, field, code) => {
	const docSnap = await getDoc(doc(db, COMPANY, companyId, field, code));
	let result = null;
	if (docSnap.exists()) {
		result = docSnap.data();
	}
	return result;
};

/**
 * 指定カテゴリー（field）の全部品情報を取得する
 * @param {*} companyId
 * @param {*} field
 * @returns
 */
export const getAllParts = async (companyId, field) => {
	const docSnap = await getDocs(collection(db, COMPANY, companyId, field));
	return docSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

/**
 * 品番情報を新設する
 * @param {*} companyId
 * @param {*} code
 * @param {*} prop
 */
export const setPart = async (companyId, field, code, prop) => {
	await setDoc(doc(db, COMPANY, companyId, field, code), prop);
};
/**
 * 品番情報を更新する
 * @param {*} companyId
 * @param {*} code
 * @param {*} prop
 */
export const updatePart = async (companyId, field, code, prop) => {
	await setDoc(doc(db, COMPANY, companyId, field, code), prop, { merge: true });
};

/**
 *品番カテゴリーを取得する
 * @param {*} companyId
 * @returns
 */
export const getCategory = async (companyId) => {
	const docSnap = await getDoc(doc(db, COMPANY, companyId));
	let result = null;
	if (docSnap.exists()) {
		result = docSnap.data();
	}
	return result.category;
};

/**
 *品番クラスを取得する
 * @param {*} companyId
 * @returns
 */
export const getPartClass = async (companyId) => {
	const docSnap = await getDoc(doc(db, COMPANY, companyId));
	let result = null;
	if (docSnap.exists()) {
		result = docSnap.data();
	}
	return result.class;
};

/**
 * 品番クラスを更新する
 * @param {*} companyId
 * @param {*} partClass
 */
export const updatePartClass = async (companyId, partClass) => {
	console.log('partClass🔵 ', partClass);
	const docSnap = doc(db, COMPANY, companyId);
	await updateDoc(docSnap, {
		class: arrayUnion(partClass),
	});
};

/**
 * 品番カテゴリーを更新する
 * @param {*} companyId
 * @param {*} prop
 */
export const updateCategory = async (companyId, prop) => {
	await setDoc(doc(db, COMPANY, companyId), prop, { merge: true });
};

/**
 *ログを取得する
 * @param {*} companyId
 * @returns
 */
export const getAllLog = async (companyId) => {
	const docSnap = await getDoc(doc(db, COMPANY, companyId));
	let result = null;
	if (docSnap.exists()) {
		result = docSnap.data();
	}
	return result.accessLog;
};

/**
 * ログを更新する
 * @param {*} companyId
 * @param {*} prop
 */
export const setLog = async (companyId, prop) => {
	await setDoc(doc(db, COMPANY, companyId), {
		accessLog:{
			[prop.date]:{user:prop.user, action:prop.action}
		}
	}, { merge: true });
};

/**
 * Strageに保存したPDF urlを書き込む
 * @param {*} companyId
 * @param {*} field
 * @param {*} code
 * @param {*} url
 */
export const setDrawingUrl = async (companyId, field, code, url) => {
	const prop = {
		drawingUrl: url,
	};
	await setDoc(doc(db, COMPANY, companyId, field, code), prop, { merge: true });
};

/**
 * Strageに保存したSTEP urlを書き込む
 * @param {*} companyId
 * @param {*} field
 * @param {*} code
 * @param {*} url
 */
export const setModelDataUrl = async (companyId, field, code, url) => {
	const prop = {
		modelDataUrl: url,
	};
	await setDoc(doc(db, COMPANY, companyId, field, code), prop, { merge: true });
};
