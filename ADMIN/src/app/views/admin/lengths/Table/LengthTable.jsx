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
  Typography,
} from '@mui/material'
import CommonButton from 'app/components/common-button'
import { ConfirmDialog } from 'app/components/custom-dialog'
import Label from 'app/components/label'
import { TableNoData } from 'app/components/table'
import { useDataContext } from 'app/contexts/DataContext'
import { useBoolean } from 'app/hooks/useBoolean'
import { useRouter } from 'app/hooks/useRouter'
import { deleteRequest } from 'app/utils/request'
// import { deleteRequest, putRequest } from 'app/utils/request'
import { useState } from 'react'
import { useCallback } from 'react'
import { toast } from 'react-toastify'
// import { toast } from 'react-toastify'

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

export default function LengthsTable({ onEdit }) {
  const { lengths, setLengths } = useDataContext()
  const [rowId, setRowId] = useState(0)
  const confirm = useBoolean()
  const router = useRouter()

  //delete banner
  const handleDeleteRow = useCallback(
    async (id) => {
      // console.log(typeof id);
      const updatedLengths = lengths?.filter((len) => len?.id !== id)
      const res = await deleteRequest(`/products-lengths/${id}`)

      if (res) {
        // enqueueSnackbar(`Removed success!`);
        toast.success('Removed Succssfully')
        setLengths(updatedLengths)
      }
    },
    [lengths, setLengths],
  )

  const wrappingStyle = {
    whiteSpace: 'pre-wrap', // Preserves whitespace and allows text to wrap
    wordWrap: 'break-word', // Allows breaking words
    wordBreak: 'break-word', // Forces the word to break at the end of the line
  }

  const fontStyle = {
    fontWeight: 'bold',
  }
  return (
    <Box width="100%" overflow="auto">
      <StyledTable>
        <TableHead>
          <TableRow>
            <TableCell width="30%" align="left" sx={fontStyle}>
              Length
            </TableCell>
            <TableCell width="50%" align="center" sx={fontStyle}>
              Available
            </TableCell>
            <TableCell width="20%" align="center" sx={fontStyle}>
              Action
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {lengths?.map((length, index) => (
            <TableRow key={index}>
              <TableCell>
                <Typography variant="subtitle2">{length?.length}</Typography>
              </TableCell>
              <TableCell align="center">
                <Label
                  variant="soft"
                  color={length?.available ? 'success' : 'error'}
                >
                  {length?.available ? 'true' : 'false'}
                </Label>
              </TableCell>

              <TableCell align="center">
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  <CommonButton
                    title={'Edit'}
                    color={'info'}
                    onClick={() => onEdit(length)}
                  />
                  <CommonButton
                    title={'Delete'}
                    color={'error'}
                    onClick={() => {
                      confirm.onTrue()
                      setRowId(length?.id)
                    }}
                  />
                </Box>
              </TableCell>
            </TableRow>
          ))}
          <TableNoData notFound={!lengths?.length} />
        </TableBody>
      </StyledTable>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={<>Are you sure want to delete?</>}
        action={
          <CommonButton
            title="Delete"
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRow(rowId)
              confirm.onFalse()
            }}
          />
        }
      />
    </Box>
  )
}
