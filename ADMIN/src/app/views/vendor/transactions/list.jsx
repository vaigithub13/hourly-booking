import {
  Box,
  Button,
  Icon,
  ListItemText,
  Stack,
  styled,
  Typography,
} from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'
import { useState } from 'react'
import { deleteRequest, getRequest } from 'app/utils/request'
import { useEffect } from 'react'
import Label from 'app/components/label'
import { fDate, formatCurrency, fTime } from 'app/utils/utils'
import { useBoolean } from 'app/hooks/useBoolean'
import { useDataContext } from 'app/contexts/DataContext'
import { toast } from 'react-toastify'
import { ConfirmDialog } from 'app/components/custom-dialog'
import { useCallback } from 'react'
import MyDataTable from 'app/components/DataTable/MyDataTable'
import { useRouter } from 'app/hooks/useRouter'

import useAuth from 'app/hooks/useAuth'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))
export default function Transactions() {
  const { user } = useAuth()
  const confirm = useBoolean()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0,
  })

  const fetchTransactions = async () => {
    const offset = (paginationModel?.page + 1 - 1) * paginationModel?.pageSize
    setLoading(true)
    const res = await getRequest(
      `/transactions/?limit=${paginationModel?.pageSize}&offset=${offset}&vendorId=${user?.id}&isSortDesc=true`,
      router,
    )
    setData(res?.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchTransactions()
  }, [paginationModel?.page, paginationModel?.pageSize])

  const columns = [
    {
      field: 'amount',
      headerName: 'Amount Received (INR)',
      flex: 0.2,
      minWidth: 200,
      sortable: false,
      filterable: false,
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
      flex: 0.2,
      minWidth: 200,
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

    // {
    //   field: 'type',
    //   headerName: 'Type',
    //   flex: 0.2,
    //   minWidth: 200,
    //   sortable: false,
    //   filterable: false,
    //   disableColumnMenu: true,

    //   renderCell: ({ row }) => (
    //     <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
    //       <Label variant="soft" color={row?.type === 0 ? 'info' : 'error'}>
    //         {row?.type === 0 ? 'In' : 'Out'}
    //       </Label>
    //     </Stack>
    //   ),
    // },

    {
      field: 'description',
      headerName: 'Description',
      flex: 0.2,
      minWidth: 200,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <ListItemText
            primary={row?.description?.en}
            secondary={row?.description?.ar}
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
  ]

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Transactions', path: '/dashboard/vendor/transactions' },
          ]}
        />
      </Box>
      <SimpleCard>
        <MyDataTable
          columns={columns}
          rows={data?.rows}
          rowCount={data?.count}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </SimpleCard>
    </Container>
  )
}
