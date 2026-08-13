import {
  Box,
  Icon,
  Table,
  styled,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Tooltip,
  ListItemText,
  Button,
} from '@mui/material'
import MyAvatar from 'app/components/common-avatar'
import CommonButton from 'app/components/common-button'
import { ConfirmDialog } from 'app/components/custom-dialog'
import Label from 'app/components/label'
import ListItem from 'app/components/listitemtext'
import { useDataContext } from 'app/contexts/DataContext'
import { useBoolean } from 'app/hooks/useBoolean'
import { useRouter } from 'app/hooks/useRouter'
import { deleteRequest, putRequest } from 'app/utils/request'
import { useState } from 'react'
import { useCallback } from 'react'
import { toast } from 'react-toastify'

// STYLED COMPONENT
const StyledTable = styled(Table)(({ theme }) => ({
  whiteSpace: 'pre',
  '& thead': {
    '& tr': {
      '& th': {
        paddingLeft: 10,
        background: 'rgba(191, 167, 93, 0.8)',
        color: 'white',
      },
    },
  },
  '& tbody': {
    '& tr': { '& td': { paddingLeft: 10, textTransform: 'capitalize' } },
  },
}))

export default function CategoriesTable({ onEdit }) {
  const { categories, setCategories } = useDataContext()
  const [rowId, setRowId] = useState(0)
  const confirm = useBoolean()

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
  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <StyledTable sx={{ minWidth: 700 }}>
        <TableHead>
          <TableRow>
            <TableCell>Category Name</TableCell>
            <TableCell>Image</TableCell>
            <TableCell>Length Required?</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {categories?.rows?.map((row, index) => (
            <TableRow key={index}>
              {/* Category Name */}
              <TableCell sx={{ minWidth: 180 }}>
                <ListItem
                  primaryText={row?.name?.en}
                  secondaryText={row?.name?.ar}
                />
              </TableCell>

              {/* Image */}
              <TableCell sx={{ minWidth: 100 }}>
                <MyAvatar image={row?.image} name={row?.name} />
              </TableCell>

              {/* Length Required */}
              <TableCell sx={{ minWidth: 150 }}>
                <Label
                  variant="soft"
                  color={row?.isRequiredLength ? 'success' : 'warning'}
                >
                  {row?.isRequiredLength ? 'Yes' : 'No'}
                </Label>
              </TableCell>

              {/* Action Buttons */}
              <TableCell
                sx={{
                  minWidth: 200,
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  }}
                >
                  <CommonButton
                    title="Edit"
                    color="info"
                    size="small"
                    onClick={() => onEdit(row)}
                  />
                  <CommonButton
                    title="Delete"
                    color="error"
                    size="small"
                    onClick={() => {
                      confirm.onTrue()
                      setRowId(row?.id)
                    }}
                  />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={<>Are you sure want to delete?</>}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRow(rowId)
              confirm.onFalse()
            }}
          >
            Delete
          </Button>
        }
      />
    </Box>
  )
}
