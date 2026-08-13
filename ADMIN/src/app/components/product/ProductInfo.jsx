import { Edit } from '@mui/icons-material'
import {
  Avatar,
  Card,
  Divider,
  Grid,
  Typography,
  Box,
  Chip,
} from '@mui/material'
import { useDataContext } from 'app/contexts/DataContext'
import useAuth from 'app/hooks/useAuth'
import React from 'react'
import ProductDetailsSkeleton from '../skeleton/ProductDetailsSkeleton'
import CommonButton from '../common-button'
import ProductImageSlider from '../slider/ProductSlider'
import SizesAndColorsDisplay from './SizesAndColorsDisplay'

const ProductInfo = ({
  name,
  description,
  price,
  serial,
  categoriesIds,
  discountPrice,
  vendor,
  sizesAndColors,
  mainImage,
  images,
  delivery,
  loading,
  onEdit,
  metaData,
  supportedCustomAttributes,
  readyToShip = false,
  isEdit = false,
}) => {
  const { user } = useAuth()
  const { categories, attributes } = useDataContext()

  const getCategoryName = (id) => {
    let catName = ''
    if (user.role === 'admin') {
      catName = categories?.rows?.find((cat) => cat.id === id)?.name?.en
    } else {
      catName = categories?.rows?.find((cat) => cat.id === id)?.name
    }

    return catName
  }

  if (loading) {
    return <ProductDetailsSkeleton />
  }
  return (
    <Grid container spacing={3} alignItems="flex-start">
      <Grid item xs={12}>
        <Card elevation={3} sx={{ p: 3 }}>
          <Box display={'flex'} justifyContent={'space-between'}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Basic Details
            </Typography>
            {isEdit && (
              <CommonButton
                title={'Edit'}
                variant={'outlined'}
                color={'primary'}
                onClick={onEdit}
              />
            )}
          </Box>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            {/* Product Image */}
            <Grid item xs={12} sm={3}>
              <Avatar
                src={mainImage?.preview || mainImage || vendor?.name?.en}
                alt="Product Image"
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 0,
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  mb: 2,
                  mx: 'auto',
                }}
              />
              <Typography variant="h6" align="center">
                Main Image
              </Typography>
            </Grid>
            {/* Product Details */}
            <Grid item xs={12} sm={9} sx={{ textAlign: 'center' }}>
              <Grid container spacing={2}>
                {/* Product Name (English and Arabic) */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Product Name (English):
                  </Typography>
                  <Typography>{name?.en || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    اسم المنتج (عربي):
                  </Typography>
                  <Typography>{name?.ar || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                {/* Description */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Product Description (English):
                  </Typography>
                  <Typography>{description?.en || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  {/* Add space if there's no Arabic product description */}
                  <Typography variant="subtitle1" fontWeight="bold">
                    وصف المنتج (عربي):
                  </Typography>
                  <Typography>{description?.ar || ''}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      {/* Other Details Section */}
      <Grid item xs={12}>
        <Card elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Other Details
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            {/* Brand Name */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Price:
              </Typography>
              <Typography>{price || 'N/A'}</Typography>
            </Grid>

            {discountPrice > 0 && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Discounted Price:
                </Typography>
                <Typography>{discountPrice || 'N/A'}</Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Serial:
              </Typography>
              <Typography>{serial || 'N/A'}</Typography>
            </Grid>

            {/* Vendor & Category */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Designer:
              </Typography>
              <Typography>{vendor?.vendorName?.en || user?.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Categories:
              </Typography>
              <Box display={'flex'} gap={0.5}>
                {categoriesIds?.map((category) => (
                  <Typography>{category?.name?.en},</Typography>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      {/* Product Specifications  */}

      {metaData && (
        <Grid item xs={12}>
          <Card elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Product Specifications
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              {/* Brand Name */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Fabric:
                </Typography>
                <Typography>{metaData?.fabric || 'N/A'}</Typography>
              </Grid>

              {discountPrice > 0 && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Includes Hijab?:
                  </Typography>
                  <Typography>
                    {metaData?.includesHijab ? 'Yes' : 'No'}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Iron Instructions:
                </Typography>
                <Typography>
                  {metaData?.ironingInstructions || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Washing Instructions:
                </Typography>
                <Typography>
                  {metaData?.washingInstructions || 'N/A'}
                </Typography>
              </Grid>
              {/* Vendor & Category */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Type:
                </Typography>
                <Typography>{metaData?.type || 'N/A'}</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      )}

      {/* Attributes */}
      {readyToShip ? (
        <SizesAndColorsDisplay sizesAndColors={sizesAndColors} />
      ) : (
        <Grid item xs={12}>
          <Card elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Custom Colors
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {attributes?.rows
                ?.filter(
                  (att) =>
                    att?.type === 'color' &&
                    supportedCustomAttributes?.includes(att.id),
                )
                .map((color) => (
                  <Chip
                    variant="filled"
                    key={color.id}
                    label={
                      typeof color.name === 'object'
                        ? `${color.name?.en || ''} (${color.name?.ar || ''})`
                        : color.name
                    }
                  />
                ))}
            </Box>
          </Card>
        </Grid>
      )}

      <Grid item xs={12}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Product Images
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Images:
              </Typography>

              {images?.length > 0 ? (
                <Box display="flex" flexDirection="row" gap={2} flexWrap="wrap">
                  {images.map((image, index) => (
                    <Avatar
                      key={index}
                      src={image?.preview || image || ''}
                      alt="Image Preview"
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 0,
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography>No Images</Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle1" fontWeight="bold">
                Delivery Time:
              </Typography>

              <Typography>{delivery || '0'} Days</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle1" fontWeight="bold">
                Is Ready to Wear?:
              </Typography>

              <Typography>{readyToShip ? 'Yes' : 'No (Customized)'}</Typography>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ProductInfo
