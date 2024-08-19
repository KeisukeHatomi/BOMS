import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';

function DlgConfirm(props) {
	// プロパティの受け取り
	const { title, pCode, pName, onAccept, onClose,  open} = props;
	const [dialogOpen, setDialogOpen] = useState(false);

	const handleAccept = () => {
		onAccept();
		onClose();
	};

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text).then(console.log("Copied."));
	};

	// openの値が変化した時
	useEffect(() => setDialogOpen(open), [open]);

	return (
		<Dialog open={dialogOpen}>
			<DialogTitle>
				<span>{title}</span>
			</DialogTitle>
			<DialogContent>
				<Box style={{ whiteSpace: 'pre-wrap' }}>
					{'品番： ' + pCode + "   "}
					<Tooltip title="Copy to Clipboard" placement="top" arrow>
						<IconButton color="primary" size="small" onClick={() => copyToClipboard(pCode)}>
							<ContentCopyIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
				<Box style={{ whiteSpace: 'pre-wrap' }}>
					{'品名： ' + pName + "   "}
					<Tooltip title="Copy to Clipboard" placement="top" arrow>
						<IconButton color="primary" size="small" onClick={() => copyToClipboard(pName)}>
							<ContentCopyIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
			</DialogContent>
			<DialogActions>
					<>
						<Button onClick={handleAccept}>閉じる</Button>
					</>
			</DialogActions>
		</Dialog>
	);
}

// プロパティ
DlgConfirm.propTypes = {
	title: PropTypes.string.isRequired,
	pCode: PropTypes.string.isRequired,
	pName: PropTypes.string.isRequired,
	onAccept: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	open: PropTypes.bool.isRequired,
};

export default DlgConfirm;
