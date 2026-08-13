import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Card,
  Grid,
  TextField,
  Box,
  Alert,
  Typography,
  styled,
  useTheme,
  IconButton,
  Icon,
  Avatar,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { Formik } from 'formik'
import * as Yup from 'yup'
import useAuth from 'app/hooks/useAuth'
import { toast } from 'react-toastify'
import { useBoolean } from 'app/hooks/useBoolean'

// STYLED COMPONENTS
const FlexBox = styled(Box)(() => ({
  display: 'flex',
}))

const ContentBox = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: '32px',
  position: 'relative',
  background: 'rgba(0, 0, 0, 0.01)',
}))

const StyledRoot = styled('div')(({ background, backgroundColor }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100% !important',
  overflow: 'hidden',
  // backgroundColor: backgroundColor || '#1C3039 !important',
  background: background, // Use dynamic background
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'left 0.5s ease', // Add background-image transition
  transform: `translateX(0)`, // Keep it at the center
  '& .card': {
    maxWidth: 800,
    minHeight: 400,
    margin: '1rem',
    display: 'flex',
    borderRadius: 12,
    alignItems: 'center',
  },
}))

// Initial background images
const backgroundImages = [
  '/assets/images/lambo.png',
  '/assets/images/one_lambo.png',
  '/assets/images/shine_lambo.png',
  '/assets/images/new_lambo.png',
]

// initial login credentials
const initialValues = {
  email: '',
  password: '',
  remember: true,
}

// form field validation schema
const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be 8 character length')
    .required('Password is required!'),
  email: Yup.string()
    .email('Invalid Email address')
    .required('Email is required!'),
})

const fadeAnimation = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const waveAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1, // Delays each character slightly for the wave effect
      type: 'spring',
      stiffness: 100,
      repeat: Infinity, // Infinite loop
      repeatType: 'reverse', // Reverses back to the starting state
    },
  }),
}
export default function JwtLoginCopy() {
  const theme = useTheme()
  const confirm = useBoolean()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const { login } = useAuth()

  const handleFormSubmit = async (values) => {
    setLoading(true)
    try {
      await login(values.email, values.password)
      navigate('/')
      toast.success('Login Successfully')
    } catch (e) {
      setErrorMsg('Something went Wrong!!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <StyledRoot
      background={`linear-gradient(180deg, rgba(191, 167, 93, 0.8), rgba(34, 34, 34, 0.8))`}
      backgroundColor="#1C3039 !important"
    >
      <Card
        className="card"
        sx={{
          background: 'black',
          width: '100%',
          maxWidth: 950,
          mx: 2,
          my: 4,
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 4 },
        }}
      >
        <Grid container>
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  // Black background behind image
                  width: {
                    xs: '30%',
                    sm: '60%',
                    md: '80%',
                  },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1, // optional
                  p: 1, // optional inner padding
                }}
              >
                <Avatar
                  src={'/assets/images/logos/app.png'}
                  alt={'logo'}
                  variant="square"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    backgroundColor: 'transparent', // don't override the box bg
                    borderRadius: 0,
                  }}
                />
              </Box>
            </Box>
          </Grid>
          <Grid sm={6} xs={12}>
            {/* {!!errorMsg && (
              <Box sx={{ px: 4 }}>
                <Alert severity="error" size="small">
                  {errorMsg}
                </Alert>
              </Box>
            )} */}
            <ContentBox sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
              <Formik
                onSubmit={handleFormSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                }) => (
                  <form onSubmit={handleSubmit}>
                    <TextField
                      fullWidth
                      size="small"
                      type="email"
                      name="email"
                      label="Email"
                      variant="outlined"
                      sx={{
                        mb: 3,
                        '& .MuiInputBase-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'white',
                        },
                        '& .MuiInputBase-input': {
                          color: 'white',
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&.Mui-focused': {
                            color: 'white', // ✅ fixes the black label issue
                          },
                        },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'white',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'white',
                          },
                        },
                      }}
                      helperText={touched.email && errors.email}
                      error={Boolean(errors.email && touched.email)}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.email}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      name="password"
                      type={confirm.value ? 'text' : 'password'}
                      label="Password"
                      variant="outlined"
                      sx={{
                        mb: 1.5,
                        '& .MuiInputBase-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'white',
                        },
                        '& .MuiInputBase-input': {
                          color: 'white',
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&.Mui-focused': {
                            color: 'white', // ✅ fixes the black label issue
                          },
                        },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'white',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'white',
                          },
                        },
                      }}
                      InputProps={{
                        endAdornment: values.password && (
                          <IconButton
                            size="small"
                            onClick={() => confirm.onToggle()}
                          >
                            <Icon sx={{ opacity: '0.5', color: 'white' }}>
                              {confirm.value ? 'visibility' : 'visibility_off'}
                            </Icon>
                          </IconButton>
                        ),
                      }}
                      helperText={touched.password && errors.password}
                      error={Boolean(errors.password && touched.password)}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.password}
                    />
                    <Box textAlign="right">
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'white',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          '&:hover': {
                            color: 'white',
                          },
                        }}
                        onClick={() => navigate('/session/forgot-password')}
                      >
                        Forgot Password?
                      </Typography>
                    </Box>

                    <LoadingButton
                      fullWidth
                      type="submit"
                      // color="primary"
                      loading={loading}
                      variant="contained"
                      sx={{
                        my: 2,
                        color: 'white', // text color
                        '& .MuiCircularProgress-root': {
                          color: 'white', // loading spinner color
                        },
                      }}
                    >
                      Login
                    </LoadingButton>
                    <Box
                      sx={{
                        textAlign: 'center',
                        mt: 3, // Slightly larger margin for better spacing
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.primary' }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            bgcolor: 'background.paper',
                            borderRadius: '4px',
                            boxShadow: (theme) =>
                              `0 0 8px ${theme.palette.divider}`,
                          }}
                        >
                          or
                        </Box>
                      </Typography>

                      <Typography
                        variant="subtitle1"
                        sx={{
                          mt: 2,
                          color: 'white',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          fontWeight: 500,
                          transition: 'color 0.3s ease, transform 0.2s ease',
                          '&:hover': {
                            color: 'white',
                            transform: 'scale(1.05)',
                            textDecoration: 'underline',
                          },
                        }}
                        onClick={() => navigate('/session/signup')}
                      >
                        Register as a Designer
                      </Typography>
                    </Box>
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
