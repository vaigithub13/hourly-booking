import { Box, Button, Icon, Stack, styled } from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'
import MyAvatar from 'app/components/common-avatar/avatar'
import CommonButton from 'app/components/common-button'
import { ConfirmDialog } from 'app/components/custom-dialog'
import MyDataTable from 'app/components/DataTable/MyDataTable'
import ListItem from 'app/components/listitemtext/ListItem'
import { useDataContext } from 'app/contexts/DataContext'
import { useBoolean } from 'app/hooks/useBoolean'
import { useRouter } from 'app/hooks/useRouter'
import { deleteRequest } from 'app/utils/request'
import { useCallback, useState } from 'react'
import AddCategories from './CategoriesModal/AddCategories'
import { toast } from 'react-toastify'
import CategoriesTable from './Table/CategoriesTable'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

export default function Categories() {
  const { categories, setCategories } = useDataContext()
  const [rowId, setRowId] = useState(0)
  const [categoryData, setCategoryData] = useState(null)
  const confirm = useBoolean()
  const delDialoge = useBoolean()

  const handleCategoryUpdate = useCallback(
    (data) => {
      setCategoryData(data)
      confirm.onTrue()
    },
    [confirm, categoryData, setCategoryData],
  )

  // const [paginationModel, setPaginationModel] = useState({
  //   page: categories?.page - 1 || 0,
  //   pageSize: categories?.limit || 20,
  // })

  //   const handlePaginationChanges = useCallback(
  //     (newModel) => {
  //       setPaginationModel(newModel)
  //       if (newModel?.pageSize) {
  //         setCategoriesLimit(newModel?.pageSize)
  //       }
  //       if (newModel?.page > 0 || newModel?.page === 0) {
  //         setCategoriesPage(newModel?.page + 1)
  //       }
  //     },
  //     [
  //       paginationModel,
  //       setPaginationModel,
  //       categories,
  //       setCategoriesLimit,
  //       setCategoriesPage,
  //     ],
  //   )

  const handleDeleteRow = useCallback(
    async (id) => {
      // console.log(typeof id);
      const updatedCategories = categories?.rows?.filter(
        (category) => category?.id !== id,
      )
      const res = await deleteRequest(`/categories/${id}`)

      if (res) {
        // enqueueSnackbar(`Removed success!`);
        toast.success('Removed Succssfully')
        setCategories({
          ...categories,
          count: categories?.count - 1,
          rows: updatedCategories,
        })
      } else {
        // enqueueSnackbar(`Something went wrong!`, { variant: 'error' });
        toast.error('Something Went Wrong')
      }
    },
    [categories, setCategories],
  )

  const columns = [
    {
      field: 'name',
      headerName: 'Category Name',
      flex: 0.3,
      minWidth: 200,
      hideable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <ListItem primaryText={row?.name?.en} secondaryText={row?.name?.ar} />
        </Stack>
      ),
    },

    {
      field: 'image',
      headerName: 'Image',
      flex: 0.3,
      minWidth: 200,
      hideable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <MyAvatar image={row?.image} name={row?.name} />
        </Stack>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CommonButton
            title={'Edit'}
            color={'info'}
            onClick={() => handleCategoryUpdate(row)}
          />
          <CommonButton
            title={'Delete'}
            color={'error'}
            onClick={() => {
              delDialoge.onTrue()
              setRowId(row?.id)
            }}
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
            { name: 'Categories', path: '/dashboard/categories' },
          ]}
          action={
            <Button
              // component={RouterLink}
              // href={paths.dashboard.shop.new}
              onClick={() => confirm.onTrue()}
              variant="outlined"
              startIcon={<Icon>add</Icon>}
            >
              Add Category
            </Button>
          }
        />
      </Box>
      <SimpleCard>
        {/* <MyDataTable
          rows={categories?.rows}
          rowCount={categories?.count}
          loading={categories?.loading}
          columns={columns}
          // paginationModel={paginationModel}
          // onPaginationModelChange={handlePaginationChanges}
        /> */}

        <CategoriesTable onEdit={handleCategoryUpdate} />
      </SimpleCard>
      <ConfirmDialog
        open={delDialoge.value}
        onClose={delDialoge.onFalse}
        title="Delete"
        content={<>Are you sure want to delete?</>}
        action={
          <CommonButton
            variant="contained"
            color="error"
            title={'Delete'}
            onClick={() => {
              handleDeleteRow(rowId)
              delDialoge.onFalse()
            }}
          />
        }
      />
      <AddCategories
        currentCategory={categoryData}
        open={confirm.value}
        onClose={() => {
          setCategoryData(null)
          confirm.onFalse()
        }}
      />
    </Container>
  )
}
