import { Box, styled } from '@mui/material'

import { Span } from './Typography'
import { MatxLogo } from 'app/components'
import useSettings from 'app/hooks/useSettings'

// STYLED COMPONENTS
const BrandRoot = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 18px 20px 29px',
}))

const StyledSpan = styled(Span)(({ mode }) => ({
  fontFamily: '"Poppins", "Roboto", sans-serif',
  fontWeight: 700,
  letterSpacing: '0.02rem',
  fontSize: 20,
  display: mode === 'compact' ? 'none' : 'block',
  color: '#046DFD',
  marginLeft: 10,
}))

const MotorsText = styled(Span)(({ mode }) => ({
  fontFamily: 'monospace',
  fontWeight: 500,
  fontStyle: 'italic',
  letterSpacing: '.3rem',
  fontSize: 12, // Slightly smaller for Motors
  display: mode === 'compact' ? 'none' : 'block',
  color: 'white',
}))

export default function Brand({ children }) {
  const { settings } = useSettings()
  const leftSidebar = settings.layout1Settings.leftSidebar
  const { mode } = leftSidebar

  return (
    <BrandRoot>
      <Box display="flex" flexDirection="row" alignItems="center">
        <MatxLogo />
        <StyledSpan mode={mode} className="sidenavHoverShow">
          Hourly
        </StyledSpan>
      </Box>

      <Box
        className="sidenavHoverShow"
        sx={{ display: mode === 'compact' ? 'none' : 'block' }}
      >
        {children || null}
      </Box>
    </BrandRoot>
  )
}
