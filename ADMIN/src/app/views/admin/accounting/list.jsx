import { Box, FormControl, Stack, styled, Typography } from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'
import { useRouter } from 'app/hooks/useRouter'
import { useState } from 'react'
import SearchField from 'app/components/search-field/search-field'
import { useEffect } from 'react'
import CommonButton from 'app/components/common-button'
import MyAvatar from 'app/components/common-avatar/avatar'
import ListItem from 'app/components/listitemtext/ListItem'
import { useReducer } from 'react'
import { getRequest } from 'app/utils/request'
import MyDataTable from 'app/components/DataTable/MyDataTable'
import { accountReducers } from 'app/utils/reducers'
import { formatCurrency } from 'app/utils/utils'

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
  const router = useRouter()
  const initial = { isLoading: false, count: 0, rows: [], name: '' }
  const [accounts, dispatch] = useReducer(accountReducers, initial)

  const setAccounts = (account) =>
    dispatch({ type: 'SET_ACCOUNTS', payload: account })
  const setAccountsLoading = (loading) =>
    dispatch({ type: 'SET_LOADING', payload: loading })
  const setAccountsUser = (uname) =>
    dispatch({ type: 'SET_USER', payload: uname })

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0,
  })

  const fetchAccounting = async () => {
    const offset = (paginationModel?.page + 1 - 1) * paginationModel?.pageSize
    let url = `/accounting/accounting-all-data?limit=${paginationModel?.pageSize}&offset=${offset}`
    if (accounts?.name !== '') {
      url += `&name=${accounts?.name}`
    }
    setAccountsLoading(true)
    const res = await getRequest(url, router)
    setAccountsLoading(false)
    setAccounts(res?.data)
  }

  useEffect(() => {
    fetchAccounting()
  }, [paginationModel?.page, paginationModel?.pageSize, accounts?.name])

  // const handleDeleteRow = useCallback(
  //   async (id) => {
  //     // console.log(typeof id);
  //     const updatedTransactions = transactions?.rows?.filter(
  //       (trasnactions) => trasnactions?.id !== id,
  //     )
  //     const res = await deleteRequest(`/accounts/transaction/${id}`)

  //     if (res) {
  //       // enqueueSnackbar(`Removed success!`);
  //       toast.success('Removed Succssfully')
  //       setTransactions({
  //         ...transactions,
  //         count: transactions?.count - 1,
  //         rows: updatedTransactions,
  //       })
  //     } else {
  //       // enqueueSnackbar(`Something went wrong!`, { variant: 'error' });
  //       toast.error('Something went wrong')
  //     }
  //   },
  //   [transactions, setTransactions],
  // )
  const columns = [
    {
      field: 'vendorName',
      headerName: 'Business Name',
      flex: 0.2,
      minWidth: 300,
      hideable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <MyAvatar image={row?.logo} name={row?.ownerName?.en} />
          <ListItem
            primaryText={`${row?.ownerName?.en}`}
            secondaryText={row?.ownerName?.ar}
          />
        </Stack>
      ),
    },
    {
      field: 'totalRevenue',
      headerName: 'Total Revenue',
      flex: 0.2,
      minWidth: 125,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2">
          {formatCurrency(row?.total_revenue)}
        </Typography>
      ),
    },

    {
      field: 'delivery',
      headerName: 'Delivery Fee',
      flex: 0.2,
      minWidth: 125,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2">
          {formatCurrency(
            row?.total_revenue - row?.total_revenue_without_delivery_charge,
          )}
        </Typography>
      ),
    },

    {
      field: 'vendorShare',
      headerName: 'Designer Share',
      flex: 0.2,
      minWidth: 125,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2">
          {formatCurrency(row?.vendor_share)}
        </Typography>
      ),
    },

    {
      field: 'adminShare',
      headerName: 'Admin Share',
      flex: 0.2,
      minWidth: 125,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2">
          {formatCurrency(row?.admin_revenue)}
        </Typography>
      ),
    },

    {
      field: 'paidAmount',
      headerName: 'Paid',
      flex: 0.2,
      minWidth: 125,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Typography variant="subtitle2">{formatCurrency(row?.paid)}</Typography>
      ),
    },

    {
      field: 'balance',
      headerName: 'Due',
      flex: 0.2,
      minWidth: 125,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: ({ row }) => (
        <Typography variant="subtitle2">{formatCurrency(row?.due)}</Typography>
      ),
    },

    {
      type: 'actions',
      field: 'actions',
      flex: 0.2,
      minWidth: 150,
      headerName: 'Actions',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CommonButton
            title={'View Transactions'}
            color={'info'}
            onClick={() =>
              router.push(`/dashboard/admin/accounting/${row?.id}/transactions`)
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
            { name: 'Accounting', path: '/dashboard/admin/accounting' },
          ]}
        />
      </Box>

      <SimpleCard>
        <FormControl
          style={{ minWidth: 300, marginBottom: 20, marginRight: 20 }}
        >
          <SearchField
            label="Search by Business Name"
            placeholder="Business Name"
            setSearch={setAccountsUser}
          />
        </FormControl>
        <MyDataTable
          columns={columns}
          rows={accounts?.rows}
          loading={accounts?.isLoading}
          rowCount={accounts?.count}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </SimpleCard>
    </Container>
  )
}
