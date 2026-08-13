import React from 'react'
import { Box, Typography, Rating } from '@mui/material'

const RatingDisplay = ({ rate = 0, size = 'medium', label = 'Rating' }) => {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      {/* <Typography variant="body2" color="text.secondary">
        {label}:
      </Typography> */}
      <Rating
        name="read-only-rating"
        value={Number(rate)}
        precision={0.1}
        readOnly
        size={size}
      />
      {/* <Typography variant="body2" color="text.secondary">
        {Number(rate).toFixed(1)}
      </Typography> */}
    </Box>
  )
}

export default RatingDisplay
