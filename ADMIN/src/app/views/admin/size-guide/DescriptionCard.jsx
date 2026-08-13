import React from 'react'
import { Card, CardContent, Typography, Divider, Box } from '@mui/material'

const DescriptionCard = ({ description }) => {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Description
        </Typography>

        {/* English Description */}
        <Box mb={2}>
          <Typography variant="body1">
            {description?.en || 'No description available.'}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Arabic Description */}
        <Box dir="rtl">
          <Typography variant="body1" align="right">
            {description?.ar || 'لا يوجد وصف.'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default DescriptionCard
