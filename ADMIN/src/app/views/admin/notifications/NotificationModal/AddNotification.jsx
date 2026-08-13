import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Grid } from '@mui/material'
import { postRequest } from 'app/utils/request'
import { toast } from 'react-toastify'
import { useMemo } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useRouter } from 'app/hooks/useRouter'
// import { AdminSchema } from 'app/utils/schema'

import { RHFTextField } from 'app/components/hook-form'
import { useCallback } from 'react'
import { CommonDialouge } from 'app/components/CommonDialogue/CommonDialogue'
import { useDataContext } from 'app/contexts/DataContext'
import { NotificationSchema } from 'app/utils/Schema'

// ----------------------------------------------------------------------

export default function AddNotification({
  currentNotification,
  open,
  onClose,
  ...other
}) {
  const router = useRouter()
  const { notifications, setNotifications } = useDataContext()
  const defaultValues = useMemo(
    () => ({
      title: {
        en: '',
        ar: '',
      },
      content: {
        en: '',
        ar: '',
      },
    }),
    [currentNotification],
  )

  const methods = useForm({
    mode: 'onTouched',
    resolver: yupResolver(NotificationSchema),
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
    if (currentNotification) {
      // Reset to currentAdmin values when currentAdmin is present
      reset({
        title: {
          en: currentNotification?.title?.en || '',
          ar: currentNotification?.title?.ar || '',
        },
        content: {
          en: currentNotification?.content?.en || '',
          ar: currentNotification?.content?.ar || '',
        },
      })
    } else {
      // Reset to default values when currentAdmin is null
      reset(defaultValues)
    }
  }, [currentNotification, defaultValues, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await postRequest(
        '/notifications/create-public-notifications',
        data,
        router,
      )

      if (res) {
        setNotifications({
          ...notifications,
          count: notifications?.count + 1,
          rows: [res?.data, ...notifications?.rows],
        })
        onClose()
        toast.success('Added Successfully!!')
      }
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <CommonDialouge
      title={'Add Notification'}
      open={open}
      onClose={onClose}
      methods={methods}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      reset={reset}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
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
              name="title.en"
              label="Title in English"
              maxLength={100}
            />

            <div dir="rtl">
              <RHFTextField
                name="title.ar"
                label="العنوان باللغة العربية"
                maxLength={100}
              />
            </div>

            <RHFTextField
              name="content.en"
              label="Content in English"
              multiline
              rows={4}
              maxLength={500}
            />

            <div dir="rtl">
              <RHFTextField
                name="content.ar"
                label="المحتوى باللغة العربية"
                multiline
                rows={4}
                maxLength={500}
              />
            </div>
          </Box>
        </Grid>
      </Grid>
    </CommonDialouge>
  )
}
