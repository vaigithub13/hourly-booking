import { Box, FormControl, Stack, styled, Typography } from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'
import MyAutocomplete from 'app/components/AutoComplete/MyAutocomplete'
import MyAvatar from 'app/components/common-avatar/avatar'
import CommonButton from 'app/components/common-button'
import MyDataTable from 'app/components/DataTable/MyDataTable'
import Label from 'app/components/label'
import ListItem from 'app/components/listitemtext/ListItem'
import SelectBox from 'app/components/select-box/select-box'
import { useDataContext } from 'app/contexts/DataContext'
import { useBoolean } from 'app/hooks/useBoolean'
import { useRouter } from 'app/hooks/useRouter'
import { ordersReducer, requestReducer } from 'app/utils/reducers'
import { getRequest } from 'app/utils/request'
import {
  fDate,
  fDateTime,
  formatCurrency,
  fTime,
  RequestStatusMap,
  statusColorMap,
} from 'app/utils/utils'
import { useEffect } from 'react'
import { useReducer } from 'react'
import { useState } from 'react'
import IssueRefundModel from './RefundModel/IssueRefundModel'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

export default function Requests() {
  const router = useRouter()
  const bool = useBoolean()
  const [data, setData] = useState(0)
  const [cancelId, setCancelId] = useState(0)
  const intialRequestState = {
    isLoading: false,
    count: 0,
    rows: [],
    status: 0,
    userId: 0,
    vendorId: 0,
  }

  const [requests, dispatch] = useReducer(requestReducer, intialRequestState)

  //action creaters
  const setRequests = (requests) =>
    dispatch({ type: 'SET_REQUESTS', payload: requests })
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

  const handleRequestUpdate = (target) => {
    console.log(target)
    const updatedRequests = requests?.rows?.map((request) =>
      request?.id === cancelId ? { ...request, refundTarget: target } : request,
    )
    setRequests({ ...requests, rows: updatedRequests })
  }

  const fetchRequests = async () => {
    const offset = (paginationModel?.page + 1 - 1) * paginationModel?.pageSize
    let url = `/order/cancel-orders-requests?limit=${paginationModel?.pageSize}&offset=${offset}`

    if (requests?.userId !== 0) {
      url += `&userId=${requests?.userId}`
    }

    if (requests?.vendorId !== 0) {
      url += `&vendorId=${requests?.vendorId}`
    }
    setLoading(true)
    const res = await getRequest(url, router)
    setLoading(false)
    setRequests(res?.data)
  }

  useEffect(() => {
    fetchRequests()
  }, [
    paginationModel?.page,
    paginationModel?.pageSize,
    requests?.userId,
    requests?.vendorId,
  ])

  const handleOpenRefundModel = (data, id) => {
    setData(data)
    setCancelId(id)
    bool.onTrue()
  }
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
          {`${row?.order?.id}`}
        </Label>
      ),
    },
    {
      field: 'customerName',
      headerName: 'Customer',
      flex: 0.2,
      minWidth: 200,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack
          direction="row"
          alignItems="center"
          sx={{ py: 2, width: '100%' }}
        >
          <MyAvatar
            image={row?.user?.profilePicture}
            name={`${row?.user?.firstName} ${row?.user?.lastName}`}
          />
          <ListItem
            primaryText={`${row?.user?.firstName} ${row?.user?.lastName}`}
            secondaryText={row?.user?.email || ''}
            primaryWidth={'120px'}
            secondaryWidth={'100px'}
          />
        </Stack>
      ),
    },

    {
      field: 'vendorName',
      headerName: 'Designer',
      flex: 0.2,
      minWidth: 180,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <MyAvatar image={row?.vendor?.logo} name={row?.vendor?.vendorName} />

          <ListItem
            primaryText={`${row?.vendor?.vendorName}`}
            secondaryText={row?.vendor?.ownerName}
            primaryWidth={'120px'}
            secondaryWidth={'100px'}
          />
        </Stack>
      ),
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 0.1,
      minWidth: 150,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: ({ row }) => (
        <ListItem
          primaryText={fDate(row?.order?.createdAt)}
          secondaryText={fTime(row?.order?.createdAt)}
          primaryProps={{ typography: 'subtitle2', noWrap: true }}
          secondaryProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      ),
    },

    {
      field: 'return',
      headerName: 'Refund Status?',
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
        <Label variant="soft" color={RequestStatusMap[row?.refundTarget]}>
          {row?.refundTarget}
        </Label>
      ),
    },
    {
      field: 'method',
      headerName: 'Payment Method',
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
        <Label variant="soft" color={'info'}>
          {`${row?.order?.paymentMethod}`}
        </Label>
      ),
    },

    {
      field: 'total',
      headerName: 'Total (QAR)',
      flex: 0.1,
      minWidth: 50,
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
        <Label variant="soft" color={'primary'}>
          {formatCurrency(row?.order?.finalPriceWithoutReturned)}
        </Label>
      ),
    },

    {
      field: 'status',
      headerName: 'Order Status',
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
        <Label variant="soft" color={`${statusColorMap[row?.order?.status]}`}>
          {row?.order?.status}
        </Label>
      ),
    },
    {
      type: 'actions',
      field: 'actions',
      flex: 0.03,
      minWidth: 120,
      headerName: 'Actions',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CommonButton
            title={'Issue Refund'}
            disabled={row?.refundTarget !== 'Pending'}
            color={'info'}
            onClick={() =>
              handleOpenRefundModel(
                row?.order?.finalPriceWithoutReturned,
                row?.id,
              )
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
          routeSegments={[
            {
              name: 'Cancel-Requests',
              path: '/dashboard/admin/cancel-requests',
            },
          ]}
        />
      </Box>
      <SimpleCard>
        <FormControl
          style={{ minWidth: 300, marginBottom: 20, marginRight: 20 }}
        >
          <MyAutocomplete
            url={`/users?limit=20&offset=0&role=customer`}
            label={'Search By Customer'}
            setState={setCustomer}
            placeholder={'Customer Name'}
          />
        </FormControl>

        <FormControl
          style={{ minWidth: 300, marginBottom: 20, marginRight: 20 }}
        >
          <MyAutocomplete
            url={`/vendors?limit=20&offset=0`}
            label={'Search By Designer'}
            setState={setVendor}
            placeholder={'Designer Name'}
          />
        </FormControl>
        {/* <FormControl
          style={{ minWidth: 300, marginBottom: 20, marginRight: 20 }}
        >
          <SelectBox
            id="status"
            label="Select Status"
            value={requests?.status}
            setState={setStatus}
            data={statusCodes}
          />
        </FormControl> */}
        <MyDataTable
          columns={columns}
          rows={requests?.rows}
          loading={requests?.isLoading}
          rowCount={requests?.count}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
        <IssueRefundModel
          open={bool.value}
          onClose={() => {
            setData(0)
            setCancelId(0)
            bool.onFalse()
          }}
          orderValue={data}
          id={cancelId}
          setRequestUpdate={handleRequestUpdate}
        />
      </SimpleCard>
    </Container>
  )
}
