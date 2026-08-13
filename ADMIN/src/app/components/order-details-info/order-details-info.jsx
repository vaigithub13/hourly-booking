import PropTypes from 'prop-types'

import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import useAuth from 'app/hooks/useAuth'
import MyAvatar from '../common-avatar'
import { IconButton, Tooltip } from '@mui/material'

import { LocationOn } from '@mui/icons-material'
import { useBoolean } from 'app/hooks/useBoolean'
import { useState } from 'react'

// ----------------------------------------------------------------------

const CommonUser = ({ name, image, email, isLoading, contact, title }) => {
  return (
    <>
      <CardHeader title={title} />
      <Stack direction="row" sx={{ p: 3 }}>
        {isLoading ? (
          <Skeleton
            animation="wave"
            variant="circular"
            width={48}
            height={48}
            sx={{ mr: 2 }}
          />
        ) : (
          <Avatar
            alt={name}
            src={image}
            sx={{ width: 48, height: 48, mr: 2 }}
          />
        )}
        <Stack
          spacing={0.5}
          alignItems="flex-start"
          sx={{ typography: 'body2' }}
        >
          {isLoading ? (
            <>
              <Skeleton animation="wave" width={120} />
              <Skeleton animation="wave" width={180} />
              <Skeleton animation="wave" width={100} />
            </>
          ) : (
            <>
              <Typography variant="subtitle2">{name}</Typography>
              <Box sx={{ color: 'text.secondary' }}>{email}</Box>
              <Box>
                Contact:
                <Box
                  component="span"
                  sx={{ color: 'text.secondary', ml: 0.25 }}
                >
                  {contact}
                </Box>
              </Box>
            </>
          )}
        </Stack>
      </Stack>
    </>
  )
}

export default function OrderDetailsInfo({
  status,
  customer,
  vendor,
  delivery,
  reason,
  vendorReason,
  adminResponse,
  images,
  payment,
  isReturn = false,
  shippingAddress,
  trackingId,
  isLoading,
}) {
  const boolean = useBoolean()
  const [values, setValues] = useState(null)
  const renderCustomer = (
    <CommonUser
      name={`${customer?.firstName} ${customer?.lastName}`}
      image={customer?.profilePicture}
      email={customer?.email}
      isLoading={isLoading}
      contact={customer?.phoneNumber}
      title={'Customer Info'}
    />
  )

  const renderVendor = (
    <CommonUser
      name={vendor?.ownerName}
      image={vendor?.logo}
      email={vendor?.email}
      isLoading={isLoading}
      contact={vendor?.phoneNumber}
      title={'Designer Info'}
    />
  )

  const { user } = useAuth()

  const renderShipping = (
    <>
      <CardHeader title={isReturn ? 'Pickup Address' : 'Shipping Address'} />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        {isLoading ? (
          <>
            <Skeleton animation="wave" width={200} height={20} />
            <Skeleton animation="wave" width={160} height={20} />
          </>
        ) : (
          <>
            <Stack direction="row" alignItems="flex-start" spacing={1}>
              <Box
                component="span"
                sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
              >
                Address
              </Box>

              <Box>
                <Typography variant="body2">
                  {[
                    shippingAddress?.zone && `Zone ${shippingAddress.zone}`,
                    shippingAddress?.street &&
                      `Street ${shippingAddress.street}`,
                    shippingAddress?.buildingInfo &&
                      `Building ${shippingAddress.buildingInfo}`,
                    shippingAddress?.unit && `Unit ${shippingAddress.unit}`,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" alignItems="flex-start" spacing={1}>
              <Box
                component="span"
                sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
              >
                Description
              </Box>
              <Box>{shippingAddress?.description}</Box>
            </Stack>
            <Stack direction="row" alignItems="flex-start" spacing={1}>
              <Box
                component="span"
                sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
              >
                Location
              </Box>

              <IconButton
                component="a"
                href={`https://www.google.com/maps?q=${shippingAddress?.lat},${shippingAddress?.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Tooltip title="View Map" placement="top" arrow>
                  <LocationOn />
                </Tooltip>
              </IconButton>
            </Stack>

            {delivery && (
              <Stack direction="row">
                <Box
                  component="span"
                  sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                >
                  Delivery Id
                </Box>
                {delivery}
              </Stack>
            )}
            <Stack direction="row">
              <Box
                component="span"
                sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
              >
                Phone number
              </Box>
              {customer?.phoneNumber || '365-374-4961'}
            </Stack>
            {trackingId && (
              <Stack direction="row">
                <Box
                  component="span"
                  sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                >
                  Tracking Id
                </Box>
                {trackingId}
              </Stack>
            )}
          </>
        )}
      </Stack>
    </>
  )

  const renderReturn = (
    <>
      <Card>
        <CardHeader title="Customer's Response" />
        <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
          {isLoading ? (
            <>
              <Skeleton animation="wave" width={200} height={20} />
              <Skeleton animation="wave" width={160} height={20} />
              <Stack direction="row" spacing={1}>
                {[...Array(3)].map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rounded"
                    width={48}
                    height={48}
                  />
                ))}
              </Stack>
            </>
          ) : (
            <>
              <Stack direction="row">
                <Box
                  component="span"
                  sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                >
                  Response:
                </Box>
                {reason || 'No reason provided'}
              </Stack>

              {images?.length > 0 && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    component="span"
                    sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                  >
                    Images:
                  </Box>
                  {images?.map((img, index) => (
                    <IconButton
                      key={index}
                      color="error"
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Tooltip title="View Image" placement="top" arrow>
                        <MyAvatar image={img} name={`Image ${index + 1}`} />
                      </Tooltip>
                    </IconButton>
                  ))}
                </Stack>
              )}
            </>
          )}
        </Stack>
      </Card>
    </>
  )

  const renderVendorReason = (
    <>
      <Card>
        <CardHeader title="Designer's Response" />
        <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
          {isLoading ? (
            <>
              <Skeleton animation="wave" width={200} height={20} />
              <Skeleton animation="wave" width={160} height={20} />
            </>
          ) : (
            <>
              <Stack direction="row">
                <Box
                  component="span"
                  sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                >
                  Response:
                </Box>
                {vendorReason || 'No remarks'}
              </Stack>
            </>
          )}
        </Stack>
      </Card>
    </>
  )

  const renderAdminResponse = (
    <>
      <Card>
        <CardHeader title="Admin's Response" />
        <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
          {isLoading ? (
            <>
              <Skeleton animation="wave" width={200} height={20} />
              <Skeleton animation="wave" width={160} height={20} />
            </>
          ) : (
            <>
              <Stack direction="row">
                <Box
                  component="span"
                  sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
                >
                  Response:
                </Box>
                {adminResponse
                  ? 'Delivery fee will be paid by designer.'
                  : 'Delivery fee will be paid by customer.'}
              </Stack>
            </>
          )}
        </Stack>
      </Card>
    </>
  )

  const renderPayment = (
    <>
      <CardHeader title="Payment" />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        {isLoading ? (
          <>
            <Skeleton animation="wave" width={200} height={20} />
          </>
        ) : (
          <>
            <Stack direction="row">
              <Box
                component="span"
                sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}
              >
                Payment Method:
              </Box>
              {payment?.method || 'None'}
            </Stack>
          </>
        )}
      </Stack>
    </>
  )

  return (
    <Card>
      {renderCustomer}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {user?.role === 'admin' && renderVendor}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {isReturn && renderReturn}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {isReturn && vendorReason && renderVendorReason}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {isReturn &&
        status !== 'PendingAdmin' &&
        status !== 'Pending' &&
        renderAdminResponse}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderShipping}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderPayment}
      {/* 
      <OrderMapDialoge
        open={boolean.value}
        onClose={() => boolean.onFalse()}
        values={values}
      /> */}
    </Card>
  )
}

OrderDetailsInfo.propTypes = {
  customer: PropTypes.object,
  delivery: PropTypes.object,
  payment: PropTypes.object,
  shippingAddress: PropTypes.object,
  trackingId: PropTypes.string,
  isLoading: PropTypes.bool, // Add this prop type
}
