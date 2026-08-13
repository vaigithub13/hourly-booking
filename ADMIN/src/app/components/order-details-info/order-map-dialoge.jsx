import React from 'react'
import GoogleMapComponent from '../Map/GoogleMapComponent'
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material'
import { Close } from '@mui/icons-material'

const OrderMapDialoge = ({ open, onClose, values }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <DialogTitle>Shipping Location</DialogTitle>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>
      <DialogContent>
        <GoogleMapComponent values={values} isLocation={true} />
      </DialogContent>
    </Dialog>
  )
}

export default OrderMapDialoge
