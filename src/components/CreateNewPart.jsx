import React, { useState, useEffect } from 'react'
import { db } from "../firebase"
import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";
import { useAuthContext } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import CircularProgress from '@mui/material/CircularProgress';

const Collection = "part";

function CreateNewPart() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);
    const [partCode, setPartCode] = useState('')
    const [partName, setPartName] = useState('')
    const [partRev, setPartRev] = useState('')
    const { user } = useAuthContext();

    const handleSubmit = (e) => {
        e.preventDefault();

        const partProp = {
            partName: partName,
            revision: partRev,
        }

        try {
            getData(partCode).then((data) => {
                if (data === null) {
                    setData(partCode, partProp);
                    setPartCode('')
                    setPartName('')
                    setPartRev('')
                    setError(false)
                    setMessage("登録しました");
                } else {
                    setMessage("同じ部品コードが存在しています");
                    setError(true)
                }
            });
        } catch (e) {
            setMessage(e);
        }
    }

    const getData = async (code) => {
        const docSnap = await getDoc(doc(db, Collection, code));
        let result = null;
        if (docSnap.exists()) {
            result = docSnap.data();
        }
        return result;
    };

    const setData = async (code, prop) => {
        await setDoc(doc(db, Collection, code), prop);
    }

    const onFocus = () => {
        setMessage("");
    }

    const onChangeCode = (e) => {
        const id = e.target.id;
        const val = e.target.value;
        switch (id) {
            case "code":
                setPartCode(val);
                break;
            case "name":
                setPartName(val);
                break;
            case "rev":
                setPartRev(val);
                break;
            default:
        }
    }

    if (!user) {
        return <Navigate replace to="/login" />;
    } else {
        return (
            <div>
                <form onSubmit={handleSubmit}>
                    <Box
                        sx={{ '& > :not(style)': { m: 1, width: '25ch' }, }}
                        noValidate
                        autoComplete="off"
                    >
                        <TextField
                            required
                            error={error}
                            variant="standard"
                            id="code"
                            name="code"
                            label="Code"
                            style={{ width: 200 }}
                            autoComplete='off'
                            onChange={onChangeCode}
                            onFocus={onFocus}
                            value={partCode}
                            helperText={error && message}
                        />
                        <TextField
                            required
                            variant="standard"
                            id="name"
                            name="name"
                            label="Name"
                            style={{ width: 300 }}
                            onChange={onChangeCode}
                            onFocus={onFocus}
                            value={partName}
                        />
                        <TextField
                            required
                            variant="standard"
                            id="rev"
                            name="rev"
                            label="Revision"
                            style={{ width: 100 }}
                            onChange={onChangeCode}
                            onFocus={onFocus}
                            value={partRev}
                        />
                    </Box>
                    {message ? (<p style={{ color: 'red' }}>{message}</p>) : (<p>&nbsp;</p>)}
                    <Button type="submit" variant="contained" >登録</Button>
                </form>
                <Button variant="contained" sx={{ margin: '10px' }} href="/">ホーム</Button>
            </div>
        )
    }
}

export default CreateNewPart