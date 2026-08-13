import PropTypes from 'prop-types'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import CardHeader from '@mui/material/CardHeader'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'
import MyAvatar from '../common-avatar'
import {
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { formatCurrency } from 'app/utils/utils'
import { useRouter } from 'app/hooks/useRouter'
import useAuth from 'app/hooks/useAuth'

// ----------------------------------------------------------------------

export default function OrderDetailsItems({
  items,
  title,
  shipping,
  discount,
  subTotal,
  totalAmount,
  isLoading,
}) {
  const { user } = useAuth()
  const StyledTable = styled(Table)(({ theme }) => ({
    whiteSpace: 'pre',
    '& thead': {
      '& tr': {
        '& th': {
          paddingLeft: 10,
          paddingRight: 10,
          background: 'rgba(191, 167, 93, 0.8)',
          color: 'white',
        },
      },
    },
    '& tbody': {
      '& tr': { '& td': { paddingLeft: 10, textTransform: 'capitalize' } },
    },
  }))

  const renderTotal = (
    <Stack
      spacing={2}
      sx={{
        my: 3,
        textAlign: { xs: 'left', md: 'right' },
        alignItems: { xs: 'flex-start', md: 'flex-end' },
        width: '100%',
      }}
    >
      {subTotal > 0 && (
        <Stack direction="row" justifyContent="space-between" width="100%">
          <Box sx={{ color: 'text.secondary' }}>
            {isLoading ? <Skeleton width={80} variant="text" /> : 'SubTotal'}
          </Box>
          <Box sx={{ typography: 'subtitle2' }}>
            {isLoading ? <Skeleton width={80} /> : subTotal || '-'}
          </Box>
        </Stack>
      )}

      {shipping > 0 && (
        <Stack direction="row" justifyContent="space-between" width="100%">
          <Box sx={{ color: 'text.secondary' }}>
            {isLoading ? (
              <Skeleton width={80} variant="text" />
            ) : (
              'Delivery Fee'
            )}
          </Box>
          <Box
            sx={{
              ...(shipping && { color: 'success.main' }),
            }}
          >
            {isLoading ? <Skeleton width={80} /> : `+ ${shipping}`}
          </Box>
        </Stack>
      )}

      {discount > 0 && (
        <Stack direction="row" justifyContent="space-between" width="100%">
          <Box sx={{ color: 'text.secondary' }}>
            {isLoading ? <Skeleton width={80} variant="text" /> : 'Discount'}
          </Box>
          <Box
            sx={{
              ...(discount && { color: 'error.main' }),
            }}
          >
            {isLoading ? <Skeleton width={80} /> : `- ${discount}`}
          </Box>
        </Stack>
      )}

      <Stack
        direction="row"
        justifyContent="space-between"
        width="100%"
        sx={{ typography: 'subtitle1' }}
      >
        <Box>
          {isLoading ? <Skeleton variant="text" width={80} /> : 'Total Amount'}
        </Box>
        <Box>
          {isLoading ? (
            <Skeleton variant="text" width={80} />
          ) : (
            <>
              {formatCurrency(totalAmount)}
              <Typography
                component="sup"
                variant="caption"
                sx={{ ml: 0.5, fontSize: 10 }}
              >
                QAR
              </Typography>
            </>
          )}
        </Box>
      </Stack>
    </Stack>
  )

  const renderAttributes = (attributes) => {
    return (
      <Box
        sx={{
          fontSize: '0.875rem',
          color: 'text.secondary',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          maxWidth: 250, // limit width so it doesn’t bleed into next column
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'normal', // allow wrapping
          wordBreak: 'break-word', // break long words if needed
        }}
      >
        {attributes?.code && (
          <Typography variant="caption" sx={{ mb: 0.5 }}>
            <strong>SKU:</strong> {attributes?.code || 'N/A'}
          </Typography>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 0.5,
            flexWrap: 'nowrap', // force single line
          }}
        >
          <Typography variant="caption">
            <strong>Color:</strong>{' '}
            {typeof attributes?.color?.name === 'object'
              ? attributes?.color?.name?.en
              : attributes?.color?.name || 'N/A'}
          </Typography>

          <Typography variant="caption">
            <strong>Size:</strong>{' '}
            {typeof attributes?.size?.name === 'object'
              ? attributes?.size?.name?.en
              : attributes?.size?.name || 'N/A'}
          </Typography>

          <Typography variant="caption">
            <strong>Length:</strong>{' '}
            {typeof attributes?.length?.name === 'object'
              ? attributes?.length?.name?.en
              : attributes?.length?.name || 'N/A'}
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Card>
      <CardHeader title={title || 'Order Details'} />

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 650,
          overflowX: 'auto',
        }}
      >
        <StyledTable stickyHeader sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell width={'300'}>Item Name</TableCell>
              <TableCell align="center">Ready To Wear?</TableCell>
              <TableCell align="center">Qty</TableCell>
              <TableCell align="right">Price</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading
              ? Array.from(new Array(items?.length || 4)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Skeleton variant="rounded" width={48} height={48} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton width="70%" />
                          <Skeleton width="40%" />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width={40} />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width={20} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={60} />
                    </TableCell>
                  </TableRow>
                ))
              : items?.map((item) => (
                  <TableRow key={item?.vendorId}>
                    {/* Item + Avatar */}
                    <TableCell width={'300'}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <MyAvatar
                          image={
                            item?.sku
                              ? item?.sku?.product?.mainImage
                              : item?.product?.mainImage
                          }
                          name={
                            item?.sku
                              ? item?.sku?.product?.name
                              : user?.role === 'admin' &&
                                typeof item?.product?.name === 'object'
                              ? item?.product?.name?.en
                              : item?.product?.name
                          }
                          onClick={() =>
                            window.open(
                              `/dashboard/admin/products/${
                                item?.sku
                                  ? item?.sku?.product?.id
                                  : item?.product?.id
                              }/details`,
                              '_blank',
                              'noopener,noreferrer',
                            )
                          }
                        />
                        <Box>
                          <Typography variant="body2">
                            {item?.sku
                              ? item?.sku?.product?.name
                              : user?.role === 'admin' &&
                                typeof item?.product?.name === 'object'
                              ? item?.product?.name?.en
                              : item?.product?.name}
                          </Typography>
                          {renderAttributes(item?.sku ? item?.sku : item)}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Ready to Wear */}
                    <TableCell align="center">
                      {item?.sku ? 'Yes' : 'No'}
                    </TableCell>

                    {/* Qty */}
                    <TableCell align="center">x{item?.quantity}</TableCell>

                    {/* Price */}
                    <TableCell align="right">{item?.totalPrice}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </StyledTable>
      </TableContainer>

      {/* Totals section below the table */}
      <Box sx={{ px: 3, py: 2 }}>{renderTotal}</Box>
    </Card>
  )
}

OrderDetailsItems.propTypes = {
  discount: PropTypes.number,
  items: PropTypes.array,
  shipping: PropTypes.number,
  subTotal: PropTypes.number,
  taxes: PropTypes.number,
  totalAmount: PropTypes.number,
  isLoading: PropTypes.bool, // Add this prop type
}
