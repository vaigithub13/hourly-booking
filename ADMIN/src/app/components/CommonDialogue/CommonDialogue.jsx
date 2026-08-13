import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import FormProvider from 'app/components/hook-form/form-provider'
import { LoadingButton } from '@mui/lab'
import PaperComponent from '../Draggable/PaperComponent'
import { IconButton } from '@mui/material'
import { Close } from '@mui/icons-material'

export function CommonDialouge({
  title,
  open,
  onClose,
  reset,
  size,
  methods,
  isSubmitting,
  buttonText = 'Save',
  onSubmit,
  children,
}) {
  return (
    <Dialog
      fullWidth
      maxWidth={size || 'md'}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
      open={open}
      onClose={onClose}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          pb: 2,
          background:
            'linear-gradient(180deg, rgba(191, 167, 93, 0.8), rgba(34, 34, 34, 0.8))',
          color: 'white',
        }}
        id="draggable-dialog-title"
      >
        {title}
        <IconButton sx={{ color: 'white' }} size="small" onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ typography: 'body2' }}>{children}</DialogContent>

        <DialogActions>
          <LoadingButton
            type="submit"
            variant="contained"
            size="large"
            loading={isSubmitting}
            sx={{ ml: 2 }}
          >
            {buttonText}
          </LoadingButton>

          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              onClose()
              reset()
            }}
          >
            Close
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  )
}
