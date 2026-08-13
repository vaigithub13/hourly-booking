import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  IconButton,
  Card,
  CardMedia,
  Fade,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/system'

// Custom Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 12,
    padding: theme.spacing(2),
    position: 'relative',
    backgroundColor: theme.palette.background.default,
  },
}))

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '12px',
  marginTop: 3,
  boxShadow: theme.shadows[3],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
}))

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  borderTopLeftRadius: '12px',
  borderTopRightRadius: '12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  margin: 0,
  backgroundColor: 'transparent', // Remove background color
  color: theme.palette.text.primary, // Default text color
}))

const ImagePopup = ({ open, title, onClose, image }) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      TransitionComponent={Fade}
      transitionDuration={{ enter: 500, exit: 300 }}
      maxWidth="md"
      fullWidth
    >
      {/* Dialog Title with close button */}
      <StyledDialogTitle>
        {title ? `${title?.en} / ${title?.ar}` : 'Attachment'}
        <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ padding: '24px' }}>
        <Grid container spacing={3}>
          {/* Left Side - Product Image */}
          <Grid item xs={12} sm={12}>
            <StyledCard>
              <CardMedia
                component="img"
                image={image}
                alt={title ? title?.en : 'Attachment'}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'fill',
                }}
              />
            </StyledCard>
          </Grid>
        </Grid>
      </DialogContent>
    </StyledDialog>
  )
}

export default React.memo(ImagePopup)
