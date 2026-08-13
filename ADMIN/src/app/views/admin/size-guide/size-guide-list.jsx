import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'

const SizeGuideList = ({ sizeGuide, onEdit }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <IconButton color="info" size="small" onClick={() => onEdit(sizeGuide)}>
          <EditIcon />
        </IconButton>
      </Box>
      {sizeGuide.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No records found
          </Typography>
        </Box>
      ) : (
        sizeGuide.map((size, sizeIndex) => (
          <Card key={sizeIndex} sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Size
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong> (EN):</strong> {size.sizeName.en}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong> (AR):</strong> {size.sizeName.ar}
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Body Parts</Typography>
                {size.bodyParts.map((part, partIndex) => (
                  <Box
                    key={partIndex}
                    sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: '#f5f5f5' }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body1">
                          <strong>(EN):</strong> {part.name.en}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body1">
                          <strong>(AR):</strong> {part.name.ar}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body1">
                          <strong>Measurement:</strong> {part.measurements}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  )
}

export default SizeGuideList
