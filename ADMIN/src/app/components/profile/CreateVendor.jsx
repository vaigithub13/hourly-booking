import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  IconButton,
  Icon,
  Stack,
} from '@mui/material'
import FormProvider, {
  RHFChecbox,
  RHFTextField,
  RHFUpload,
  RHFUploadAvatarCropped,
} from 'app/components/hook-form'
import { useMemo } from 'react'
import { useCallback } from 'react'
import { VendorSchemas } from 'app/utils/Schema'
import { LoadingButton } from '@mui/lab'
import {
  patchRequest,
  postRequest,
  putRequest,
  UploadFiles,
} from 'app/utils/request'
import GoogleMapComponent from '../Map/GoogleMapComponent'
import VendorInfo from './VendorInfo'
import SuccessDialog from '../success-dialog/success-dialog'
import { useRouter } from 'app/hooks/useRouter'
import { useBoolean } from 'app/hooks/useBoolean'
import { useEffect } from 'react'
import { toast } from 'react-toastify'

const steps = [
  'Personal Details',
  'Business Details',
  'Address Details',
  'Upload CR',
  'Review & Confirm',
]

const CreateVendor = ({ currentVendor, isVendor = false, isAdmin = false }) => {
  const newSchema = VendorSchemas(currentVendor, isAdmin, isVendor)
  const router = useRouter()
  const confirm = useBoolean()
  const bool = useBoolean()
  const dialoge = useBoolean()
  const [activeStep, setActiveStep] = useState(0)
  const currentSchema = newSchema[activeStep]
  const defaultValues = useMemo(
    () => ({
      email: currentVendor?.email || '',
      phoneNumber: currentVendor?.phoneNumber || '',
      vendorName: {
        en: currentVendor?.vendorName?.en || '',
        ar: currentVendor?.vendorName?.ar || '',
      },
      ownerName: {
        en: currentVendor?.ownerName?.en || '',
        ar: currentVendor?.ownerName?.ar || '',
      },
      username: currentVendor?.username || '',
      password: '',
      logo: currentVendor?.logo || '',
      address: {
        unit: currentVendor?.address?.unit || '',
        street: currentVendor?.address?.street || '',
        building: currentVendor?.address?.building || '',
        zone: currentVendor?.address?.zone || '',
        latitude: currentVendor?.address?.latitude || 0,
        longitude: currentVendor?.address?.longitude || 0,
      },
      appPercentage: currentVendor?.appPercentage || 0,
      certificate: currentVendor?.certificate || '',
      isCheck: false,
    }),
    [currentVendor],
  )

  const methods = useForm({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: activeStep <= 3 ? yupResolver(currentSchema) : undefined,
    defaultValues,
  })

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors, isValid },
  } = methods

  const values = watch()

  useEffect(() => {
    if (currentVendor) {
      reset(defaultValues)
    }
  }, [currentVendor, defaultValues, reset])

  useEffect(() => {
    if (values.email !== '') {
      setValue('username', values.email)
    }
  }, [values.email])

  const handleNext = async () => {
    const filled = await methods.trigger()
    if (filled) {
      setActiveStep((prev) => prev + 1)
    }
  }
  const handleBack = () => setActiveStep((prev) => prev - 1)

  const onSubmit = handleSubmit(async (data) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (typeof data.logo === 'object') {
      const url = await UploadFiles(data.logo)
      data.logo = url
    }

    if (typeof data.certificate === 'object') {
      const url = await UploadFiles(data.certificate)
      data.certificate = url
    }

    currentVendor && delete data.password
    !isAdmin && delete data.appPercentage
    delete data.isCheck
    const res =
      currentVendor && isAdmin
        ? await patchRequest(`/admin/update-vendor/${currentVendor?.id}`, data)
        : currentVendor && !isAdmin
        ? putRequest('/vendors/', data)
        : isAdmin
        ? await postRequest('/admin/create-vendor', data)
        : await postRequest('/vendors/signup', data)
    if (res) {
      if (isAdmin) {
        toast.success('Updated Successfully')
        router.back()
      } else if (currentVendor && !isAdmin) {
        toast.success('Updated Successfully')
        router.back()
      } else {
        dialoge.onTrue()
        setTimeout(() => {
          dialoge.onFalse()
          router.push('/session/signin')
        }, 5000)
      }
    }
  })

  const getMaskedPassword = (password) => {
    return password ? '*'.repeat(password.length) : 'N/A'
  }

  const isLastStep = activeStep === steps.length - 1

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

  const PaperSx = () => {
    const baseStyles = {
      width: '100%',
      bgcolor: 'background.paper',
      borderRadius: 4,
      p: { xs: 2, sm: 3, md: 4 }, // responsive padding
      mx: 'auto',
      my: 4,
    }

    return isAdmin || isVendor
      ? baseStyles
      : {
          ...baseStyles,
          maxWidth: 1050,
        }
  }
  return (
    <>
      <Paper elevation={3} sx={PaperSx()}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 600, mb: 2 }}>
          Welcome to My App
        </Typography>
        <Typography
          variant="h6"
          align="center"
          sx={{ fontWeight: 400, mb: 3, color: 'text.secondary' }}
        >
          {isAdmin
            ? 'Please update the details below.'
            : 'We will be pleased to have you onboard.'}
        </Typography>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 4,
            '.MuiStepLabel-label': {
              typography: 'caption',
              textAlign: 'center',
              whiteSpace: 'normal',
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          {activeStep === 0 && (
            <Grid container spacing={3}>
              {/* Left Column: Logo */}
              <Grid item xs={12} md={6}>
                <RHFUploadAvatarCropped
                  name="logo"
                  onDrop={(acceptedFiles) =>
                    methods.setValue('logo', acceptedFiles[0])
                  }
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
                      Allowed *.jpeg, *.jpg, *.png, *.gif
                    </Typography>
                  }
                />
              </Grid>

              {/* Right Column: Fields */}
              <Grid item xs={12} md={6}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <RHFTextField
                      name="vendorName.en"
                      label="Designer Name (English) *"
                      maxLength={20}
                      placeholder="Enter designer name in English"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <div dir="rtl">
                      <RHFTextField
                        name="vendorName.ar"
                        maxLength={20}
                        label=" اسم المصمم/ة (عربي)*"
                        placeholder="أدخل اسم المصمم/ة باللغة العربية"
                      />
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="ownerName.en"
                  label="Brand Name (English) *"
                  maxLength={20}
                  placeholder="Enter Brand name in English"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <div dir="rtl">
                  <RHFTextField
                    name="ownerName.ar"
                    maxLength={20}
                    label="اسم العلامة التجارية (عربي) *"
                    placeholder="أدخل اسم العلامة التجارية باللغة العربية"
                  />
                </div>
              </Grid>
              <Grid item xs={6}>
                <RHFTextField
                  name="email"
                  label="Business Email *"
                  maxLength={75}
                  placeholder="example@domain.com"
                  type="email"
                />
              </Grid>
              <Grid item xs={6}>
                <RHFTextField
                  sx={{ opacity: currentVendor ? '0.5' : '' }}
                  type={confirm.value ? 'text' : 'password'}
                  disabled={currentVendor}
                  name="password"
                  label="Password *"
                  placeholder="********"
                  maxLength={12}
                  InputProps={{
                    endAdornment: values.password && (
                      <IconButton
                        size="small"
                        onClick={() => confirm.onToggle()}
                      >
                        <Icon sx={{ opacity: '0.5' }}>
                          {confirm.value ? 'visibility' : 'visibility_off'}
                        </Icon>
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  disabled
                  name="username"
                  label="Enter Username *"
                  maxLength={20}
                  placeholder="Enter username"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="phoneNumber"
                  label="Business Contact *"
                  placeholder=""
                  maxLength={8}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ paddingRight: 2, fontWeight: 'bold' }}>
                        +974
                      </Box>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <GoogleMapComponent values={values} setValue={setValue} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="address.unit"
                  maxLength={150}
                  label="Unit *"
                  placeholder="Enter unit number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="address.street"
                  maxLength={150}
                  label="Street *"
                  placeholder="Enter street name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="address.building"
                  maxLength={150}
                  label="Building *"
                  placeholder="Enter building name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="address.zone"
                  maxLength={150}
                  label="Zone *"
                  placeholder="Enter zone"
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 3 && (
            <Grid container spacing={3}>
              {isAdmin && (
                <Grid item xs={12}>
                  <RHFTextField
                    name="appPercentage"
                    label="Comission in % *"
                    type={'number'}
                    maxLength={4}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.primary">
                  Note: CR stands for Commercial Registration issued by the
                  Ministry of Commerce and Industry (MOCI)
                </Typography>
                <RHFUpload
                  name="certificate"
                  onDrop={(acceptedFiles) =>
                    handleDrop('certificate', acceptedFiles)
                  }
                  onDelete={() => handleRemoveFile('certificate')}
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
                      Allowed *.jpeg, *.jpg, *.png, *.pdf
                    </Typography>
                  }
                />
              </Grid>
              {!isAdmin && !isVendor && (
                <Grid item sx={12}>
                  <RHFChecbox
                    name="isCheck"
                    label={
                      <Typography
                        sx={{ fontStyle: 'italic', fontWeight: 'bold' }}
                      >
                        I accept the{' '}
                        <Box
                          component="a"
                          href="/terms-and-conditions"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()} // prevent checkbox from toggling
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                          }}
                        >
                          Terms & Conditions
                        </Box>
                      </Typography>
                    }
                  />
                </Grid>
              )}
            </Grid>
          )}

          {activeStep === steps.length - 1 && (
            <VendorInfo
              logo={values.logo}
              vendorName={values.vendorName}
              username={values.username}
              password={values.password}
              getMaskedPassword={getMaskedPassword}
              bool={bool}
              ownerName={values.ownerName}
              email={values.email}
              phoneNumber={values.phoneNumber}
              address={values.address}
              certificate={values.certificate}
              approved={currentVendor?.status === 'Approved'}
              appPercentage={values.appPercentage}
              isAdmin={isAdmin}
            />
          )}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
            mt={4}
          >
            {/* Back Button */}
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="contained"
              fullWidth={true}
              sx={{ width: { sm: 'auto' } }}
            >
              Back
            </Button>

            {/* "Already have an account? Login" - Centered on mobile */}
            {activeStep === 0 && !isAdmin && !isVendor && (
              <Typography
                variant="body2"
                sx={{
                  textAlign: { xs: 'center', sm: 'left' },
                  color: (theme) => theme.palette.primary.main,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'color 0.3s ease, transform 0.2s ease',
                  '&:hover': {
                    color: (theme) => theme.palette.primary.dark,
                    transform: 'scale(1.05)',
                    textDecoration: 'underline',
                  },
                }}
                onClick={() => router.push('/session/signin')}
              >
                Already have an account? Login
              </Typography>
            )}

            {/* Submit or Next Button */}
            {isLastStep ? (
              <LoadingButton
                type="submit"
                variant="contained"
                size="large"
                loading={isSubmitting}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {'Confirm & Submit'}
              </LoadingButton>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Next
              </Button>
            )}
          </Stack>
        </FormProvider>
      </Paper>
      <SuccessDialog open={dialoge.value} onClose={() => dialoge.onFalse()} />
    </>
  )
}

export default CreateVendor
