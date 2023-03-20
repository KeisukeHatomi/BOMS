import React, { useState, useEffect } from 'react'
import { db } from "../firebase"
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { useAuthContext } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

const Collection = "part";

function MasterPatrsList() {
  const [masterParts, setMasterParts] = useState([]);
  const { user } = useAuthContext();

  useEffect(() => {
    getDocs(collection(db, Collection))
      .then((res) => {
        const data = [];
        res.forEach((e) => {
          data.push({ partCode: e.id, ...e.data() })
        });
        setMasterParts(data);
      });
  }, []);

  if (!user) {
    return <Navigate replace to="/login" />;
  } else {
    return masterParts[0] ? (
      <div>
        {masterParts.map((e) => (
          <div key={e.partCode}>
            <p>{e.partCode}:{e.partName}:{e.revision}</p>
          </div>
        ))}
        <Button variant="contained" sx={{margin:'10px'}} href="/">ホーム</Button>
        
      </div>
    ) : (
      <CircularProgress />
    );
  }
}

export default MasterPatrsList