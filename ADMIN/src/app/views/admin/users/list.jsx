import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
  styled,
} from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'
import MyAutocomplete from 'app/components/AutoComplete/MyAutocomplete'
import MyAvatar from 'app/components/common-avatar/avatar'
import CommonButton from 'app/components/common-button'
import { ConfirmDialog } from 'app/components/custom-dialog'
import MyDataTable from 'app/components/DataTable/MyDataTable'
import Label from 'app/components/label'
import ListItem from 'app/components/listitemtext/ListItem'
import SearchField from 'app/components/search-field/search-field'
import { useBoolean } from 'app/hooks/useBoolean'
import { useRouter } from 'app/hooks/useRouter'
import { userReducer } from 'app/utils/reducers'
import {
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
} from 'app/utils/request'
import { debounce } from 'lodash'
import { useEffect } from 'react'
import { useReducer } from 'react'
import { useCallback, useState } from 'react'
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

export default function Users() {
  const router = useRouter()
  const confirm = useBoolean()
  const [rowId, setRowId] = useState(null)
  const [title, setTitle] = useState('')
  const initialState = {
    count: 0,
    rows: [],
    blocked: false,
    false: false,
    search: '',
    isLoading: false,
  }

  const [users, dispatch] = useReducer(userReducer, initialState)

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0,
  })

  const [selectedStatus, setSelectedStatus] = useState('All')

  // action creaters
  const setUsers = (user) => dispatch({ type: 'SET_USERS', payload: user })
  const setLoading = (loading) =>
    dispatch({ type: 'SET_LOADING', payload: loading })
  const setVerified = (deleted) =>
    dispatch({ type: 'SET_VERIFIED', payload: deleted })
  const setBlocked = (blocked) =>
    dispatch({ type: 'SET_BLOCKED', payload: blocked })
  const setSearch = (name) => dispatch({ type: 'SET_SEARCH', payload: name })

  const fetchUsers = async () => {
    const offset = (paginationModel.page + 1 - 1) * paginationModel.pageSize

    let url = `/users?limit=${paginationModel.pageSize}&offset=${offset}&role=customer`

    if (users.blocked) {
      url += `&blocked=${users.blocked}`
    }

    if (users.verified) {
      url += `&verified=${users.verified}`
    }
    if (users.search !== '') {
      url += `&search=${users.search}`
    }

    setLoading(true)

    const res = await getRequest(url, router)
    setLoading(false)
    setUsers(res?.data)
  }

  useEffect(() => {
    fetchUsers()
  }, [
    paginationModel.page,
    paginationModel.pageSize,
    users.search,
    users.blocked,
    users.verified,
  ])

  const handleBlockUnblock = useCallback(
    async (id, block) => {
      const updatedUsers = users?.rows?.map((user) =>
        user?.id === id ? { ...user, blocked: !user.blocked } : user,
      )

      const res = await putRequest(`/users/block-unblock-user/${id}`, null)
      if (res) {
        setUsers({ ...users, rows: updatedUsers })
        setRowId(null)
        toast.success(block ? 'Un-block Successfull' : 'Block Successful')
      }
    },
    [users, setUsers],
  )

  const handleDelete = useCallback(
    async (id) => {
      const updatedUsers = users?.rows?.filter((user) => user?.id !== id)

      const res = await deleteRequest(`/users/${id}`)
      if (res) {
        setUsers({ ...users, rows: updatedUsers })
        setRowId(null)
        toast.success('Deleted Successful')
      }
    },
    [users, setUsers],
  )

  const debouncedBlockUnblock = debounce(handleBlockUnblock, 1000)

  const handleDialoge = useCallback(
    (data, message) => {
      setRowId(data)
      setTitle(message)
      confirm.onTrue()
    },
    [rowId, setRowId, title, setTitle, confirm],
  )

  const columns = [
    {
      field: 'fullName',
      headerName: 'Customer Name',
      flex: 0.2,
      minWidth: 200,
      hideable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <MyAvatar image={row?.image} name={row?.firstName} />
          <ListItem
            primaryText={`${row?.firstName} ${row?.lastName}`}
            secondaryText={row?.email}
          />
        </Stack>
      ),
    },

    // {
    //   field: 'gender',
    //   headerName: 'Gender',
    //   flex: 0.1,
    //   minWidth: 100,
    //   sortable: false,
    //   filterable: false,
    //   disableColumnMenu: true,

    //   renderCell: ({ row }) => (
    //     <Label
    //       variant="soft"
    //       color={(row?.gender === 'male' && 'info') || 'success'}
    //     >
    //       {row?.gender}
    //     </Label>
    //   ),
    // },
    {
      field: 'phoneNumber',
      headerName: 'Phone No.',
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <Typography variant="subtitle2">{row?.phoneNumber}</Typography>
        </Stack>
      ),
    },

    {
      field: 'isBlocked',
      headerName: 'Is Blocked ?',
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: ({ row }) => (
        <Label variant="soft" color={(row?.blocked && 'primary') || 'warning'}>
          {row?.blocked ? 'true' : 'false'}
        </Label>
      ),
    },

    {
      field: 'isVerified',
      headerName: 'Is Verified ?',
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: ({ row }) => (
        <Label variant="soft" color={(row?.verified && 'primary') || 'warning'}>
          {row?.verified ? 'true' : 'false'}
        </Label>
      ),
    },

    {
      type: 'actions',
      field: 'actions',
      flex: 0.1,
      minWidth: 100,
      headerName: 'Actions',
      //   align: 'right',
      //   headerAlign: 'right',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          {/* <CommonButton
            title="Delete"
            color={'error'}
            disabled={row?.isDeleted}
            onClick={() => handleDialoge(row, 'Delete')}
          /> */}
          <CommonButton
            title={row?.blocked ? 'Un-Block' : 'Block'}
            color={row?.blocked ? 'error' : 'secondary'}
            disabled={row?.isDeleted}
            onClick={() =>
              row?.blocked
                ? debouncedBlockUnblock(row?.id, row?.blocked)
                : handleDialoge(row, 'Block')
            }
          />

          {/* <CommonButton
            title={'View Info'}
            color={'info'}
            onClick={() =>
              router.push(`/dashboard/customers/${row?.id}/profile`)
            }
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
            { name: 'Users', path: '/dashboard/users' },
            // { name: 'Users' },
          ]}
        />
      </Box>
      <SimpleCard>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            marginBottom: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <FormControl
            style={{ minWidth: 300, marginBottom: 20, marginRight: 20 }}
          >
            <SearchField
              label={'Search Customers'}
              placeholder={'Customer Name'}
              setSearch={setSearch}
            />
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={users.blocked}
                onChange={(e) => setBlocked(e.target.checked)}
              />
            }
            label="is Blocked?"
            sx={{ marginBottom: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={users.verified}
                onChange={(e) => setVerified(e.target.checked)}
              />
            }
            label="is Verified?"
            sx={{ marginBottom: 2 }}
          />
        </Box>

        <MyDataTable
          columns={columns}
          rows={users?.rows}
          loading={users?.isLoading}
          rowCount={users?.count}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </SimpleCard>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={title}
        content={
          <>
            <Typography
              color={title === 'Delete' ? 'error' : 'warning'}
              sx={{ fontStyle: 'italic', fontWeight: 'bold' }}
            >
              {`Are you sure want to ${
                title === 'Block' ? 'block' : 'delete'
              } ${rowId?.firstName}?`}
            </Typography>
          </>
        }
        action={
          <CommonButton
            title={'Yes'}
            variant="contained"
            color="error"
            onClick={() => {
              title === 'Block'
                ? handleBlockUnblock(rowId?.id, rowId?.isBlocked)
                : handleDelete(rowId?.id)
              confirm.onFalse()
            }}
          />
        }
      />
    </Container>
  )
}
