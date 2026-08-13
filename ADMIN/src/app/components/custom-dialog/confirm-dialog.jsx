import PropTypes from 'prop-types'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import { Alert } from '@mui/material'
import CommonButton from '../common-button/common-button'

// ----------------------------------------------------------------------

export default function ConfirmDialog({
  title,
  content,
  action,
  show,
  open,
  onClose,
  ...other
}) {
  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ pb: 2 }}>
        {title}{' '}
        {!show && (
          <Alert severity="error">Action performed cannot be reverted.</Alert>
        )}
      </DialogTitle>

      {content && (
        <DialogContent sx={{ typography: 'body2' }}>{content} </DialogContent>
      )}

      <DialogActions>
        {action}

        <CommonButton
          title={'Cancel'}
          variant="outlined"
          color="inherit"
          onClick={onClose}
        />
      </DialogActions>
    </Dialog>
  )
}

ConfirmDialog.propTypes = {
  action: PropTypes.node,
  content: PropTypes.node,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  title: PropTypes.string,
}
