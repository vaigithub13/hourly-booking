import { useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Icon,
} from '@mui/material'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { postRequest } from 'app/utils/request'
import { useNavigate } from 'react-router-dom'
import { LoadingButton } from '@mui/lab'

const otpSchema = Yup.object().shape({
  otp1: Yup.string().required().length(1, 'Required'),
  otp2: Yup.string().required().length(1, 'Required'),
  otp3: Yup.string().required().length(1, 'Required'),
  otp4: Yup.string().required().length(1, 'Required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
})

const maskEmail = (email) => {
  if (!email) return ''
  const [user, domain] = email.split('@')
  if (user.length <= 2) return `**@${domain}`
  return `${user.slice(0, 2)}****@${domain}`
}

export default function OtpDialog({ open, onClose, onVerified, email }) {
  const inputRefs = [useRef(), useRef(), useRef(), useRef()]
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleFormSubmit = async (values) => {
    setLoading(true)
    try {
      const finalOtp = values.otp1 + values.otp2 + values.otp3 + values.otp4
      const res = await postRequest('/admin/confirm-forget-password', {
        emailOrPhoneNumber: email,
        otpCode: finalOtp,
        newPassword: values.password,
      })

      if (res) {
        onClose()
        toast.success('Password has been reset successfully')
        setTimeout(() => {
          navigate('/session/signin')
        }, 1000)
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle textAlign="center">Enter OTP</DialogTitle>

      <Formik
        initialValues={{ otp1: '', otp2: '', otp3: '', otp4: '', password: '' }}
        validationSchema={otpSchema}
        onSubmit={handleFormSubmit}
      >
        {({
          values,
          setFieldValue,
          handleSubmit,
          errors,
          touched,
          handleBlur,
        }) => (
          <>
            <DialogContent>
              <Typography variant="body2" align="center" mb={2}>
                OTP has been sent to <strong>{maskEmail(email)}</strong>
              </Typography>

              <Box display="flex" justifyContent="center" gap={2} mt={1} mb={3}>
                {['otp1', 'otp2', 'otp3', 'otp4'].map((name, idx) => (
                  <TextField
                    key={name}
                    name={name}
                    inputRef={inputRefs[idx]}
                    value={values[name]}
                    onChange={(e) => {
                      const val = e.target.value
                      if (/^\d$/.test(val)) {
                        setFieldValue(name, val)
                        if (idx < 3) inputRefs[idx + 1].current?.focus()
                      } else if (val === '') {
                        setFieldValue(name, '')
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !values[name] && idx > 0) {
                        inputRefs[idx - 1].current?.focus()
                      }
                    }}
                    error={Boolean(touched[name] && errors[name])}
                    inputProps={{
                      maxLength: 1,
                      inputMode: 'numeric',
                      style: {
                        textAlign: 'center',
                        fontSize: '1.5rem',
                      },
                    }}
                    sx={{ width: '3rem' }}
                  />
                ))}
              </Box>
              {/* Password Field */}
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="New Password"
                value={values.password}
                onChange={(e) => setFieldValue('password', e.target.value)}
                onBlur={handleBlur}
                error={Boolean(touched.password && errors.password)}
                helperText={touched.password && errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        <Icon>
                          {showPassword ? 'visibility' : 'visibility_off'}
                        </Icon>
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                onClick={handleSubmit}
                loading={loading}
                sx={{
                  // my: 2,
                  color: 'white', // text color
                  '& .MuiCircularProgress-root': {
                    color: 'white', // loading spinner color
                  },
                }}
              >
                Submit
              </LoadingButton>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  )
}
