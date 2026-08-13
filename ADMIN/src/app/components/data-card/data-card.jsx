import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CardHeader,
  Divider,
} from '@mui/material'

const DataCard = ({ email, phone, homePageText }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        margin: '20px 0',
        background:
          'linear-gradient(135deg,rgb(63, 63, 126),rgb(252, 169, 92))',
        color: '#fff',
      }}
    >
      <CardHeader title="Contact Us Information" />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              <strong>Email:</strong> {email || 'N/A'}
            </Typography>
          </Grid>
          <Divider />
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              <strong>Phone:</strong> +974-{phone || 'N/A'}
            </Typography>
          </Grid>
          <Divider />
          {/* <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Home Page Text:</strong>
            </Typography>
            <Typography variant="body2">
              <strong>In English:</strong> {homePageText?.en || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>In Arabic:</strong> {homePageText?.ar || 'N/A'}
            </Typography>
          </Grid> */}
          <Divider />
          <Divider />
        </Grid>
      </CardContent>
    </Card>
  )
}

export default DataCard
