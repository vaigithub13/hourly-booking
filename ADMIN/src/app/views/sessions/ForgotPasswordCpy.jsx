import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  Grid,
  TextField,
  Typography,
  Avatar,
  Alert,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { styled } from '@mui/system'
import { toast } from 'react-toastify'

// Styled Components
const StyledRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: `linear-gradient(180deg, rgba(191, 167, 93, 0.8), rgba(34, 34, 34, 0.8))`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}))

const ContentBox = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: '32px',
}))

// Validation Schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid Email address')
    .required('Email is required!'),
})

// Initial Values
const initialValues = {
  email: '',
}

export default function ForgetPasswordCpy() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      // Replace with your actual forget password logic
      await new Promise((res) => setTimeout(res, 1000))

      toast.success('Reset link sent to your email!')
      // Optionally redirect
      // navigate('/session/login')
    } catch (error) {
      setErrorMsg('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <StyledRoot>
      <Card
        sx={{
          background: '#fff',
          width: '100%',
          maxWidth: 950,
          mx: 2,
          my: 4,
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 4 },
          borderRadius: 2,
        }}
      >
        <Grid container>
          {/* Left Logo Side */}
          <Grid
            item
            sm={6}
            xs={12}
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
          >
            <Box
              sx={{
                backgroundColor: 'black',
                width: { xs: '30%', sm: '60%', md: '80%' },
                p: 1,
                borderRadius: 1,
              }}
            >
              <Avatar
                src="/assets/images/logos/app.png"
                variant="square"
                sx={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  backgroundColor: 'transparent',
                  borderRadius: 0,
                }}
              />
            </Box>
          </Grid>

          {/* Right Form Side */}
          <Grid item sm={6} xs={12}>
            <ContentBox>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                }) => (
                  <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <Typography variant="h5" mb={2}>
                      Forgot Password
                    </Typography>

                    {errorMsg && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {errorMsg}
                      </Alert>
                    )}

                    <TextField
                      fullWidth
                      size="small"
                      type="email"
                      name="email"
                      label="Email"
                      variant="outlined"
                      sx={{ mb: 3 }}
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText={touched.email && errors.email}
                      error={Boolean(errors.email && touched.email)}
                    />

                    <LoadingButton
                      fullWidth
                      type="submit"
                      variant="contained"
                      color="primary"
                      loading={loading}
                      sx={{ mb: 2 }}
                    >
                      Send Reset Link
                    </LoadingButton>

                    <Typography
                      variant="body2"
                      sx={{
                        textAlign: 'center',
                        color: 'primary.main',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                      onClick={() => navigate('/session/login')}
                    >
                      Back to Login
                    </Typography>
                  </form>
                )}
              </Formik>
            </ContentBox>
          </Grid>
        </Grid>
      </Card>
    </StyledRoot>
  )
}
