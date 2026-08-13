import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Box,
} from '@mui/material'
import { CheckCircleOutline as SuccessIcon } from '@mui/icons-material'

const SuccessDialog = ({ open, onClose, title }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          textAlign: 'center',
          backgroundColor: 'success.main',
          color: 'white',
        }}
      >
        <Typography variant="h6">Success</Typography>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', padding: '30px' }}>
        <Box sx={{ fontSize: '50px', color: 'success.main' }}>
          <SuccessIcon fontSize="inherit" />
        </Box>
        <Typography variant="h6" sx={{ marginTop: '15px', fontWeight: 500 }}>
          {title ? title : 'Your request has been submitted!'}
        </Typography>
        {!title && (
          <Typography
            variant="body2"
            sx={{ marginTop: '10px', color: 'text.secondary' }}
          >
            Our administrator will send his revert on your mail.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', padding: '20px' }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SuccessDialog
