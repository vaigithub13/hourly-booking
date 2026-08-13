import PropTypes from 'prop-types'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMemo, useEffect, useCallback } from 'react'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'

import Grid from '@mui/material/Unstable_Grid2'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import LoadingButton from '@mui/lab/LoadingButton'

import { useRouter } from 'app/hooks/useRouter'
import { useResponsive } from 'app/hooks/useResponsive'
import { fData } from 'app/utils/utils'
import {
  RHFAutocomplete,
  RHFSelect,
  RHFTextField,
  RHFUpload,
} from 'app/components/hook-form'
import FormProvider from 'app/components/hook-form/form-provider'
import { Box, MenuItem, Paper } from '@mui/material'
import { UploadFiles, patchRequest, postRequest } from 'app/utils/request'

import { useDataContext } from 'app/contexts/DataContext'
import { toast } from 'react-toastify'
import { BannerSchema } from 'app/utils/Schema'
import { DatePicker } from '@mui/x-date-pickers'

// import PostDetailsPreview from './post-details-preview';

// ----------------------------------------------------------------------

export default function BannersNewEditForm({ currentBanner }) {
  const router = useRouter()
  const { categories, fetchBanners } = useDataContext()

  const mdUp = useResponsive('up', 'md')

  const defaultValues = useMemo(
    () => ({
      title: {
        en: currentBanner?.title?.en,
        ar: currentBanner?.title.ar,
      },
      from: currentBanner?.from || new Date(),
      to: currentBanner?.to || null,
      type: currentBanner?.type || 'Admin',
      image: currentBanner?.image || null,
      vendorId: currentBanner?.vendor || null,
      categoryId: currentBanner?.category?.id || null,
      productId: currentBanner?.product || null,
    }),
    [currentBanner],
  )

  const methods = useForm({
    mode: 'onTouched',
    resolver: yupResolver(BannerSchema),
    defaultValues,
  })

  const {
    reset,
    watch,
    setValue,
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods

  const values = watch()

  useEffect(() => {
    if (currentBanner) {
      reset(defaultValues)
    }
  }, [currentBanner, defaultValues, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      // await new Promise((resolve) => setTimeout(resolve, 500));
      if (typeof data?.image === 'object') {
        const url = await UploadFiles(data?.image)
        data.image = url
      }
      // console.log(data)
      if (data.vendorId !== null) data.vendorId = data.vendorId?.id
      if (data.productId !== null) data.productId = data.productId?.id
      const res = currentBanner
        ? await patchRequest(`/banners/${currentBanner?.id}`, data)
        : await postRequest('/banners/', data)

      if (res) {
        await fetchBanners()
        toast.success(
          currentBanner ? 'Updated Successfully' : 'Added Successfully',
        )
        router.push('/dashboard/admin/banners')
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

  const renderDetails = (
    <>
      <Grid item xs={12}>
        <Box
          columnGap={2}
          rowGap={3}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
          }}
        >
          <RHFTextField name="title.en" label="Title in EN" maxLength={30} />
          <div dir="rtl">
            <RHFTextField
              name="title.ar"
              label="العنوان باللغة العربية"
              maxLength={30}
            />
          </div>
          <Controller
            name="from"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                format="d MMM yyyy"
                fullWidth
                value={field.value}
                label="Valid From"
                minDate={new Date()}
                onChange={(newValue) => {
                  field.onChange(newValue)
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!error,
                    helperText: error?.message,
                  },
                }}
              />
            )}
          />
          <Controller
            name="to"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                format="d MMM yyyy"
                fullWidth
                value={field.value}
                label="Valid To"
                minDate={values.from}
                onChange={(newValue) => {
                  field.onChange(newValue)
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!error,
                    helperText: error?.message,
                  },
                }}
              />
            )}
          />
        </Box>
      </Grid>
    </>
  )

  const renderOptions = (
    <>
      <Grid item xs={12}>
        <Box
          columnGap={2}
          rowGap={3}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
          }}
        >
          <RHFSelect name="type" label="Select Banner Type">
            {['Admin', 'Marketing'].map((value, index) => (
              <MenuItem key={index + 1} value={value}>
                {value}
              </MenuItem>
            ))}
          </RHFSelect>

          <RHFAutocomplete
            disabled={values.categoryId !== null || values.productId !== null}
            name="vendorId"
            label="Search & Select Vendors"
            placeholder="Search Vendors"
            url={'/vendors?limit=20&offset=0&approved=true'}
            filter="search"
            fullWidth
            getOptionLabel={(option) => `${option?.vendorName?.en}`}
            renderOption={(props, option) => (
              <li {...props} key={option?.id}>
                <Typography
                  color={'primary'}
                  variant="subtitle2"
                  sx={{ fontStyle: 'italic' }}
                >{`${option?.vendorName?.en}`}</Typography>
              </li>
            )}
          />
          <RHFSelect
            name="categoryId"
            label="Select Category"
            disabled={values.vendorId !== null || values.productId !== null}
          >
            {categories?.rows?.map((category) => (
              <MenuItem key={category?.id} value={category?.id}>
                {`${category?.name?.en} - ${category?.name?.ar}`}
              </MenuItem>
            ))}
          </RHFSelect>

          <RHFAutocomplete
            disabled={values.vendorId !== null || values.categoryId !== null}
            name="productId"
            label="Search & Select Products"
            placeholder="Search Products"
            url={'/products/for-vendor?limit=10&offset=0&isDiscounted=true'}
            filter="name"
            fullWidth
            getOptionLabel={(option) => `${option?.name?.en}`}
            renderOption={(props, option) => (
              <li {...props} key={option?.id}>
                <Typography
                  color={'primary'}
                  variant="subtitle2"
                  sx={{ fontStyle: 'italic' }}
                >{`${option?.name?.en}`}</Typography>
              </li>
            )}
          />
        </Box>
      </Grid>
    </>
  )

  const renderImage = (
    <Grid item xs={12}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle2">Banner Image</Typography>
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
    </Grid>
  )

  const renderActions = (
    <>
      <Grid xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          sx={{ ml: 2 }}
        >
          {!currentBanner ? 'Save' : 'Save Changes'}
        </LoadingButton>
      </Grid>
    </>
  )

  return (
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderRadius: 4,
        p: 4,
      }}
    >
      <Typography variant="h4" align="center" sx={{ fontWeight: 600, mb: 4 }}>
        {currentBanner ? 'Edit Banner' : 'Add Banner'}
      </Typography>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack spacing={4}>
          {/* Details Section */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Banner Details
            </Typography>
            <Grid container spacing={3}>
              {renderDetails}
            </Grid>
          </Card>

          {/* Options Section */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Associated Options
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              You can select <strong>either</strong> a vendor, category, or
              product.
            </Typography>
            <Grid container spacing={3}>
              {renderOptions}
            </Grid>
          </Card>

          {/* Image Upload Section */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload Image
            </Typography>
            <Grid container spacing={3}>
              {renderImage}
            </Grid>
          </Card>

          {/* Actions Section */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {renderActions}
          </Box>
        </Stack>
      </FormProvider>
    </Paper>
  )
}

BannersNewEditForm.propTypes = {
  currentBanner: PropTypes.object,
}
