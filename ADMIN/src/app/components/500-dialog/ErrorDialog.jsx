import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material'
import { WarningAmber as WarningIcon } from '@mui/icons-material'

const ErrorDialog = ({ open, onClose, onRetry }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiPaper-root': {
          borderRadius: 3, // Rounded border
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'error.main',
          color: 'white',
          textAlign: 'center',
          borderRadius: '12px 12px 0 0',
        }}
      >
        Server Error
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', p: 4 }}>
        <Box display="flex" justifyContent="center" mb={2}>
          <WarningIcon sx={{ fontSize: 60, color: 'error.main' }} />
        </Box>
        <Typography variant="h6" gutterBottom>
          Oops! Something went wrong.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The server encountered an internal error (500). Please try again
          later.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button variant="contained" color="primary" onClick={onRetry}>
          Retry
        </Button>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ErrorDialog
