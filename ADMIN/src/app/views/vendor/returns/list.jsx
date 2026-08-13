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
      field: 'id',
      headerName: 'Order Id',
      flex: 0.1,
      minWidth: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: ({ row }) => (
        <Typography variant="subtitle2">{row?.order?.id}</Typography>
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
              router.push(`/dashboard/vendor/returns/${row?.id}/details`)
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
            { name: 'Returns', path: '/dashboard/vendor/returns' },
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
        {/* <FormControl
          style={{ minWidth: 300, marginBottom: 20, marginRight: 20 }}
        >
          <SelectBox
            id="status"
            label="Select Status"
            value={returns?.status}
            setState={setStatus}
            data={returnStatusCodes}
          />
        </FormControl> */}
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
