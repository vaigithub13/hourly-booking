import {
  Box,
  Button,
  Card,
  Grid,
  Icon,
  ListItemText,
  Skeleton,
  Stack,
  styled,
  Typography,
} from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'
import { useState } from 'react'
import { deleteRequest, getRequest } from 'app/utils/request'
import { useEffect } from 'react'
import Label from 'app/components/label'
import { fDate, formatCurrency, fTime, statusColorMap } from 'app/utils/utils'
import { useBoolean } from 'app/hooks/useBoolean'
import { useDataContext } from 'app/contexts/DataContext'
import { toast } from 'react-toastify'
import { ConfirmDialog } from 'app/components/custom-dialog'
import { useCallback } from 'react'
import MyDataTable from 'app/components/DataTable/MyDataTable'
import { useRouter } from 'app/hooks/useRouter'

import useAuth from 'app/hooks/useAuth'
import {
  AttachMoney,
  Payment,
  PendingActions,
  Storefront,
} from '@mui/icons-material'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))
export default function Accounting() {
  const { user } = useAuth()
  const confirm = useBoolean()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0,
  })

  const fetchAccounting = async () => {
    setLoading(true)
    const res = await getRequest(
      `/accounting/accounting-data/${user?.id}`,
      router,
    )
    setData(res?.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchAccounting()
  }, [])

  const columns = [
    {
      field: 'orderId',
      headerName: 'Order Id',
      flex: 0.1,
      minWidth: 80,
      sortable: false,
      filterable: false,
      renderHeader: (params) => (
        <Box
          sx={{
            whiteSpace: 'normal', // Allow text to wrap
            overflowWrap: 'break-word', // Handle long words

            lineHeight: 'normal', // Ensure no extra vertical space
            padding: 0, // Remove default padding
            margin: 0, // Remove default margins
          }}
        >
          {params.colDef.headerName}
        </Box>
      ),
      disableColumnMenu: true,

      renderCell: ({ row }) => (
        <Typography variant="subtitle2">{row?.orderId}</Typography>
      ),
    },
    {
      field: 'revenue',
      headerName: 'Revenue (INR)',
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderHeader: (params) => (
        <Box
          sx={{
            whiteSpace: 'normal', // Allow text to wrap
            overflowWrap: 'break-word', // Handle long words

            lineHeight: 'normal', // Ensure no extra vertical space
            padding: 0, // Remove default padding
            margin: 0, // Remove default margins
          }}
        >
          {params.colDef.headerName}
        </Box>
      ),
      disableColumnMenu: true,

      renderCell: ({ row }) => (
        <Typography variant="subtitle2">
          {formatCurrency(row?.order_revenue)}
        </Typography>
      ),
    },
    {
      field: 'amount',
      headerName: 'Earnings (INR)',
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderHeader: (params) => (
        <Box
          sx={{
            whiteSpace: 'normal', // Allow text to wrap
            overflowWrap: 'break-word', // Handle long words

            lineHeight: 'normal', // Ensure no extra vertical space
            padding: 0, // Remove default padding
            margin: 0, // Remove default margins
          }}
        >
          {params.colDef.headerName}
        </Box>
      ),
      disableColumnMenu: true,

      renderCell: ({ row }) => (
        <Typography variant="subtitle2">
          {formatCurrency(row?.amount)}
        </Typography>
      ),
    },

    {
      field: 'date',
      headerName: 'Date',
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <ListItemText
            primary={fDate(row?.date)}
            secondary={fTime(row?.date)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </Stack>
      ),
    },

    {
      field: 'return',
      headerName: 'Return Request?',
      flex: 0.1,
      minWidth: 80,
      sortable: false,
      filterable: false,
      renderHeader: (params) => (
        <Box
          sx={{
            whiteSpace: 'normal', // Allow text to wrap
            overflowWrap: 'break-word', // Handle long words

            lineHeight: 'normal', // Ensure no extra vertical space
            padding: 0, // Remove default padding
            margin: 0, // Remove default margins
          }}
        >
          {params.colDef.headerName}
        </Box>
      ),
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Label
          variant="soft"
          color={row?.returnedOrderId > 0 ? 'error' : 'success'}
        >
          {row?.returnedOrderId > 0 ? 'True' : 'False'}
        </Label>
      ),
    },

    {
      field: 'status',
      headerName: 'Status',
      flex: 0.1,
      minWidth: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <Label variant="soft" color={`${statusColorMap[row?.status]}`}>
            {row?.status}
          </Label>
        </Stack>
      ),
    },
  ]

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Accounting', path: '/dashboard/vendor/accounting' },
          ]}
        />
      </Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {(loading
          ? Array.from({ length: 4 })
          : [
              {
                label: 'Total Revenue',
                value: formatCurrency(data?.total_revenue) || 0,
                icon: <AttachMoney color="primary" />,
                color: 'primary.main',
              },
              {
                label: 'Total Earnings',
                value: formatCurrency(data?.vendor_share) || 0,
                icon: <Storefront color="success" />,
                color: 'success.main',
              },
              {
                label: 'Received',
                value: formatCurrency(data?.paid) || 0,
                icon: <Payment color="info" />,
                color: 'info.main',
              },
              {
                label: 'Due',
                value: formatCurrency(data?.due) || 0,
                icon: <PendingActions color="error" />,
                color: 'error.main',
              },
            ]
        ).map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: 2,
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <Box
                sx={{
                  mr: 2,
                  p: 1.5,
                  borderRadius: '50%',
                  backgroundColor: item?.color ? `${item.color}20` : 'grey.200',
                  color: item?.color || 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 48,
                  minHeight: 48,
                }}
              >
                {loading ? (
                  <Skeleton variant="circular" width={32} height={32} />
                ) : (
                  item.icon
                )}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                {loading ? (
                  <>
                    <Skeleton width="60%" height={20} />
                    <Skeleton width="80%" height={28} />
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {item.value ?? '-'} INR
                    </Typography>
                  </>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <SimpleCard>
        <MyDataTable
          columns={columns}
          rows={data?.allAccountings}
          rowCount={data?.accountingCount}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </SimpleCard>
    </Container>
  )
}
