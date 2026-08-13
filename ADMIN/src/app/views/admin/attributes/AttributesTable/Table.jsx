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

export default function AttributesTable({ onEdit }) {
  const [rowId, setRowId] = useState(0)
  const { attributes, setAttributes } = useDataContext()
  const confirm = useBoolean()
  const router = useRouter()

  //delete attribute
  const handleDeleteRow = useCallback(
    async (id) => {
      // console.log(typeof id);
      const updatedAttributes = attributes?.rows?.filter(
        (att) => att?.id !== id,
      )
      const res = await deleteRequest(`/custom_attributes/${id}`)

      if (res) {
        // enqueueSnackbar(`Removed success!`);
        toast.success('Removed Succssfully')
        setAttributes({
          ...attributes,
          count: attributes?.count - 1,
          rows: updatedAttributes,
        })
      }
    },
    [attributes, setAttributes],
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
              Name
            </TableCell>
            <TableCell width="50%" align="center" sx={fontStyle}>
              Type
            </TableCell>
            <TableCell width="20%" align="center" sx={fontStyle}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {attributes?.rows?.map((attribute, index) => (
            <TableRow key={index}>
              <TableCell align="left">
                <ListItemText
                  primary={attribute?.name?.en}
                  secondary={
                    attribute?.type !== 'length' && attribute?.name?.ar
                  }
                  primaryTypographyProps={{ typography: 'body2' }}
                  secondaryTypographyProps={{
                    typography: 'subtitle2',
                  }}
                  sx={{
                    ...wrappingStyle,
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                  }}
                />
              </TableCell>
              <TableCell align="center">
                <Typography>{attribute?.type}</Typography>
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
                    onClick={() => onEdit(attribute)}
                  />
                  <CommonButton
                    title={'Delete'}
                    color={'error'}
                    onClick={() => {
                      confirm.onTrue()
                      setRowId(attribute?.id)
                    }}
                  />
                </Box>
              </TableCell>
            </TableRow>
          ))}
          <TableNoData notFound={!attributes?.rows?.length} />
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
