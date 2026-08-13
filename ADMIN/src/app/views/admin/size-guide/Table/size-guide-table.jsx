import React, { useState } from 'react'
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  styled,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CommonButton from 'app/components/common-button'

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

const SizeGuideTable = ({ sizeGuide, onEdit }) => {
  const [expanded, setExpanded] = useState(null)

  const handleExpandClick = (index) => {
    setExpanded(expanded === index ? null : index)
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <CommonButton
          title={sizeGuide?.sizeGuide?.length > 0 ? 'Edit' : 'Add'}
          color={'info'}
          variant={'outlined'}
          onClick={() => onEdit(sizeGuide)}
        />
      </Box>

      {sizeGuide?.sizeGuide?.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No records found
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <StyledTable>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Size (EN)</strong>
                </TableCell>
                <TableCell>
                  <strong>Size (AR)</strong>
                </TableCell>
                <TableCell>
                  <strong>Body Parts</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sizeGuide?.sizeGuide?.map((size, sizeIndex) => (
                <React.Fragment key={sizeIndex}>
                  {/* Main Size Row */}
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {size.sizeName.en}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {size.sizeName.ar}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleExpandClick(sizeIndex)}
                      >
                        <ExpandMoreIcon
                          sx={{
                            transition: 'transform 0.3s',
                            transform:
                              expanded === sizeIndex
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                          }}
                        />
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  {/* Accordion Row for Body Parts */}
                  {expanded === sizeIndex && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Accordion expanded>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Body Parts</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>
                                    <strong>Body Part (EN)</strong>
                                  </TableCell>
                                  <TableCell>
                                    <strong>Body Part (AR)</strong>
                                  </TableCell>
                                  <TableCell>
                                    <strong>Measurement (cm & inch)</strong>
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {size.bodyParts.map((part, partIndex) => (
                                  <TableRow key={partIndex}>
                                    <TableCell>
                                      <Typography variant="subtitle2">
                                        {part.name.en}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="subtitle2">
                                        {part.name.ar}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="subtitle2">
                                        {`CM: ${part?.measurements?.cm} / Inch: ${part?.measurements?.inch}`}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </AccordionDetails>
                        </Accordion>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </StyledTable>
        </TableContainer>
      )}
    </Box>
  )
}

export default SizeGuideTable
