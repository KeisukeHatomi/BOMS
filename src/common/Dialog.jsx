import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

function CommonDialog(props) {

  // プロパティの受け取り
  const {
    title,
    message,
    onAccept,
    onClose,
    open,
    buttonType
  } = props;
  
  const [dialogOpen, setDialogOpen] = useState(false);

  // 承諾（OK または YES ボタンをクリック）した時
  const handleAccept = () => {
    handleClose();
    onAccept();
  };

  // ダイアログクローズ
  const handleClose = () => {
    setDialogOpen(false);
    onClose();
  };

  // openの値が変化した時
  useEffect(() => setDialogOpen(open), [open]);

  return (
		<Dialog open={dialogOpen}>
			<DialogTitle>
				<span>{title}</span>
			</DialogTitle>
			<DialogContent>
				<Box style={{ whiteSpace: 'pre-wrap' }}>{message}</Box>
			</DialogContent>
			<DialogActions>
				{buttonType == ButtonType.OkOnly && <Button onClick={handleAccept}>OK</Button>}
				{buttonType == ButtonType.YesNo && (
					<>
						<Button onClick={handleAccept}>はい</Button>
						<Button onClick={handleClose}>いいえ</Button>
					</>
				)}
			</DialogActions>
		</Dialog>
  );
}

// ボタン種別
export const ButtonType = {
  OkOnly : "OkOnly",
  YesNo : "YesNo",
}

// プロパティ
CommonDialog.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onAccept: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  buttonType: PropTypes.oneOf([ButtonType.OkOnly, ButtonType.YesNo]).isRequired
};

export default CommonDialog;