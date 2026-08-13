import { Edit, PictureAsPdf } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Card,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import React from 'react'
import VendorDetailsSkeleton from '../skeleton/VendorDetailsSkeleton'
import Label from '../label'
import RatingDisplay from '../Rating/RatingDisplay'

const VendorInfo = ({
  logo,
  vendorName,
  username,
  password,
  bool,
  getMaskedPassword,
  ownerName,
  email,
  phoneNumber,
  address,
  certificate,
  rate,
  appPercentage = 0,
  loading,
  approved,
  isAdmin = false,
  isVendor = false,
  onEdit,
}) => {
  if (loading) {
    return <VendorDetailsSkeleton />
  }

  const isPdf = (file) => {
    if (typeof file === 'object') {
      return file?.type === 'application/pdf'
    } else if (typeof file === 'string') {
      return file?.endsWith('.pdf')
    }
  }
  return (
    <Grid container spacing={3} alignItems="flex-start">
      {/* Personal Details Section */}
      <Grid item xs={12}>
        <Card elevation={3} sx={{ p: 3 }}>
          <Box display={'flex'} justifyContent={'space-between'}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Personal Details
            </Typography>

            <Box display="flex" alignItems="center" gap={2}>
              {isAdmin && (
                <Tooltip title="Profile status" placement="top" arrow>
                  <Label
                    variant="soft"
                    color={approved ? 'success' : 'secondary'}
                  >
                    {approved ? 'Approved' : 'Pending'}
                  </Label>
                </Tooltip>
              )}
              {(isAdmin || isVendor) && (
                <IconButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={onEdit}
                >
                  <Tooltip title="Edit Profile" placement="top" arrow>
                    <Edit />
                  </Tooltip>
                </IconButton>
              )}
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2} alignItems="center">
            {/* User Logo */}
            <Grid item xs={12} sm={3}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar
                  src={logo?.preview || logo || ''}
                  alt="User Logo"
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                {(isAdmin || isVendor) && <RatingDisplay rate={rate} />}
              </Box>
            </Grid>

            {/* Vendor Details */}
            <Grid item xs={12} sm={9} sx={{ textAlign: 'center' }}>
              <Grid container spacing={2}>
                {/* Vendor Name (English and Arabic) */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Designer Name (English):
                  </Typography>
                  <Typography>{vendorName?.en || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    اسم المصمم/ة (عربي)
                  </Typography>
                  <Typography>{vendorName?.ar || 'N/A '}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                {/* Username */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Username:
                  </Typography>
                  <Typography>{username || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  {/* Add space if there's no Arabic username */}
                  <Typography variant="subtitle1" fontWeight="bold">
                    Password:
                  </Typography>
                  <Typography
                    sx={{ cursor: 'pointer' }}
                    onClick={() => password && bool.onToggle()}
                  >
                    {password && bool.value
                      ? password
                      : (password && getMaskedPassword(password)) || '********'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      {/* Business Details Section */}
      <Grid item xs={12}>
        <Card elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Business Details
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            {/* Brand Name */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Brand Name (English):
              </Typography>
              <Typography>{ownerName?.en || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                :اسم العلامة التجارية (عربي)
              </Typography>
              <Typography>{ownerName?.ar || 'N/A'}</Typography>
            </Grid>

            {/* Business Contact */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Business Email:
              </Typography>
              <Typography>{email || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Business Phone:
              </Typography>
              <Typography>+974 {phoneNumber || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      {/* Address Details Section */}
      <Grid item xs={12}>
        <Card elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Address Details
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            {/* Unit */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Unit:
              </Typography>
              <Typography>{address?.unit || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Street:
              </Typography>
              <Typography>{address?.street || 'N/A'}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Building:
              </Typography>
              <Typography>{address?.building || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Zone:
              </Typography>
              <Typography>{address?.zone || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </Card>
      </Grid>
      {/* Certification Section */}
      <Grid item xs={12}>
        <Card elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            {isAdmin ? 'CR & Commission' : 'Commercial Registration'}
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Commercial Registration:
              </Typography>
              {isPdf(certificate) ? (
                <Box display="flex" alignItems="center" mt={1}>
                  <IconButton
                    color="error"
                    href={
                      typeof certificate === 'object'
                        ? URL.createObjectURL(certificate)
                        : certificate
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Tooltip title="View CR" placement="top" arrow>
                      <PictureAsPdf
                        fontSize="large"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                    </Tooltip>
                  </IconButton>
                  <Typography>{certificate?.name}</Typography>
                </Box>
              ) : (
                <IconButton
                  color="error"
                  href={certificate}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Tooltip title="View CR" placement="top" arrow>
                    <Avatar
                      src={certificate?.preview || certificate || ''}
                      alt="Certificate Preview"
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 0,
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </Tooltip>
                </IconButton>
              )}
            </Grid>
            {isAdmin && (
              <Grid item xs={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Commission:
                </Typography>
                <Typography>{appPercentage}%</Typography>
              </Grid>
            )}
          </Grid>
        </Card>
      </Grid>
    </Grid>
  )
}

export default React.memo(VendorInfo)
