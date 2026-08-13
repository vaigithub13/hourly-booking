import PropTypes from 'prop-types'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { useMemo, useEffect, useCallback, useState } from 'react'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'

import Grid from '@mui/material/Unstable_Grid2'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import LoadingButton from '@mui/lab/LoadingButton'

import { useRouter } from 'app/hooks/useRouter'
import { useResponsive } from 'app/hooks/useResponsive'

import FormProvider from 'app/components/hook-form/form-provider'
import { Box, Icon, IconButton } from '@mui/material'
import { postRequest, putRequest } from 'app/utils/request'

import { useDataContext } from 'app/contexts/DataContext'
import { toast } from 'react-toastify'
import RHFEditor from 'app/components/hook-form/rhf-editor'

// import PostDetailsPreview from './post-details-preview';

// ----------------------------------------------------------------------

export default function TermsConditionsForm({ currentSetting }) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const { setConfig } = useDataContext()

  const mdUp = useResponsive('up', 'md')
  const VendorSchema = Yup.object().shape({
    termsAndConditions: Yup.object().shape({
      en: Yup.string()
        .required('Provide input in english')
        .test('not-empty', 'Cannot be empty', (value) => {
          return value !== '<p><br></p>' && value.trim() !== ''
        }),
      ar: Yup.string()
        .required('توفير المدخلات باللغة العربية')
        .test('not-empty', 'لا يمكن أن يكون المحتوى فارغًا', (value) => {
          return value !== '<p><br></p>' && value.trim() !== ''
        }),
    }),
  })

  const defaultValues = useMemo(
    () => ({
      termsAndConditions: {
        en: currentSetting?.termsAndConditions?.en || '',
        ar: currentSetting?.termsAndConditions?.ar || '',
      },
    }),
    [currentSetting],
  )

  const methods = useForm({
    // resolver: yupResolver(VendorSchema),
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
      const res = await putRequest('/configurations', {
        ...currentSetting,
        termsAndConditions: data.termsAndConditions,
      })

      if (res) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setConfig({
          ...currentSetting,
          termsAndConditions: data.termsAndConditions,
        })
        router.push('/dashboard/admin/terms-and-conditions')
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
            Basic Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            T&C in english, arabic...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={9}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">
                Terms & Conditions (English)
              </Typography>
              <RHFEditor simple name="termsAndConditions.en" />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2" dir="ltr">
                الشروط والأحكام (الإنجليزية)
              </Typography>

              <RHFEditor simple name="termsAndConditions.ar" />
            </Stack>
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

TermsConditionsForm.propTypes = {
  currentSetting: PropTypes.object,
}
