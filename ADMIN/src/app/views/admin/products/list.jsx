import {
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  Icon,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  styled,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'
import { useDataContext } from 'app/contexts/DataContext'
import { deleteRequest, getRequest, putRequest } from 'app/utils/request'
import Label from 'app/components/label'
import { useCallback, useState } from 'react'
import { useEffect } from 'react'
import SearchField from 'app/components/search-field/search-field'
import SelectBox from 'app/components/select-box/select-box'
import { useReducer } from 'react'
import MyAvatar from 'app/components/common-avatar/avatar'
import ListItem from 'app/components/listitemtext/ListItem'
import MyDataTable from 'app/components/DataTable/MyDataTable'
import { productsReducer } from 'app/utils/reducers'
import { useRouter } from 'app/hooks/useRouter'
import MyAutocomplete from 'app/components/AutoComplete/MyAutocomplete'
import CommonButton from 'app/components/common-button'
import { useBoolean } from 'app/hooks/useBoolean'
import { ConfirmDialog } from 'app/components/custom-dialog'
import { toast } from 'react-toastify'
import { formatCurrency } from 'app/utils/utils'
import { debounce } from 'lodash'
import {
  Delete,
  DoDisturbOff,
  Edit,
  HowToReg,
  Visibility,
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
export default function Products() {
  const { categories } = useDataContext()
  const router = useRouter()
  const confirm = useBoolean()
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0,
  })

  const [rowId, setRowId] = useState(0)

  const initialState = {
    isLoading: false,
    count: 0,
    rows: [],
    vendorId: 0,
    categoryId: [],
    approved: '0',
    name: '',
    readyToShip: false,
  }

  const statusFilter = [
    { key: 'All', value: '0' },
    { key: 'Approved', value: true },
    { key: 'Pending', value: false },
  ]
  const [products, dispatch] = useReducer(productsReducer, initialState)

  const setProducts = (data) =>
    dispatch({ type: 'SET_PRODUCTS', payload: data })
  const setProductsLoading = (loading) =>
    dispatch({ type: 'SET_PRODUCTS_LOADING', payload: loading })
  const setProductsName = (name) =>
    dispatch({ type: 'SET_PRODUCTS_NAME', payload: name })
  const setProductsUser = (user) =>
    dispatch({ type: 'SET_PRODUCTS_USER', payload: user })
  const setProductsCategory = (category) =>
    dispatch({ type: 'SET_PRODUCTS_CATEGORY', payload: category })
  const setProductReadyToShip = (value) =>
    dispatch({ type: 'SET_PRODUCTS_READY_TO_SHIP', payload: value })
  const setProductStatus = (status) =>
    dispatch({ type: 'SET_PRODUCTS_STATUS', payload: status })

  const fetchProducts = async () => {
    const offset = (paginationModel.page + 1 - 1) * paginationModel.pageSize
    let url = `/products/for-vendor?limit=${paginationModel.pageSize}&offset=${offset}`
    if (products.vendorId !== 0) {
      url += `&vendorId=${products.vendorId}`
    }

    if (products.categoryId.length > 0) {
      products.categoryId.forEach((id) => {
        url += `&categoriesIds=${id}`
      })
    }

    if (products?.readyToShip) {
      url += `&readyToShip=${products?.readyToShip}`
    }

    if (products.name !== '') {
      url += `&name=${products.name}`
    }

    if (products.approved !== '0') {
      url += `&approved=${products.approved}`
    }
    setProductsLoading(true)
    const res = await getRequest(url, router)
    setProductsLoading(false)
    setProducts(res?.data)
  }

  const handleDeleteRow = useCallback(
    async (id) => {
      // console.log(typeof id);
      const updatedProducts = products?.rows?.filter(
        (product) => product?.id !== id,
      )
      const res = await deleteRequest(`/products/${id}`)

      if (res) {
        // enqueueSnackbar(`Removed success!`);
        toast.success('Removed Succssfully')
        setProducts({
          ...products,
          count: products?.count - 1,
          products: updatedProducts,
        })
      } else {
        // enqueueSnackbar(`Something went wrong!`, { variant: 'error' });
        toast.error('Something Went Wrong')
      }
    },
    [products, setProducts],
  )

  const handleApprove = useCallback(
    async (id) => {
      const updatedProducts = products?.rows?.map((product) =>
        product?.id === id ? { ...product, approved: true } : product,
      )
      const res = await putRequest(`/products/approve/${id}`, {
        approved: true,
      })
      if (res) {
        setProducts({ ...products, products: updatedProducts })
        toast.success('Approve Successfull')
      }
    },
    [products, setProducts],
  )

  const handleDisApprove = useCallback(
    async (id) => {
      const updatedProducts = products?.rows?.map((product) =>
        product?.id === id ? { ...product, approved: false } : product,
      )
      const res = await putRequest(`/products/disapprove/${id}`, {
        approved: true,
      })
      if (res) {
        setProducts({ ...products, products: updatedProducts })
        toast.success('Dis-Approved Successfull')
      }
    },
    [products, setProducts],
  )

  const debouncedApproved = debounce(handleApprove, 1000)
  const debounceDisApproved = debounce(handleDisApprove, 1000)

  useEffect(() => {
    fetchProducts()
  }, [
    paginationModel.page,
    paginationModel.pageSize,
    products.vendorId,
    products.categoryId,
    products.name,
    products.readyToShip,
    products?.approved,
  ])

  const columns = [
    {
      field: 'name',
      headerName: 'Product Name',
      flex: 0.1,
      minWidth: 200,
      hideable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <MyAvatar
            image={row?.mainImage}
            name={row?.name?.en}
            // onClick={() =>
            //   router.push(`/dashboard/products/${row?.id}/details`)
            // }
          />

          <ListItem
            primaryText={row?.name?.en}
            secondaryText={row?.name?.ar}
            primaryWidth={'120px'}
            secondaryWidth={'120px'}
          />
        </Stack>
      ),
    },
    {
      field: 'userName',
      headerName: 'Business Name',
      flex: 0.1,
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
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <MyAvatar
            image={row?.vendor?.logo}
            name={row?.vendor?.ownerName?.en}
          />
          <ListItem
            primaryText={`${row?.vendor?.ownerName?.en} `}
            secondaryText={row?.vendor?.ownerName?.ar}
            primaryWidth={'120px'}
            secondaryWidth={'120px'}
          />
        </Stack>
      ),
    },
    {
      field: 'category',
      headerName: 'Categories',
      flex: 0.1,
      minWidth: 180,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
          }}
        >
          {row?.categories?.map((category) => (
            <Label variant="soft" size="small" color="info">
              {category?.name?.en}
            </Label>
          ))}
        </Box>
      ),
    },

    {
      field: 'price',
      headerName: 'Price (INR)',
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
      renderCell: ({ row }) =>
        row?.discountedPrice ? (
          <Box
            display={'flex'}
            flexDirection={{ xs: 'column', sm: 'row' }} // column on mobile, row on larger screens
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={0.8}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: 'green', fontSize: '15px' }}
            >
              {row?.discountedPrice}
            </Typography>
            <Typography
              sx={{ textDecoration: 'line-through', fontSize: '12px' }}
            >
              {row?.price}
            </Typography>
          </Box>
        ) : (
          <Typography variant="subtitle2">{row.price}</Typography>
        ),
    },

    {
      field: 'approved',
      headerName: 'is Approved?',
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
        <Label
          variant="soft"
          color={(row?.approved && 'success') || 'secondary'}
        >
          {row?.approved ? 'Approved' : 'Pending'}
        </Label>
      ),
    },

    {
      type: 'actions',
      field: 'actions',
      flex: 0.1,
      minWidth: 80,
      headerName: 'Actions',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        // <Box
        //   sx={{
        //     display: 'flex',
        //     alignItems: 'center',
        //     gap: 1,
        //     flexWrap: 'wrap',
        //   }}
        // >
        //   {row?.approved ? (
        //     <CommonButton
        //       title={'Edit'}
        //       color={'warning'}
        //       onClick={() =>
        //         router.push(`/dashboard/admin/products/${row?.id}/edit`)
        //       }
        //     />
        //   ) : (
        //     <CommonButton
        //       title={row?.approved ? 'Approved' : 'Approve'}
        //       color={row?.approved ? 'success' : 'warning'}
        //       disabled={row?.approved}
        //       onClick={() => debouncedApproved(row?.id)}
        //     />
        //   )}
        //   <CommonButton
        //     title={'View'}
        //     color={'info'}
        //     onClick={() =>
        //       router.push(`/dashboard/admin/products/${row?.id}/details`)
        //     }
        //   />

        //   <CommonButton
        //     title={'Delete'}
        //     color={'error'}
        //     onClick={() => {
        //       confirm.onTrue()
        //       setRowId(row?.id)
        //     }}
        //   />
        // </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="View Details" placement="top" arrow>
            <IconButton
              color="success"
              size="small"
              component="a"
              href={`/dashboard/admin/products/${row?.id}/details`}
              // target="_blank"
              // rel="noopener noreferrer"
            >
              <Visibility />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit" placement="top" arrow>
            <IconButton
              color="info"
              size="small"
              component="a"
              href={`/dashboard/admin/products/${row?.id}/edit`}
              // target="_blank"
              // rel="noopener noreferrer"
            >
              <Edit />
            </IconButton>
          </Tooltip>
          {row?.approved ? (
            <>
              <IconButton
                color="warning"
                size="sm"
                onClick={() => debounceDisApproved(row?.id)}
              >
                <Tooltip title="dis-approve" placement="top" arrow>
                  <DoDisturbOff />
                </Tooltip>
              </IconButton>
            </>
          ) : (
            <IconButton
              color="info"
              size="sm"
              onClick={() => debouncedApproved(row?.id)}
            >
              <Tooltip title="Approve" placement="top" arrow>
                <HowToReg />
              </Tooltip>
            </IconButton>
          )}

          <IconButton
            color="error"
            size="sm"
            onClick={() => {
              confirm.onTrue()
              setRowId(row?.id)
            }}
          >
            <Tooltip title="Delete" placement="top" arrow>
              <Delete />
            </Tooltip>
          </IconButton>
        </Box>
      ),
    },
  ]

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Products', path: '/dashboard/admin/products' },
          ]}
          action={
            <Button
              // component={RouterLink}
              // href={paths.dashboard.shop.new}
              onClick={() => router.push('/dashboard/admin/products/create')}
              variant="outlined"
              startIcon={<Icon>add</Icon>}
            >
              Add a new Product
            </Button>
          }
        />
      </Box>
      <SimpleCard>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <SearchField
                setSearch={setProductsName}
                label={'Search Products'}
                placeholder={'Ex. APp'}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <MyAutocomplete
                url={`/vendors?limit=20&offset=0&status=Approved`}
                label={'Search By Business Name'}
                setState={setProductsUser}
                placeholder={'Business Name'}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id={'statusFilter'}>{'Select Status'}</InputLabel>
              <Select
                labelId={'statusFilter'}
                value={products?.approved ?? 0}
                onChange={(e) => setProductStatus(e.target.value)}
                label={'Select Status'}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      overflowY: 'auto',
                    },
                  },
                }}
              >
                {statusFilter?.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {option?.key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={products.readyToShip}
                  onChange={(e) => setProductReadyToShip(e.target.checked)}
                />
              }
              label="Ready to Wear?"
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <SelectBox
                id="categoryId"
                label="Select Category"
                menuProp={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      overflowY: 'auto',
                    },
                  },
                }}
                value={products?.categoryId}
                setState={setProductsCategory}
                data={categories?.rows}
              />
            </FormControl>
          </Grid>
        </Grid>

        <MyDataTable
          columns={columns}
          rows={products?.rows}
          loading={products?.isLoading}
          rowCount={products?.count}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </SimpleCard>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={<>Are you sure want to delete?</>}
        action={
          <CommonButton
            title={'Delete'}
            color={'error'}
            size={'large'}
            onClick={() => {
              handleDeleteRow(rowId)
              confirm.onFalse()
            }}
          />
        }
      />
    </Container>
  )
}
