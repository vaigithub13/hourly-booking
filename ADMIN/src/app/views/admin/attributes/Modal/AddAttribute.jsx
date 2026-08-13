import { useForm } from 'react-hook-form'
import { Box, Grid, MenuItem, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useEffect } from 'react'

import { RHFSelect, RHFTextField, RHFUpload } from 'app/components/hook-form'
import { useCallback } from 'react'

import { useDataContext } from 'app/contexts/DataContext'
import { patchRequest, postRequest, UploadFiles } from 'app/utils/request'
import { toast } from 'react-toastify'
import { yupResolver } from '@hookform/resolvers/yup'
import { AttributeSchema } from 'app/utils/Schema'
import { CommonDialouge } from 'app/components/CommonDialogue/CommonDialogue'
import { useRouter } from 'app/hooks/useRouter'

// ----------------------------------------------------------------------

export default function AddAttribute({
  currentAttributes,
  open,
  onClose,
  ...other
}) {
  const { attributes, setAttributes } = useDataContext()
  const router = useRouter()
  const defaultValues = useMemo(
    () => ({
      name: {
        en: '',
        ar: '',
      },
      type: 'size',
    }),
    [currentAttributes],
  )

  const methods = useForm({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: yupResolver(AttributeSchema),
    defaultValues,
  })

  const {
    reset,
    watch,
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods

  const values = watch()

  useEffect(() => {
    if (values.type === 'length') {
      clearErrors('name.en')
      clearErrors('name.ar')
    }
  }, [values.type])

  useEffect(() => {
    if (currentAttributes) {
      // Reset to currentAdmin values when currentAdmin is present
      reset({
        name: {
          en: currentAttributes?.name?.en || '',
          ar: currentAttributes?.name?.ar || '',
        },

        type: currentAttributes?.type,
      })
    } else {
      // Reset to default values when currentAdmin is null
      reset(defaultValues)
    }
  }, [currentAttributes, defaultValues, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = currentAttributes
        ? await patchRequest(
            `/custom_attributes/${currentAttributes?.id}`,
            data,
            router,
          )
        : await postRequest('/custom_attributes/', data, router)
      if (res) {
        setAttributes(
          currentAttributes
            ? {
                ...attributes,
                rows: attributes?.rows?.map((attribute) =>
                  attribute.id === currentAttributes?.id
                    ? {
                        ...attribute,
                        ...res?.data,
                      }
                    : attribute,
                ),
              }
            : {
                ...attributes,
                count: attributes.count + 1,
                rows: [res?.data, ...attributes.rows],
              },
        )
        reset(defaultValues)
        onClose()
        toast.success(
          currentAttributes ? 'Updated Successfully!!' : 'Added Successfully!!',
        )
      }
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <CommonDialouge
      title={currentAttributes ? 'Edit Attribute' : 'Add Attribute'}
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
                md: values?.type === 'length' ? '1fr' : 'repeat(2, 1fr)',
              }}
            >
              <Box gridColumn={values?.type === 'length' ? 'span 2' : 'auto'}>
                <RHFTextField
                  name="name.en"
                  label={
                    values?.type === 'length'
                      ? 'Enter Length'
                      : 'Name in English'
                  }
                  maxLength={values?.type === 'length' ? 2 : 100}
                  fullWidth
                />
              </Box>

              {values?.type !== 'length' && (
                <Box dir="rtl">
                  <RHFTextField
                    name="name.ar"
                    label="الاسم باللغة العربية"
                    maxLength={100}
                    fullWidth
                  />
                </Box>
              )}
            </Box>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Attribute Type</Typography>
              <RHFSelect name="type" label="Select Type">
                {['size', 'color', 'length']?.map((name, index) => (
                  <MenuItem key={index} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </CommonDialouge>
  )
}
