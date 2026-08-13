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
import { ConfirmDialog } from 'app/components/custom-dialog'
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
        paddingRight: 10,
      },
    },
  },
  '& tbody': {
    '& tr': { '& td': { paddingLeft: 10, textTransform: 'capitalize' } },
  },
}))

export default function FaqsTable({ onEdit }) {
  const { faqs, setFaqs } = useDataContext()
  const [rowId, setRowId] = useState(0)
  const confirm = useBoolean()

  //delete banner
  const handleDeleteRow = useCallback(
    async (id) => {
      // console.log(typeof id);
      const updatedFaqs = faqs?.filter((faq) => faq?.id !== id)
      const res = await deleteRequest(`/faqs/${id}`)

      if (res) {
        // enqueueSnackbar(`Removed success!`);
        toast.success('Removed Succssfully')
        setFaqs(updatedFaqs)
      } else {
        // enqueueSnackbar(`Something went wrong!`, { variant: 'error' });
        toast.error('Something went wrong')
      }
    },
    [faqs, setFaqs],
  )
  return (
    <Box width="100%" overflow="auto">
      <StyledTable sx={{ minWidth: 750 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ minWidth: 140 }} align="left">
              Title
            </TableCell>
            <TableCell sx={{ minWidth: 200 }} align="center">
              Question
            </TableCell>
            <TableCell sx={{ minWidth: 200 }} align="center">
              Answer
            </TableCell>
            <TableCell sx={{ minWidth: 120 }} align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {faqs?.map((faq, index) => (
            <TableRow key={index}>
              <TableCell align="left">
                <ListItemText
                  primary={faq?.title?.en}
                  secondary={faq?.title?.ar}
                  primaryTypographyProps={{ typography: 'body2' }}
                  secondaryTypographyProps={{
                    component: 'span',
                    color: 'text.disabled',
                  }}
                  sx={{ display: 'flex', flexDirection: 'column' }}
                />
              </TableCell>
              <TableCell align="center">
                <ListItemText
                  primary={faq?.question?.en}
                  secondary={faq?.question?.ar}
                  primaryTypographyProps={{ typography: 'body2' }}
                  secondaryTypographyProps={{
                    component: 'span',
                    color: 'text.disabled',
                  }}
                  sx={{ display: 'flex', flexDirection: 'column' }}
                />
              </TableCell>
              <TableCell align="center">
                <ListItemText
                  primary={faq?.answer?.en}
                  secondary={faq?.answer?.ar}
                  primaryTypographyProps={{ typography: 'body2' }}
                  secondaryTypographyProps={{
                    component: 'span',
                    color: 'text.disabled',
                  }}
                  sx={{ display: 'flex', flexDirection: 'column' }}
                />
              </TableCell>

              <TableCell align="right">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => onEdit(faq)}
                >
                  <Tooltip title="Edit" placement="top" arrow>
                    <Icon>edit</Icon>
                  </Tooltip>
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => {
                    confirm.onTrue()
                    setRowId(faq?.id)
                  }}
                >
                  <Tooltip title="Delete" placement="top" arrow>
                    <Icon>delete</Icon>
                  </Tooltip>
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
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
