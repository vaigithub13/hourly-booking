import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMemo, useEffect, useCallback, useState } from 'react'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'

import Grid from '@mui/material/Unstable_Grid2'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import LoadingButton from '@mui/lab/LoadingButton'

import { useRouter } from 'app/hooks/useRouter'
import { useResponsive } from 'app/hooks/useResponsive'

import { RHFTextField, RHFUpload } from 'app/components/hook-form'
import FormProvider from 'app/components/hook-form/form-provider'
import { Box, InputAdornment } from '@mui/material'
import { UploadFiles, postRequest, putRequest } from 'app/utils/request'

import { useDataContext } from 'app/contexts/DataContext'
import { toast } from 'react-toastify'
import { SettingsSchema } from 'app/utils/Schema'

// import PostDetailsPreview from './post-details-preview';

// ----------------------------------------------------------------------

export default function DeliveryNewEditForm({ currentSetting }) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const { setConfig } = useDataContext()

  const mdUp = useResponsive('up', 'md')

  const defaultValues = useMemo(
    () => ({
      deliveryPricing: {
        insideDoha: currentSetting?.deliveryPricing?.insideDoha || 0,
        outsideDoha: currentSetting?.deliveryPricing?.outsideDoha || 0,
      },
    }),
    [currentSetting],
  )

  const methods = useForm({
    mode: 'onTouched',
    resolver: yupResolver(SettingsSchema),
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
    if (currentSetting) {
      reset(defaultValues)
    }
  }, [currentSetting, defaultValues, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      // await new Promise((resolve) => setTimeout(resolve, 500));
      const res = await putRequest('/configurations', data)

      if (res) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setConfig({
          ...currentSetting,
          deliveryPricing: {
            insideDoha: data.deliveryPricing.insideDoha,
            outsideDoha: data.deliveryPricing.outsideDoha,
          },
        })
        router.back()
        toast.success('Update Successfully')
      }
    } catch (error) {
      setConfig(currentSetting)
      console.error(error)
    }
  })

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={3}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Site Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Email, Phone, address...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={9}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
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
                name="deliveryPricing.insideDoha"
                label="Delivery Price (Inside Doha)"
                maxLength={8}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <div style={{ paddingRight: 8, fontWeight: 'bold' }}>
                        INR
                      </div>
                    </InputAdornment>
                  ),
                }}
              />

              <RHFTextField
                name="deliveryPricing.outsideDoha"
                label="Delivery Pirce (Outside Doha)"
                maxLength={8}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <div style={{ paddingRight: 8, fontWeight: 'bold' }}>
                        INR
                      </div>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            {/* <Stack spacing={1.5}>
              <RHFTextField
                name="deliveryPrice"
                type="number"
                label="Delivery Price"
                maxLength={4}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <div style={{ paddingRight: 8, fontWeight: 'bold' }}>
                        INR
                      </div>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack> */}
          </Stack>
        </Card>
      </Grid>
    </>
  )

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          sx={{ ml: 2 }}
        >
          {'Save'}
        </LoadingButton>
      </Grid>
    </>
  )

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderActions}
      </Grid>
    </FormProvider>
  )
}

DeliveryNewEditForm.propTypes = {
  currentSetting: PropTypes.object,
}
