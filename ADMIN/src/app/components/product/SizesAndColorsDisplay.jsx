import {
  Grid,
  Card,
  Typography,
  TableContainer,
  Box,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Paper,
  Divider,
} from '@mui/material'
import { useDataContext } from 'app/contexts/DataContext'

const SizesAndColorsDisplay = ({ sizesAndColors }) => {
  const { attributes, lengths } = useDataContext()
  return (
    <Grid item xs={12}>
      <Card elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Sizes & Colors
        </Typography>
        <Divider sx={{ my: 2 }} />

        {sizesAndColors?.length > 0 ? (
          <TableContainer
            component={Paper}
            sx={{
              p: 2,
              width: '100%',
              overflowX: 'auto',
              '@media (max-width: 600px)': {
                p: 1, // reduce padding on mobile
              },
            }}
          >
            <Box sx={{ minWidth: 600 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      Color / اللون
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      Size / المقاس
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      Length / الطول
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      Quantity / الكمية
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sizesAndColors?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {typeof item?.colorId === 'number'
                          ? (() => {
                              const color = attributes?.rows?.find(
                                (att) => att?.id === item?.colorId,
                              )?.name
                              return `${color?.en || 'N/A'} / ${
                                color?.ar || 'N/A'
                              }`
                            })()
                          : `${item?.color?.name?.en || 'N/A'} / ${
                              item?.color?.name?.ar || 'N/A'
                            }`}
                      </TableCell>

                      <TableCell>
                        {typeof item?.sizeId === 'number'
                          ? (() => {
                              const size = attributes?.rows?.find(
                                (att) => att?.id === item?.sizeId,
                              )?.name
                              return `${size?.en || 'N/A'} / ${
                                size?.ar || 'N/A'
                              }`
                            })()
                          : `${item?.size?.name?.en || 'N/A'} / ${
                              item?.size?.name?.ar || 'N/A'
                            }`}
                      </TableCell>

                      <TableCell>
                        {typeof item?.lengthId === 'number'
                          ? (() => {
                              const length = attributes?.rows?.find(
                                (att) => att?.id === item?.lengthId,
                              )?.name
                              return `${length?.en || 'N/A'} `
                            })()
                          : `${item?.length?.name?.en || 'N/A'} 
                            `}
                      </TableCell>

                      <TableCell>{`${item?.amount || 0}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </TableContainer>
        ) : (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ textAlign: 'center', mt: 2 }}
          >
            No sizes and colors available.
          </Typography>
        )}
      </Card>
    </Grid>
  )
}

export default SizesAndColorsDisplay
