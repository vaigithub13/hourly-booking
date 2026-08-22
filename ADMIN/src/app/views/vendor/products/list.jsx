import {
  Box,
  Button,
  FormControl,
  Icon,
  IconButton,
  Stack,
  styled,
  Tooltip,
  Typography,
} from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'
import { useDataContext } from 'app/contexts/DataContext'
import { deleteRequest, getRequest } from 'app/utils/request'
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
import { Delete, Edit, Visibility } from '@mui/icons-material'

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
    name: '',
  }

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

  const fetchProducts = async () => {
    const offset = (paginationModel.page + 1 - 1) * paginationModel.pageSize
    let url = `/products/for-vendor?limit=${paginationModel.pageSize}&offset=${offset}&isDiscounted=false`
    if (products.vendorId !== 0) {
      url += `&vendorId=${products.userId}`
    }

    if (products.categoryId.length > 0) {
      products.categoryId.forEach((id) => {
        url += `&categoriesIds=${id}`
      })
    }

    if (products.name !== '') {
      url += `&name=${products.name}`
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
        (category) => category?.id !== id,
      )
      const res = await deleteRequest(`/products/${id}`)

      if (res) {
        // enqueueSnackbar(`Removed success!`);
        toast.success('Removed Succssfully')
        setProducts({
          ...products,
          count: products?.count - 1,
          rows: updatedProducts,
        })
      } else {
        // enqueueSnackbar(`Something went wrong!`, { variant: 'error' });
        toast.error('Something Went Wrong')
      }
    },
    [products, setProducts],
  )

  useEffect(() => {
    fetchProducts()
  }, [
    paginationModel.page,
    paginationModel.pageSize,
    products.vendorId,
    products.categoryId,
    products.name,
  ])

  const columns = [
    {
      field: 'name',
      headerName: 'Product Name',
      flex: 0.2,
      minWidth: 200,
      hideable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          spacing={1}
          sx={{ py: 2, width: 1 }}
        >
          <MyAvatar image={row?.mainImage} name={row?.name?.en} />
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <ListItem
              primaryText={row?.name?.en || row?.name}
              secondaryText={row?.name?.ar || ''}
            />
          </Box>
        </Stack>
      ),
    },

    {
      field: 'category',
      headerName: 'Categories',
      flex: 0.2,
      minWidth: 100,
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
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            justifyContent: { xs: 'flex-start', sm: 'flex-start' },
            textAlign: 'left',
            maxWidth: { xs: 120, sm: '100%' }, // ⬅️ control max width
            overflow: 'hidden',
          }}
        >
          {row?.categories?.map((category) => (
            <Label
              key={category?.id}
              variant="soft"
              size="small"
              color="info"
              sx={{
                fontSize: { xs: 10, sm: 12 },
                px: 1,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
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
      renderCell: ({ row }) =>
        row?.discountedPrice ? (
          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={0.8}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: 'green', fontSize: { xs: '14px', sm: '15px' } }}
            >
              {row?.discountedPrice}
            </Typography>
            <Typography
              sx={{
                textDecoration: 'line-through',
                fontSize: { xs: '11px', sm: '12px' },
              }}
            >
              {row?.price}
            </Typography>
          </Box>
        ) : (
          <Typography
            variant="subtitle2"
            sx={{ fontSize: { xs: '13px', sm: '15px' } }}
          >
            {row.price}
          </Typography>
        ),
    },

    {
      field: 'approved',
      headerName: 'is Approved?',
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
      minWidth: 150,
      headerName: 'Actions',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="View Details" placement="top" arrow>
            <IconButton
              color="success"
              size="small"
              component="a"
              href={`/dashboard/vendor/products/${row?.id}/details`}
            >
              <Visibility />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit" placement="top" arrow>
            <IconButton
              color="info"
              size="small"
              component="a"
              href={`/dashboard/vendor/products/${row?.id}/edit`}
            >
              <Edit />
            </IconButton>
          </Tooltip>

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
            { name: 'Products', path: '/dashboard/vendor/products' },
          ]}
          action={
            <Button
              // component={RouterLink}
              // href={paths.dashboard.shop.new}
              onClick={() => router.push('/dashboard/vendor/products/create')}
              variant="outlined"
              startIcon={<Icon>add</Icon>}
            >
              Add a new Product
            </Button>
          }
        />
      </Box>
      <SimpleCard>
        <FormControl
          style={{ minWidth: 300, marginBottom: 20, marginRight: 20 }}
        >
          <SearchField
            setSearch={setProductsName}
            label={'Search Products'}
            placeholder={'Ex. app'}
          />
        </FormControl>

        <FormControl
          style={{ minWidth: 300, marginBottom: 20, marginRight: 20 }}
        >
          <SelectBox
            id="categoryId"
            label="Select Category"
            menuProp={{
              PaperProps: {
                style: {
                  maxHeight: 200, // Set your desired max height
                  overflowY: 'auto', // Enable vertical scrolling
                },
              },
            }}
            value={products?.categoryId}
            setState={setProductsCategory}
            data={categories?.rows}
          />
        </FormControl>
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
