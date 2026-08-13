import { Grid, Skeleton, Card, CardContent, Box, Typography, Stack, Divider } from "@mui/material";

const ProductSkeleton = () => {
  return (
    <Grid container spacing={3}>
      {/* Image Slider Skeleton */}
      <Grid item xs={12} md={6}>
        <Skeleton variant="rectangular" width="100%" height={300} />
      </Grid>

      {/* Product Info Skeleton */}
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            {/* Heading */}
            <Skeleton width="50%" height={30} />

            {/* Product Name */}
            <Skeleton width="80%" height={30} />

            {/* Vendor */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderRadius: 1,
                padding: 2,
                backgroundColor: "background.neutral"
              }}
            >
              {/* Avatar Skeleton */}
              <Skeleton variant="circular" width={56} height={56} />
              <Box>
                <Skeleton width="50%" height={20} />
                <Skeleton width="70%" height={30} />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Stack spacing={1.5}>
                  <Skeleton width="60%" height={20} />
                  <Skeleton width="60%" height={20} />
                  <Skeleton width="60%" height={20} />
                  <Skeleton width="60%" height={20} />
                  <Skeleton width="60%" height={20} />
                  <Skeleton width="60%" height={20} />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Description Skeleton */}
      <Grid item xs={12}>
        <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Skeleton width="30%" height={30} />
            <Stack spacing={2} mt={2}>
              <Skeleton width="100%" height={60} />
              <Skeleton width="100%" height={60} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProductSkeleton;
