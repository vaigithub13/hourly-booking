import React from 'react'
import { Typography, AppBar, Toolbar } from '@mui/material'
import { PrivacyTipRounded } from '@mui/icons-material'
import useAuth from 'app/hooks/useAuth'
const CustomAppBar = () => {
  const { isAuthenticated, user } = useAuth()
  return (
    <AppBar
      position="fixed"
      sx={{
        background:
          'linear-gradient(160deg, rgba(191, 167, 93, 0.8), rgba(34, 34, 34, 0.8))',
        boxShadow: 'none', // optional if you want to remove the default shadow
      }}
    >
      <Toolbar>
        <PrivacyTipRounded
          sx={{ display: { xs: 'flex', md: 'flex' }, mr: 1 }}
        />
        <Typography
          variant="h6"
          noWrap
          component="a"
          href={
            isAuthenticated
              ? `/dashboard/${
                  user?.role === 'admin' ? 'admin' : 'vendor'
                }/statistics`
              : '/session/signin'
          }
          sx={{
            mr: 2,
            display: { xs: 'flex', md: 'flex' },
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          MY APP
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default CustomAppBar
