import {
  Box,
  Chip,
  FormControl,
  Menu,
  Popover,
  Stack,
  styled,
  Typography,
} from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'
import MyAutocomplete from 'app/components/AutoComplete/MyAutocomplete'
import MyAvatar from 'app/components/common-avatar/avatar'
import CommonButton from 'app/components/common-button'
import MyDataTable from 'app/components/DataTable/MyDataTable'
import Label from 'app/components/label'
import ListItem from 'app/components/listitemtext/ListItem'
import SelectBox from 'app/components/select-box/select-box'
import { useDataContext } from 'app/contexts/DataContext'
import { useRouter } from 'app/hooks/useRouter'
import { ordersReducer } from 'app/utils/reducers'
import { getRequest, patchRequest } from 'app/utils/request'
import {
  fDate,
  fDateTime,
  formatCurrency,
  fTime,
  statusColorMap,
} from 'app/utils/utils'
import { useEffect } from 'react'
import { useReducer } from 'react'
import { useState } from 'react'
import { toast } from 'react-toastify'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

export default function Orders() {
  const router = useRouter()
  const { statusCodes } = useDataContext()
  const initialOrdersState = {
    isLoading: false,
    count: 0,
    rows: [],
    status: 0,
    userId: 0,
    vendorId: 0,
  }

  const [orders, dispatch] = useReducer(ordersReducer, initialOrdersState)

  // Function to get the next available status based on ID
  const getNextStatus = (currentStatus) => {
    const currentIndex = statusCodes.findIndex(
      (s) => s.status === currentStatus,
    )
    return currentIndex !== -1 && currentIndex < statusCodes.length - 1
      ? statusCodes[currentIndex + 1]
      : null
  }

  const UpdateOrderStatus = async (id, newStatus) => {
    const res = await patchRequest(`/order/change-order-status/${id}`, {
      newStatus,
    })
    if (res) {
      let updatedOrders = orders?.rows?.map((order) =>
        order?.id === id ? { ...order, status: newStatus } : order,
      )
      setOrders({ ...orders, rows: updatedOrders })
      toast.success('Status Updated Succesfully !!')
    }
  }

  // Separate Component for Status Dropdown
  const StatusDropdown = ({ row }) => {
    const [anchorEl, setAnchorEl] = useState(null)

    const openMenu = (event) => {
      if (row?.status === 'Ready To Ship' || row?.status === 'Delivered') return // Prevent opening for "Delivered"
      event.stopPropagation() // Prevent unwanted interactions
      setAnchorEl(event.currentTarget)
    }

    const closeMenu = () => {
      setAnchorEl(null)
    }

    const nextStatus = getNextStatus(row?.status)

    return (
      <>
        <Label
          variant="soft"
          color={statusColorMap[row?.status]}
          onClick={openMenu} // Opens dropdown on click
          sx={{ cursor: 'pointer' }}
        >
          {row?.status === 'Ready To Ship' ? 'Ready To Pickup' : row?.status}
        </Label>

        <Popover
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={closeMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          disableScrollLock
          sx={{ boxShadow: 'none', background: 'transparent' }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '8px',
            }}
          >
            {statusCodes
              .filter(
                (option) =>
                  option?.status !== 'Cancelled' &&
                  option?.status !== 'Returned' &&
                  option?.status !== 'Out For Delivery' &&
                  option?.status !== 'Delivered',
              )
              .map((status) => {
                const isNextStatus = status.id === nextStatus?.id

                return (
                  <Chip
                    key={status.id}
                    label={
                      status.status === 'Ready To Ship'
                        ? 'Ready To Pickup'
                        : status.status
                    }
                    color={statusColorMap[status.status]}
                    variant={isNextStatus ? 'filled' : 'outlined'}
                    disabled={!isNextStatus}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isNextStatus) {
                        UpdateOrderStatus(row?.id, status.status)
                        closeMenu()
                      }
                    }}
                    sx={{
                      cursor: isNextStatus ? 'pointer' : 'default',
                    }}
                  />
                )
              })}
          </div>
        </Popover>
      </>
    )
  }

  //action creaters
  const setOrders = (orders) =>
    dispatch({ type: 'SET_ORDERS', payload: orders })
  const setLoading = (loading) =>
    dispatch({ type: 'SET_LOADING', payload: loading })
  const setStatus = (status) =>
    dispatch({ type: 'SET_STATUS', payload: status })
  const setCustomer = (customer) =>
    dispatch({ type: 'SET_CUSTOMER', payload: customer })
  const setVendor = (vendor) =>
    dispatch({ type: 'SET_VENDOR', payload: vendor })

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0,
  })

  const fetchOrders = async () => {
    const offset = (paginationModel?.page + 1 - 1) * paginationModel?.pageSize
    let url = `/order/?limit=${paginationModel?.pageSize}&offset=${offset}`
    if (orders?.status !== 0) {
      url += `&status=${orders?.status}`
    }

    if (orders?.userId !== 0) {
      url += `&userId=${orders?.userId}`
    }

    if (orders?.vendorId !== 0) {
      url += `&vendorId=${orders?.vendorId}`
    }
    setLoading(true)
    const res = await getRequest(url, router)
    setLoading(false)
    setOrders(res?.data)
  }

  useEffect(() => {
    fetchOrders()
  }, [
    paginationModel?.page,
    paginationModel?.pageSize,
    orders?.status,
    orders?.userId,
    orders?.vendorId,
  ])

  const columns = [
    {
      field: 'orderId',
      headerName: 'Order Id',
      flex: 0.1,
      minWidth: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Label variant="soft" color={'info'}>
          {`${row?.id}`}
        </Label>
      ),
    },
    {
      field: 'customerName',
      headerName: 'Customer',
      flex: 0.15, // ↓ reduced from 0.2
      minWidth: 200, // ↑ increased from 100
      renderCell: ({ row }) => (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ py: 2, width: '100%', flexWrap: 'wrap' }} // Allow wrapping
        >
          <MyAvatar
            image={row?.user?.profilePicture}
            name={`${row?.user?.firstName} ${row?.user?.lastName}`}
            sx={{ width: 36, height: 36 }}
          />
          <ListItem
            primaryText={`${row?.user?.firstName} ${row?.user?.lastName}`}
            secondaryText={row?.user?.email || ''}
            primaryWidth={'120px'} // ↓ tighten widths
            secondaryWidth={'100px'}
          />
        </Stack>
      ),
    },

    {
      field: 'date',
      headerName: 'Date',
      flex: 0.12, // ↓ tighter
      minWidth: 140, // ↑ wider to prevent overlap
      renderCell: ({ row }) => (
        <Stack
          direction="column"
          spacing={0.5}
          sx={{
            py: 1.5,
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Typography variant="subtitle2" noWrap>
            {fDate(row?.createdAt)}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {fTime(row?.createdAt)}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'return',
      headerName: 'Return Request?',
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
        <Label
          variant="soft"
          color={row?.returnOrderId > 0 ? 'error' : 'success'}
        >
          {row?.returnOrderId > 0 ? 'True' : 'False'}
        </Label>
      ),
    },

    {
      field: 'items',
      headerName: 'Items',
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Label variant="soft" color={'info'}>
          {`${row?.itemsCount}`}
        </Label>
      ),
    },

    {
      field: 'total',
      headerName: 'Total (INR)',
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      filterable: false,

      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Label variant="soft" color={'primary'}>
          {formatCurrency(row?.grossTotal - row?.totalDiscount)}
        </Label>
      ),
    },

    {
      field: 'status',
      headerName: 'Status',
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => <StatusDropdown row={row} />,
    },
    {
      type: 'actions',
      field: 'actions',
      flex: 0.1,
      minWidth: 100,
      headerName: 'Actions',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CommonButton
            title={'View Details'}
            color={'info'}
            onClick={() =>
              router.push(`/dashboard/vendor/orders/${row?.id}/details`)
            }
          />
          {/* <CommonButton
            title={'Track Order'}
            color={'primary'}
            onClick={() => router.push(`/dashboard/orders/${row?.id}/tracking`)}
          /> */}
        </Box>
      ),
    },
  ]
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[{ name: 'Orders', path: '/dashboard/vendor/orders' }]}
        />
      </Box>
      <SimpleCard>
        <FormControl
          style={{ minWidth: 300, marginBottom: 20, marginRight: 20 }}
        >
          <MyAutocomplete
            url={`/users?limit=20&offset=0`}
            label={'Search By Customer'}
            setState={setCustomer}
            placeholder={'Customer Name'}
          />
        </FormControl>
        <FormControl
          style={{ minWidth: 300, marginBottom: 20, marginRight: 20 }}
        >
          <SelectBox
            id="status"
            label="Select Status"
            value={orders?.status}
            setState={setStatus}
            data={statusCodes}
          />
        </FormControl>
        <MyDataTable
          columns={columns}
          rows={orders?.rows}
          loading={orders?.isLoading}
          rowCount={orders?.count}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </SimpleCard>
    </Container>
  )
}
