import React from 'react'
import { Container, Box, Typography, Skeleton } from '@mui/material'
import { useState } from 'react'
import { getRequest } from 'app/utils/request'
import { useEffect } from 'react'
import CustomAppBar from 'app/components/MyAppBar/AppBar'

export default function TermsAndCondition() {
  const [config, setConfig] = useState(null)

  const fetchConfig = async () => {
    const res = await getRequest('/configurations')
    if (res) {
      setConfig(
        typeof res?.data?.termsAndConditions === 'object'
          ? res?.data?.termsAndConditions?.en
          : res?.data?.termsAndConditions,
      )
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  return (
    <>
      {/* Fixed AppBar */}
      <CustomAppBar />

      {/* Main content */}
      <Container maxWidth="lg" sx={{ py: 6, mt: 2 }}>
        <Box
          sx={{
            p: 2,
            backgroundColor: '#f9f9f9',
            borderRadius: 'none',
            boxShadow: 'none',
            overflow: 'auto',
          }}
        >
          {/* Check if config data is available, show content or skeleton */}
          {config ? (
            <Typography
              variant="body1"
              component="div"
              sx={{ lineHeight: 1.75 }}
              dangerouslySetInnerHTML={{
                __html: config,
              }}
            />
          ) : (
            // Skeleton placeholder for loading
            <>
              <Skeleton variant="text" width="100%" height={40} />
              <Skeleton variant="text" width="100%" height={40} />
              <Skeleton variant="text" width="100%" height={40} />
              <Skeleton variant="rectangular" width="100%" height={200} />
              <Skeleton variant="text" width="100%" height={40} />
              <Skeleton variant="text" width="100%" height={40} />
              <Skeleton variant="text" width="100%" height={40} />
              <Skeleton variant="rectangular" width="100%" height={200} />
            </>
          )}
        </Box>
      </Container>
    </>
  )
}
