import { Box } from '@mui/material'
import CreateVendor from 'app/components/profile/CreateVendor'
import React from 'react'

const SteppedVendorForm = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(180deg, rgba(191, 167, 93, 0.8), rgba(34, 34, 34, 0.8))',
        padding: { xs: 2, sm: 4 },
      }}
    >
      <CreateVendor />
    </Box>
  )
}

export default SteppedVendorForm
