import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';

function CommonDialog(props) {
	// プロパティの受け取り
	const { title, message, onAccept, onClose, open, buttonType } = props;

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

  const copyToClipboard = async () => {
		await navigator.clipboard.writeText(message);
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
				{buttonType == ButtonType.CopyClose && (
					<>
						<Tooltip title="Copy to Clipboard" placement="top" arrow>
							<IconButton color="primary" size="small" onClick={() => copyToClipboard()}>
								<ContentCopyIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<Button onClick={handleAccept}>閉じる</Button>
					</>
				)}
			</DialogActions>
		</Dialog>
	);
}

// ボタン種別
export const ButtonType = {
	OkOnly: 'OkOnly',
	YesNo: 'YesNo',
	CopyClose: 'CopyClose',
};

// プロパティ
CommonDialog.propTypes = {
	title: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
	onAccept: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	open: PropTypes.bool.isRequired,
	buttonType: PropTypes.oneOf([ButtonType.OkOnly, ButtonType.YesNo, ButtonType.CopyClose]).isRequired,
};

export default CommonDialog;
