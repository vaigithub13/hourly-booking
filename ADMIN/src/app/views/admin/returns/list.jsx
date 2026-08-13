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
import { useRouter } from 'app/hooks/useRouter'
import { ordersReducer, returnReducer } from 'app/utils/reducers'
import { getRequest } from 'app/utils/request'
import {
  fDate,
  fTime,
  ReturnStatusColorMap,
  ReturnStatusMap,
} from 'app/utils/utils'
import { useEffect } from 'react'
import { useReducer } from 'react'
import { useState } from 'react'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

export default function Returns() {
  const router = useRouter()
  const { returnStatusCodes } = useDataContext()
  const initialReturnsState = {
    isLoading: false,
    count: 0,
    rows: [],
    userId: 0,
    vendorId: 0,
  }

  const [returns, dispatch] = useReducer(returnReducer, initialReturnsState)
  //action creaters
  const setReturns = (data) => dispatch({ type: 'SET_RETURNS', payload: data })
  const setLoading = (loading) =>
    dispatch({ type: 'SET_LOADING', payload: loading })
  const setUser = (user) => dispatch({ type: 'SET_USER', payload: user })
  const setVendor = (vendor) =>
    dispatch({ type: 'SET_VENDOR', payload: vendor })

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0,
  })

  const fetchReturns = async () => {
    const offset = (paginationModel?.page + 1 - 1) * paginationModel?.pageSize
    let url = `/order/return?limit=${paginationModel?.pageSize}&offset=${offset}`
    if (returns?.userId !== 0) {
      url += `&userId=${returns?.userId}`
    }

    if (returns?.vendorId !== 0) {
      url += `&vendorId=${returns?.vendorId}`
    }
    setLoading(true)
    const res = await getRequest(url)
    setLoading(false)
    setReturns(res?.data)
  }

  useEffect(() => {
    fetchReturns()
  }, [
    paginationModel?.page,
    paginationModel?.pageSize,
    returns?.userId,
    returns?.vendorId,
  ])

  const columns = [
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
      field: 'vendor',
      headerName: 'Business Name',
      flex: 0.2,
      minWidth: 180,
      sortable: false,
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
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack
          direction="row"
          alignItems="center"
          sx={{ py: 2, width: '100%' }}
        >
          <MyAvatar
            image={row?.vendor?.logo}
            name={`${row?.vendor?.ownerName?.en}`}
          />
          <ListItem
            primaryText={`${row?.vendor?.ownerName?.en}`}
            secondaryText={row?.vendor?.email || ''}
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
      minWidth: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: ({ row }) => (
        <ListItem
          primaryText={fDate(row?.createdAt)}
          secondaryText={fTime(row?.createdAt)}
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
      field: 'orderId',
      headerName: 'Order Id',
      flex: 0.1,
      minWidth: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Label variant="soft" color={'warning'}>
          {`${row?.order?.id}`}
        </Label>
      ),
    },
    {
      field: 'orderd',
      headerName: 'Order Items',
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
          {`${row?.order?.items?.length}`}
        </Label>
      ),
    },

    {
      field: 'items',
      headerName: 'Items for Return',
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
          {`${row?.items?.length}`}
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
        <Label variant="soft" color={`${ReturnStatusColorMap[row?.status]}`}>
          {ReturnStatusMap[row?.status]}
        </Label>
      ),
    },
    {
      type: 'actions',
      field: 'actions',
      flex: 0.1,
      minWidth: 150,
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
              router.push(`/dashboard/admin/returns/${row?.id}/details`)
            }
          />
        </Box>
      ),
    },
  ]
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Returns', path: '/dashboard/admin/returns' },
          ]}
        />
      </Box>
      <SimpleCard>
        <FormControl
          style={{ minWidth: 300, marginBottom: 20, marginRight: 20 }}
        >
          <MyAutocomplete
            url={`/users?limit=20&offset=0`}
            label={'Search By Customer'}
            setState={setUser}
            placeholder={'Customer Name'}
          />
        </FormControl>
        <FormControl
          style={{ minWidth: 300, marginBottom: 20, marginRight: 20 }}
        >
          <MyAutocomplete
            url={`/vendors?limit=20&offset=0&approved=true`}
            label={'Search By Business Name'}
            setState={setVendor}
            placeholder={'Business Name'}
          />
        </FormControl>
        <MyDataTable
          columns={columns}
          rows={returns?.rows}
          loading={returns?.isLoading}
          rowCount={returns?.count}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </SimpleCard>
    </Container>
  )
}
