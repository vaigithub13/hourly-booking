import { Box, Button, styled } from '@mui/material'
import useAuth from 'app/hooks/useAuth'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// STYLED COMPONENTS
const FlexBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
})

const JustifyBox = styled(FlexBox)({
  maxWidth: 320,
  flexDirection: 'column',
  justifyContent: 'center',
})

const IMG = styled('img')({
  width: '100%',
  marginBottom: '32px',
})

const NotFoundRoot = styled(FlexBox)({
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh !important',
})

export default function NotFound() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated && pathname.startsWith('/dashboard')) {
      navigate('session/signin')
    }
  }, [pathname, isAuthenticated])

  return (
    <NotFoundRoot>
      <JustifyBox>
        <IMG src="/assets/images/illustrations/404.svg" alt="" />

        <Button
          color="primary"
          variant="contained"
          sx={{ textTransform: 'capitalize' }}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </JustifyBox>
    </NotFoundRoot>
  )
}
