import React from 'react'
import Slider from 'react-slick'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Stack,
  Divider,
  Avatar,
  Skeleton,
} from '@mui/material'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { formatCurrency } from 'app/utils/utils'
import ProductSkeleton from './product-skeleton'
import useAuth from 'app/hooks/useAuth'
import SizesAndColorsDisplay from 'app/components/product/SizesAndColorsDisplay'

const ProductDetail = ({ product, loading }) => {
  const { user } = useAuth()
  // const settings = {
  //   dots: true,
  //   infinite: true,
  //   speed: 500,
  //   slidesToShow: 1,
  //   slidesToScroll: 1,
  //   autoplay: true, // ✅ Enable Auto Sliding
  //   autoplaySpeed: 1500, // ✅ 1 seconds delay
  //   pauseOnHover: true, // Optional: Stops autoplay when hovering
  // }

  const rawImages = [product?.mainImage, ...(product?.images || [])]
  const images = Array.from(new Set(rawImages.filter(Boolean)))

  const settings = {
    dots: images.length > 1,
    arrows: images.length > 1,
    infinite: images.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, // ✅ Enable Auto Sliding
    autoplaySpeed: 1500, // ✅ 1 seconds delay
    pauseOnHover: true, // Optional: Stops autoplay when hovering
  }
  if (loading) {
    return <ProductSkeleton />
  }
  return (
    <Grid container spacing={3}>
      {/* Image Slider */}
      <Grid item xs={12} md={6}>
        <Box sx={{ width: '100%', maxWidth: 450, mx: 'auto' }}>
          <Slider {...settings}>
            {images.map((img, index) => (
              <Box
                key={index}
                sx={{
                  height: '70vh',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={img}
                  alt={`Product image ${index + 1}`}
                  style={{
                    height: '100%',
                    width: 'auto',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    borderRadius: 8,
                  }}
                />
              </Box>
            ))}
          </Slider>
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card
          sx={{ position: 'relative', p: 3, boxShadow: 3, borderRadius: 2 }}
        >
          {/* Status Label at Top Right */}

          <Chip
            label={product?.approved ? 'Approved' : 'Pending'}
            color={product?.approved ? 'success' : 'warning'}
            sx={{ position: 'absolute', top: 16, right: 16 }}
          />

          <CardContent>
            {/* Car Info Heading */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Product Info
              <Box
                sx={{
                  width: 60,
                  height: 3,
                  backgroundColor: 'primary.main',
                  mt: 0.5,
                }}
              />
            </Typography>

            {/* Product Name */}

            <Typography variant="h5" fontWeight="bold" mb={2}>
              {product?.name?.en} / {product?.name?.ar}
            </Typography>

            {/* User Role + Name */}

            {user?.role === 'admin' && (
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2, // Space between avatar and text
                    borderRadius: 1, // Rounded corners for container
                    padding: 2,
                    backgroundColor: 'background.neutral', // Light background for container
                  }}
                >
                  {/* User Avatar */}
                  <Avatar
                    alt={product?.vendor?.vendorName?.en}
                    src={product?.vendor?.logo}
                    sx={{ width: 56, height: 56 }}
                  />

                  {/* User Info */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Designed by
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {`${product?.vendor?.vendorName?.en}`}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            <Divider sx={{ mb: 1 }} />

            {/* Product Details Grid */}
            <Grid container spacing={3}>
              {/* Left Column */}
              <Grid item xs={12}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1">
                    <strong>Serial:</strong> {product?.serial}
                  </Typography>

                  <Typography variant="subtitle1">
                    <strong>Price:</strong>{' '}
                    {product?.discountedPrice ? (
                      <>
                        <span
                          style={{
                            textDecoration: 'line-through',
                            color: 'gray',
                            marginRight: 8,
                          }}
                        >
                          {formatCurrency(product?.price)} INR
                        </span>
                        <span>
                          {formatCurrency(product?.discountedPrice)} INR
                        </span>
                      </>
                    ) : (
                      <span>{formatCurrency(product?.price)} INR</span>
                    )}
                  </Typography>

                  {/* Categories */}

                  <Typography variant="subtitle1">
                    <strong>Categories:</strong>{' '}
                    {product?.categories
                      ?.map((cat) => cat.name?.en)
                      .join(', ') || 'N/A'}
                  </Typography>

                  {/* Total Orders */}

                  <Typography variant="subtitle1">
                    <strong>Total Orders:</strong> {product?.totalOrders || 0}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Is Ready to wear?: </strong>{' '}
                    {product?.readyToShip ? 'Yes' : 'No (Customized)'}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {product?.readyToShip ? (
        <Grid item xs={12}>
          <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              {/* Metadata Heading */}
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Product Sizes & Colors
                <Box
                  sx={{
                    width: 60,
                    height: 3,
                    backgroundColor: 'primary.main',
                    mt: 0.5,
                  }}
                />
              </Typography>
              {loading ? (
                <Box>
                  <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
                </Box>
              ) : (
                <SizesAndColorsDisplay sizesAndColors={product?.skus || []} />
              )}
            </CardContent>
          </Card>
        </Grid>
      ) : (
        <Grid item xs={12}>
          <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              {/* Metadata Heading */}
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Product Colors
                <Box
                  sx={{
                    width: 60,
                    height: 3,
                    backgroundColor: 'primary.main',
                    mt: 0.5,
                  }}
                />
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 0.5,
                }}
              >
                {product?.supportedCustomAttributes?.map((color) => (
                  <Chip
                    key={color.id}
                    variant={'filled'}
                    label={
                      typeof color.name === 'object'
                        ? `${color.name?.en || ''} (${color.name?.ar || ''})`
                        : color.name
                    }
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      <Grid item xs={12}>
        <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            {/* Metadata Heading */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Product Specifications
              <Box
                sx={{
                  width: 60,
                  height: 3,
                  backgroundColor: 'primary.main',
                  mt: 0.5,
                }}
              />
            </Typography>

            <Stack spacing={1.5} mt={2}>
              {loading ? (
                // Show 4 placeholder skeletons
                Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} variant="text" height={30} />
                ))
              ) : product?.metadata !== null ? (
                Object.entries(product?.metadata || {})?.map(([key, value]) => (
                  <Typography key={key} variant="subtitle1">
                    <strong>
                      {key
                        .replace(/([A-Z])/g, ' $1') // camelCase to words
                        .replace(/^./, (str) => str.toUpperCase())}
                      :
                    </strong>{' '}
                    {typeof value === 'boolean'
                      ? value
                        ? 'Yes'
                        : 'No'
                      : value}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No specifications available.
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Car Description Section */}
      <Grid item xs={12}>
        <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            {/* Description Heading */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Description
              <Box
                sx={{
                  width: 60,
                  height: 3,
                  backgroundColor: 'primary.main',
                  mt: 0.5,
                }}
              />
            </Typography>

            {/* Description Text in Two Languages */}
            <Stack spacing={2} mt={2}>
              <Typography variant="body1">
                {product?.description?.en || 'No Description'}
              </Typography>

              <Typography variant="body1" dir="rtl">
                {product?.description?.ar || 'لا يوجد وصف'}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ProductDetail
