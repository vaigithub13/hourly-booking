import { useForm } from 'react-hook-form'
import { Box, Grid, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useEffect } from 'react'

import { RHFSwitch, RHFTextField, RHFUpload } from 'app/components/hook-form'
import { useCallback } from 'react'

import { useDataContext } from 'app/contexts/DataContext'
import { patchRequest, postRequest, UploadFiles } from 'app/utils/request'
import { toast } from 'react-toastify'
import { yupResolver } from '@hookform/resolvers/yup'
import { CategorySchema } from 'app/utils/Schema'
import { CommonDialouge } from 'app/components/CommonDialogue/CommonDialogue'
import { useRouter } from 'app/hooks/useRouter'

// ----------------------------------------------------------------------

export default function AddCategories({
  currentCategory,
  open,
  onClose,
  ...other
}) {
  const { categories, setCategories } = useDataContext()
  const router = useRouter()
  const defaultValues = useMemo(
    () => ({
      name: {
        en: '',
        ar: '',
      },

      image: null,
      isRequiredLength: false,
    }),
    [currentCategory],
  )

  const methods = useForm({
    mode: 'onTouched',
    resolver: yupResolver(CategorySchema),
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
    if (currentCategory) {
      // Reset to currentAdmin values when currentAdmin is present
      reset({
        name: {
          en: currentCategory?.name?.en || '',
          ar: currentCategory?.name?.ar || '',
        },
        isRequiredLength: currentCategory?.isRequiredLength || false,
        image:
          typeof currentCategory?.image === 'string' &&
          /\.(jpeg|png|jpg)$/i.test(currentCategory.image)
            ? currentCategory.image
            : null,
      })
    } else {
      // Reset to default values when currentAdmin is null
      reset(defaultValues)
    }
  }, [currentCategory, defaultValues, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      // console.log(data.image)
      if (typeof data?.image === 'object') {
        const url = await UploadFiles(data?.image)
        data.image = url
      }

      const res = currentCategory
        ? await patchRequest(`/categories/${currentCategory?.id}`, data, router)
        : await postRequest('/categories/', data, router)
      if (res) {
        setCategories(
          currentCategory
            ? {
                ...categories,
                rows: categories?.rows?.map((category) =>
                  category.id === currentCategory?.id
                    ? {
                        ...category,
                        ...res?.data,
                      }
                    : category,
                ),
              }
            : {
                ...categories,
                count: categories.count + 1,
                rows: [res?.data, ...categories.rows],
              },
        )
        reset(defaultValues)
        onClose()
        toast.success(
          currentCategory ? 'Updated Successfully!!' : 'Added Successfully!!',
        )
      }
    } catch (error) {
      console.error(error)
    }
  })

  const handleDrop = useCallback(
    (field, acceptedFiles) => {
      const file = acceptedFiles[0]
      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      })

      setValue(field, newFile, { shouldValidate: true })
    },
    [setValue],
  )

  const handleRemoveFile = useCallback(
    (field) => {
      setValue(field, null)
    },
    [setValue],
  )

  return (
    <CommonDialouge
      title={currentCategory ? 'Edit Category' : 'Add Category'}
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
                md: 'repeat(3, 1fr)',
              }}
            >
              <RHFTextField
                name="name.en"
                label="Name in English"
                maxLength={100}
              />

              <div dir="rtl">
                <RHFTextField
                  name="name.ar"
                  label="الاسم باللغة الإنجليزية"
                  maxLength={100}
                />
              </div>

              <RHFSwitch name="isRequiredLength" label="is Length Required ?" />
            </Box>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Category Image</Typography>
              <RHFUpload
                name="image"
                onDrop={(acceptedFiles) => handleDrop('image', acceptedFiles)}
                onDelete={() => handleRemoveFile('image')}
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
                    Allowed *.jpeg, *.jpg, *.png
                  </Typography>
                }
              />
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </CommonDialouge>
  )
}
