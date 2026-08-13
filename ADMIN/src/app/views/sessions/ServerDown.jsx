import React from 'react'
import { Box, Typography, Button, Container } from '@mui/material'
import CloudOffIcon from '@mui/icons-material/CloudOff'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const MotionCloud = motion(CloudOffIcon)

export default function ServerError500() {
  const navigate = useNavigate()
  return (
    <Container
      maxWidth="sm"
      sx={{
        textAlign: 'center',
        py: 10,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          mb: 4,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'error.light',
          borderRadius: '50%',
          width: 120,
          height: 120,
          mx: 'auto',
        }}
      >
        <MotionCloud
          sx={{ fontSize: 64, color: 'error.dark' }}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </Box>

      <Typography variant="h5" color="text.secondary" paragraph>
        Oops! The server is down.
      </Typography>

      <Typography color="text.secondary" paragraph>
        Something went wrong on our end. Please try again later.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        size="large"
        sx={{ mt: 3 }}
        onClick={() => navigate(-1)}
      >
        Retry
      </Button>
    </Container>
  )
}
