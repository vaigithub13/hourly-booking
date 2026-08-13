import { Box, Button, Icon, Stack, styled } from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'
import { useBoolean } from 'app/hooks/useBoolean'
import { useParams } from 'app/hooks/useParams'
import { getRequest } from 'app/utils/request'
import { useEffect } from 'react'
import { useState } from 'react'
import VendorInfo from 'app/components/profile/VendorInfo'
import { useRouter } from 'app/hooks/useRouter'
import Label from 'app/components/label'
import ListItem from 'app/components/listitemtext'
import MyAvatar from 'app/components/common-avatar'
import { useReducer } from 'react'
import { ordersReducer } from 'app/utils/reducers'
import MyDataTable from 'app/components/DataTable/MyDataTable'
import { fDate, formatCurrency, fTime, statusColorMap } from 'app/utils/utils'
import CommonButton from 'app/components/common-button'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

export default function Profile() {
  const router = useRouter()
  const [currentVendor, setCurrentVendor] = useState(null)
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0,
  })
  const initialOrdersState = {
    isLoading: false,
    count: 0,
    rows: [],
  }

  const [orders, dispatch] = useReducer(ordersReducer, initialOrdersState)

  //action creaters
  const setOrders = (orders) =>
    dispatch({ type: 'SET_ORDERS', payload: orders })
  const setLoading = (loading) =>
    dispatch({ type: 'SET_LOADING', payload: loading })

  const params = useParams()
  const loading = useBoolean()
  const { id } = params

  const columns = [
    {
      field: 'orderId',
      headerName: '#id',
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
          />
        </Stack>
      ),
    },

    {
      field: 'vendorName',
      headerName: 'Vendor',
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
      field: 'items',
      headerName: 'Items',
      flex: 0.1,
      minWidth: 80,
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
      headerName: 'Total (QAR)',
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      filterable: false,

      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Label variant="soft" color={'primary'}>
          {formatCurrency(row?.finalPrice)}
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
      renderCell: ({ row }) => (
        <Label variant="soft" color={`${statusColorMap[row?.status]}`}>
          {row?.status}
        </Label>
      ),
    },
    {
      type: 'actions',
      field: 'actions',
      flex: 0.03,
      minWidth: 120,
      headerName: 'Action',
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
              router.push(`/dashboard/admin/orders/${row?.id}/details`)
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

  const fetchOrders = async () => {
    const offset = (paginationModel?.page + 1 - 1) * paginationModel?.pageSize
    let url = `/order/?limit=${
      paginationModel?.pageSize
    }&offset=${offset}&vendorId=${Number(id)}`
    setLoading(true)
    const res = await getRequest(url, router)
    setLoading(false)
    setOrders(res?.data)
  }

  const fetchCurrentVendor = async () => {
    loading.onTrue()
    const res = await getRequest(`/vendors/${id}`)
    if (res) {
      setCurrentVendor(res?.data)
    }
    loading.onFalse()
  }

  useEffect(() => {
    if (id) {
      fetchCurrentVendor()
    }
  }, [id])

  useEffect(() => {
    fetchOrders()
  }, [id, paginationModel?.page, paginationModel?.pageSize])

  const onEdit = () => {
    router.push(`/dashboard/admin/vendors/${id}/edit`)
  }

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Designers', path: '/dashboard/admin/vendors' },
            { name: `Profile` },
          ]}
        />
      </Box>
      <VendorInfo
        logo={currentVendor?.logo}
        vendorName={currentVendor?.vendorName}
        username={currentVendor?.username}
        ownerName={currentVendor?.ownerName}
        email={currentVendor?.email}
        phoneNumber={currentVendor?.phoneNumber}
        address={currentVendor?.address}
        certificate={currentVendor?.certificate}
        appPercentage={currentVendor?.appPercentage}
        approved={currentVendor?.status === 'Approved'}
        rate={currentVendor?.rate}
        isAdmin={true}
        onEdit={onEdit}
        loading={loading.value}
      />
      <SimpleCard title="Orders">
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
