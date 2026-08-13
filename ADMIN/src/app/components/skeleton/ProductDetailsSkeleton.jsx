import {
  Box,
  Card,
  Divider,
  Grid,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
  Typography,
} from '@mui/material'

const ProductDetailsSkeleton = () => {
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
              <Skeleton width={50} height={20} />
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <Skeleton variant="rectangular" width="100%" height="100%" />
              </Box>
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

      {/* Other Details Section */}
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

      {/* Attributes section Section */}
      <Grid item xs={12}>
        <Card elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            <Skeleton width={200} />
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <TableCell key={index}>
                        <Skeleton variant="text" width={100} height={24} />
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from({ length: 5 }).map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton
                            variant="rectangular"
                            width={80}
                            height={20}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Card>
      </Grid>

      {/* Images & Delivery Day Section */}
      <Grid item xs={12}>
        <Card elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            <Skeleton width={250} />
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              {[
                ...Array(4).map((_, i) => (
                  <Box
                    key={i}
                    display="flex"
                    flexDirection="row"
                    gap={2}
                    flexWrap="wrap"
                  >
                    <Skeleton variant="rectangular" width={80} height={80} />
                  </Box>
                )),
              ]}
            </Grid>
            <Grid item xs={6}>
              <Skeleton width={100} />
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ProductDetailsSkeleton
