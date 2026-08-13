import { useForm } from 'react-hook-form'
import { Box, Grid, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useEffect } from 'react'

import { RHFSwitch, RHFTextField, RHFUpload } from 'app/components/hook-form'
import { useCallback } from 'react'

import { useDataContext } from 'app/contexts/DataContext'
import {
  patchRequest,
  postRequest,
  putRequest,
  UploadFiles,
} from 'app/utils/request'
import { toast } from 'react-toastify'
import { yupResolver } from '@hookform/resolvers/yup'
import { CommonDialouge } from 'app/components/CommonDialogue/CommonDialogue'
import { LengthSchema } from 'app/utils/Schema'

// ----------------------------------------------------------------------

export default function AddLengths({ currentLength, open, onClose, ...other }) {
  const { lengths, setLengths } = useDataContext()
  const defaultValues = useMemo(
    () => ({
      length: 0,
      available: true,
    }),
    [currentLength],
  )

  const methods = useForm({
    mode: 'onTouched',
    resolver: yupResolver(LengthSchema),
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

  const values = watch()
  useEffect(() => {
    if (currentLength) {
      // Reset to currentAdmin values when currentAdmin is present
      reset({
        length: currentLength?.length || 0,
        available: currentLength?.available || true,
      })
    } else {
      // Reset to default values when currentAdmin is null
      reset(defaultValues)
    }
  }, [currentLength, defaultValues, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = currentLength
        ? await putRequest(`/products-lengths/${currentLength?.id}`, data)
        : await postRequest('/products-lengths/', data)
      if (res) {
        setLengths(
          currentLength
            ? lengths?.map((length) =>
                length?.id === currentLength?.id ? { ...length, data } : length,
              )
            : [res?.data, ...lengths],
        )

        reset(defaultValues)
        onClose()
        toast.success(
          currentLength ? 'Updated Successfully!!' : 'Added Successfully!!',
        )
      }
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <CommonDialouge
      title={currentLength ? 'Edit Length' : 'Add Length'}
      open={open}
      onClose={onClose}
      methods={methods}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      reset={reset}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Stack spacing={3}>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField
                name="length"
                label="Enter Length"
                type={'number'}
                maxLength={2}
              />

              <RHFSwitch name="available" label="is Available?" />
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </CommonDialouge>
  )
}
