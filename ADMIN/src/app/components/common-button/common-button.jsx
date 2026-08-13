import { Button } from '@mui/material'
import React from 'react'

const CommonButton = ({
  onClick,
  title,
  disabled,
  color,
  size,
  variant,
  startIcon,
}) => {
  return (
    <Button
      size={size || 'small'}
      variant={variant || 'contained'}
      sx={{ fontSize: '0.75rem', padding: '4px 8px' }}
      color={color}
      disabled={disabled}
      onClick={onClick}
      startIcon={startIcon}
    >
      {title}
    </Button>
  )
}

export default React.memo(CommonButton)
