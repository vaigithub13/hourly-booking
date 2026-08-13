import { CloudUploadOutlined, PictureAsPdfOutlined } from '@mui/icons-material'
import {
  Box,
  Button,
  FormControl,
  Icon,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  styled,
} from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'
import MyAvatar from 'app/components/common-avatar/avatar'
import CommonButton from 'app/components/common-button'
import MyDataTable from 'app/components/DataTable/MyDataTable'
import Label from 'app/components/label'
import ListItem from 'app/components/listitemtext/ListItem'
import SearchField from 'app/components/search-field/search-field'
import { useBoolean } from 'app/hooks/useBoolean'
import { useRouter } from 'app/hooks/useRouter'
import { getRequest, patchRequest, postRequest } from 'app/utils/request'
import { debounce } from 'lodash'
import { useEffect } from 'react'
import { useReducer } from 'react'
import { useState } from 'react'
import { useCallback } from 'react'

import { putRequest } from 'app/utils/request'
import { vendorReducer } from 'app/utils/reducers'
import { toast } from 'react-toastify'
import RatingDisplay from 'app/components/Rating/RatingDisplay'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

// const Small = styled('small')(({ bgcolor }) => ({
//   width: 50,
//   height: 15,
//   color: '#fff',
//   padding: '2px 8px',
//   borderRadius: '4px',
//   overflow: 'hidden',
//   background: bgcolor,
//   boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.12), 0 2px 2px 0 rgba(0, 0, 0, 0.24)',
// }))

export default function Vendors() {
  const initials = {
    isLoading: false,
    count: 0,
    rows: [],
    blocked: 0,
    status: '',
    name: '',
  }

  const router = useRouter()
  const confirm = useBoolean()
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const statuses = [
    { key: 0, value: 'All' },
    { key: true, value: 'Approved' },
    { key: false, value: 'Pending' },
    { key: true, value: 'Blocked' },
  ]
  const [vendors, dispatch] = useReducer(vendorReducer, initials)
  const setVendors = (vendor) =>
    dispatch({ type: 'SET_VENDORS', payload: vendor })
  const setVendorsLoading = (loading) =>
    dispatch({ type: 'SET_LOADING', payload: loading })
  const setVendorBlock = (block) =>
    dispatch({ type: 'SET_BLOCKED', payload: block })
  const setVendorApproved = (approve) =>
    dispatch({ type: 'SET_APPROVED', payload: approve })
  const setVendorsName = (name) => dispatch({ type: 'SET_NAME', payload: name })

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0,
  })

  const fetchVendors = async () => {
    const offset = (paginationModel.page + 1 - 1) * paginationModel?.pageSize
    setVendorsLoading(true)
    let url = `/vendors?limit=${paginationModel.pageSize}&offset=${offset}`
    if (vendors?.blocked !== 0) {
      url += `&blocked=${vendors?.blocked}`
    }
    if (vendors?.status !== '') {
      url += `&status=${vendors?.status}`
    }
    if (vendors?.name !== '') {
      url += `&search=${vendors?.name}`
    }
    const res = await getRequest(url, router)
    setVendorsLoading(false)
    setVendors(res?.data)
  }

  const handleStatusChange = (status) => {
    setSelectedStatus(status?.value)
    if (status?.value === 'All') {
      setVendorBlock(0)
      setVendorApproved('')
    } else if (status?.value === 'Approved') {
      setVendorApproved(status?.value)
      setVendorBlock(0)
    } else if (status?.value === 'Pending') {
      setVendorApproved(status?.value)
      setVendorBlock(0)
    } else {
      setVendorBlock(status?.key) // Set status to null for "All"
      setVendorApproved('')
    }
  }

  const handleBlockUnblock = useCallback(
    async (id, block, email) => {
      const updatedVendors = vendors?.rows?.map((vendor) =>
        vendor?.id === id ? { ...vendor, blocked: !vendor.blocked } : vendor,
      )
      const res = await patchRequest(
        `/admin/update-vendor/${id}`,
        { email, blocked: !block },
        router,
      )
      if (res) {
        setVendors({ ...vendors, rows: updatedVendors })
        toast.success(block ? 'Un-blocked Successfull' : 'Blocked Successfull')
      } else {
        toast.error('Something went wrong')
      }
    },
    [vendors, setVendors],
  )

  const handleApprove = useCallback(
    async (id, email) => {
      const updatedVendors = vendors?.rows?.map((vendor) =>
        vendor?.id === id ? { ...vendor, status: 'Approved' } : vendor,
      )
      const res = await patchRequest(
        `/admin/update-vendor/${id}`,
        { email, status: 'Approved' },
        router,
      )
      if (res) {
        setVendors({ ...vendors, rows: updatedVendors })
        toast.success('Approve Successfull')
      }
    },
    [vendors, setVendors],
  )

  const debouncedApproved = debounce(handleApprove, 1000)
  const debouncedBlockUnblock = debounce(handleBlockUnblock, 1000)

  //   const handleAttachmentDialog = useCallback(
  //     (data) => {
  //       setUser(data)
  //       confirm.onTrue()
  //     },
  //     [user, setUser, confirm],
  //   )

  const handleImagePopup = useCallback(
    (data) => {
      setOpen(true)
      setUrl(data?.attachment)
    },
    [open, setOpen, url, setUrl],
  )

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 0.3,
      minWidth: 200,
      hideable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <MyAvatar image={row?.logo} name={row?.row?.ownerName?.en} />
          <ListItem
            primaryText={`${row?.ownerName?.en} (${row?.ownerName?.ar})`}
            secondaryText={row?.vendorName?.en}
          />
        </Stack>
      ),
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone No.',
      flex: 0.2,
      minWidth: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <Typography variant="subtitle2">+974{row?.phoneNumber}</Typography>
        </Stack>
      ),
    },

    {
      field: 'rating',
      headerName: 'Rating',
      flex: 0.15,
      minWidth: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: ({ row }) => <RatingDisplay rate={row?.rate} size="small" />,
    },

    {
      field: 'approved',
      headerName: 'Status',
      flex: 0.15,
      minWidth: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', flexDirection: 'column' }} gap={0.5}>
          <Label
            variant="soft"
            color={(row?.status === 'Approved' && 'success') || 'secondary'}
          >
            {row?.status}
          </Label>
          {row?.blocked && (
            <Label
              variant="soft"
              color={(row?.blocked && 'error') || 'success'}
            >
              {'Blocked'}
            </Label>
          )}
        </Box>
      ),
    },

    // {
    //   field: 'blocked',
    //   headerName: 'is Blocked?',
    //   flex: 0.1,
    //   minWidth: 100,
    //   sortable: false,
    //   filterable: false,
    //   disableColumnMenu: true,

    //   renderCell: ({ row }) => (
    //     <Label variant="soft" color={(row?.blocked && 'error') || 'success'}>
    //       {row?.blocked ? 'True' : 'False'}
    //     </Label>
    //   ),
    // },

    // {
    //   field: 'certificate',
    //   headerName: 'CR',
    //   flex: 0.1,
    //   minWidth: 100,
    //   sortable: false,
    //   renderHeader: (params) => (
    //     <Box
    //       sx={{
    //         whiteSpace: 'normal', // Allow text to wrap
    //         overflowWrap: 'break-word', // Handle long words
    //         lineHeight: 'normal', // Ensure no extra vertical space
    //         padding: 0, // Remove default padding
    //         margin: 0, // Remove default margins
    //       }}
    //     >
    //       {params.colDef.headerName}
    //     </Box>
    //   ),
    //   filterable: false,
    //   disableColumnMenu: true,
    //   renderCell: ({ row }) =>
    //     row?.certificate?.endsWith('.jpg') ||
    //     row?.certificate?.endsWith('.jpeg') ||
    //     row?.certificate?.endsWith('.png') ? (
    //       <IconButton
    //         color="error"
    //         href={row?.certificate}
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         <Tooltip title="View Image" placement="top" arrow>
    //           <MyAvatar
    //             image={row?.certificate}
    //             alt="Attachment"
    //             // onClick={() => handleImagePopup(row)}
    //           />
    //         </Tooltip>
    //       </IconButton>
    //     ) : (
    //       row?.certificate?.endsWith('.pdf') && (
    //         <IconButton
    //           color="error"
    //           href={row?.certificate}
    //           target="_blank"
    //           rel="noopener noreferrer"
    //         >
    //           <Tooltip title="View CR" placement="top" arrow>
    //             <PictureAsPdfOutlined sx={{ fontSize: '34px' }} />
    //           </Tooltip>
    //         </IconButton>
    //       )
    //     ),
    // },

    {
      type: 'actions',
      field: 'actions',
      flex: 0.2,
      minWidth: 250,
      headerName: 'Actions',
      headerAlign: 'center',
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
          {row?.status !== 'Approved' && (
            <CommonButton
              title={row?.status === 'Approved' ? 'Approved' : 'Approve'}
              color={row?.status === 'Approved' ? 'success' : 'warning'}
              onClick={() => debouncedApproved(row?.id, row?.email)}
            />
          )}

          <CommonButton
            title={row?.blocked ? 'Un-Block' : 'Block'}
            color={row?.blocked ? 'error' : 'secondary'}
            onClick={() =>
              debouncedBlockUnblock(row?.id, row?.blocked, row?.email)
            }
          />
          <CommonButton
            title={'View Info'}
            color={'info'}
            onClick={() =>
              router.push(`/dashboard/admin/vendors/${row?.id}/profile`)
            }
          />
        </Box>
      ),
    },
  ]

  useEffect(() => {
    fetchVendors()
  }, [
    paginationModel?.page,
    paginationModel?.pageSize,
    vendors?.blocked,
    vendors?.status,
    vendors?.name,
  ])

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[{ name: 'Designers', path: '/dashboard/vendors' }]}
          action={
            <Button
              // component={RouterLink}
              // href={paths.dashboard.shop.new}
              onClick={() => router.push('/dashboard/admin/vendors/create')}
              variant="outlined"
              startIcon={<Icon>add</Icon>}
            >
              Add Designer
            </Button>
          }
        />
      </Box>

      <SimpleCard>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            marginBottom: 2,
            alignItems: 'center',
          }}
        >
          <FormControl style={{ minWidth: 300 }}>
            <SearchField
              setSearch={setVendorsName}
              label={'Search By Designer'}
              placeholder={'Designer Name'}
            />
          </FormControl>
          {statuses?.map((status) => (
            <Button
              key={status?.value}
              variant={
                selectedStatus === status?.value ? 'contained' : 'outlined'
              }
              onClick={() => handleStatusChange(status)}
              color={selectedStatus === status?.value ? 'primary' : 'info'}
            >
              {status?.value}
            </Button>
          ))}
        </Box>

        <MyDataTable
          columns={columns}
          rows={vendors?.rows}
          rowCount={vendors?.count}
          loading={vendors?.isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </SimpleCard>
    </Container>
  )
}
