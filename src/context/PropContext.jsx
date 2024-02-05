import React, { createContext, useContext, useState } from 'react';

export const PropContext = createContext();

// Contextを提供するコンポーネント
export function PropProvider({ children }) {
	const [companyId, setCompanyId] = useState('');
	const [currentCategory, setCurrentCategory] = useState('');

	const prop = {
		companyId,
		setCompanyId,
		currentCategory,
		setCurrentCategory,
	};

	return <PropContext.Provider value={prop}>{children}</PropContext.Provider>;
}
