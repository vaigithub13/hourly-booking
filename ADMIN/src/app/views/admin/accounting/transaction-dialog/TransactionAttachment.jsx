import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { Grid, Stack, Typography } from '@mui/material'
import { patchRequest, postRequest, UploadFiles } from 'app/utils/request'
import { toast } from 'react-toastify'
import { useMemo } from 'react'
import { useCallback } from 'react'
import { useEffect } from 'react'
import { CommonDialouge } from 'app/components/CommonDialogue/CommonDialogue'
import { RHFUpload } from 'app/components/hook-form'

// ----------------------------------------------------------------------

export default function TransactionAttachmentDialog({
  current,
  fetch,
  open,
  onClose,
  ...other
}) {
  const AttachmentSchema = Yup.object().shape({
    attachment: Yup.mixed().nullable().required('Attachment is required'),
  })

  const defaultValues = useMemo(
    () => ({
      attachment: current?.attachment || null,
    }),
    [current],
  )

  const methods = useForm({
    mode: 'onTouched',
    resolver: yupResolver(AttachmentSchema),
    defaultValues,
  })

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods

  useEffect(() => {
    if (current) {
      reset(defaultValues)
    } else {
      reset({
        attachment: current?.attachment || '', // Set to today's date or any default value
      })
    }
  }, [current, defaultValues, reset])

  const handleDrop = useCallback(
    (field, acceptedFiles) => {
      const file = acceptedFiles[0]
      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      })

      if (file) {
        setValue(field, newFile, { shouldValidate: true })
      }
    },
    [setValue],
  )

  const handleRemoveFile = useCallback(
    (field) => {
      setValue(field, null)
    },
    [setValue],
  )

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (typeof data.attachment === 'object') {
        const url = await UploadFiles(data.attachment)
        data.attachment = url
      }
      // await new Promise((resolve) => setTimeout(resolve, 500));
      const res = await patchRequest(`/transactions/${current?.id}`, {
        ...data,
        id: current?.id,
      })
      if (res) {
        await fetch()
        onClose()
        reset()
        toast.success('Uploaded Successfully!!')
      }
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <CommonDialouge
      title={'Add Attachment'}
      open={open}
      onClose={onClose}
      methods={methods}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      reset={reset}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Upload Attachment</Typography>
            <RHFUpload
              name="attachment"
              onDrop={(acceptedFiles) =>
                handleDrop('attachment', acceptedFiles)
              }
              onDelete={() => handleRemoveFile('attachment')}
              isPdf={true}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *pdf
                </Typography>
              }
            />
          </Stack>
        </Grid>
      </Grid>
    </CommonDialouge>
  )
}
