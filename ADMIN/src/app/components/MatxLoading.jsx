import { Box, Avatar } from '@mui/material'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Loading() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Box
      sx={{
        right: 0,
        width: 1,
        bottom: 0,
        height: 1,
        zIndex: 9998,
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        overflow: 'visible', // Ensures animation is not clipped
      }}
    >
      <motion.div
        animate={{
          y: [0, -20, 0, 20, 0], // Moves up and down symmetrically
        }}
        transition={{
          duration: 1.5,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Avatar
          src={'/assets/images/logos/hourly-logo.png'}
          alt={'Hourly'}
          sx={{
            width: 120,
            height: 120,
            borderRadius: 2,
            objectFit: 'contain',
          }}
        />
      </motion.div>
    </Box>
  )
}
