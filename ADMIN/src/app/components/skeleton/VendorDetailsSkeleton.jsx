import { Box, Card, Divider, Grid, Skeleton, Typography } from '@mui/material'

const VendorDetailsSkeleton = () => {
  return (
    <Grid container spacing={3} alignItems="flex-start">
      {/* Personal Details Section */}
      <Grid item xs={12}>
        <Card elevation={3} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h5" gutterBottom fontWeight="bold">
              <Skeleton width={200} />
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Skeleton width={50} />
              <Skeleton variant="circular" width={30} height={30} />
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Skeleton
                variant="circular"
                width={120}
                height={120}
                sx={{ mb: 2, mx: 'auto' }}
              />
              <Skeleton width={100} height={30} sx={{ mx: 'auto' }} />
            </Grid>
            <Grid item xs={12} sm={9} sx={{ textAlign: 'center' }}>
              <Grid container spacing={2}>
                {[...Array(2)].map((_, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Skeleton width={180} />
                    <Skeleton width={100} />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                {[...Array(2)].map((_, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Skeleton width={180} />
                    <Skeleton width={100} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      {/* Business Details Section */}
      <Grid item xs={12}>
        <Card elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            <Skeleton width={200} />
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            {[...Array(4)].map((_, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Skeleton width={180} />
                <Skeleton width={100} />
              </Grid>
            ))}
          </Grid>
        </Card>
      </Grid>

      {/* Address Details Section */}
      <Grid item xs={12}>
        <Card elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            <Skeleton width={200} />
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            {[...Array(4)].map((_, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Skeleton width={180} />
                <Skeleton width={100} />
              </Grid>
            ))}
          </Grid>
        </Card>
      </Grid>

      {/* Certification Section */}
      <Grid item xs={12}>
        <Card elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            <Skeleton width={250} />
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Skeleton width={180} />
              <Skeleton
                variant="rectangular"
                width={80}
                height={80}
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={6}>
              <Skeleton width={180} />
              <Skeleton width={100} />
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  )
}

export default VendorDetailsSkeleton
