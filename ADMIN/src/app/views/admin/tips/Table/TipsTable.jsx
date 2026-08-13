import React from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  styled,
} from '@mui/material'
import { TableNoData } from 'app/components/table'
import ListItem from 'app/components/listitemtext'

const StyledTable = styled(Table)(({ theme }) => ({
  whiteSpace: 'pre',
  '& thead': {
    '& tr': {
      '& th': {
        paddingLeft: 8,
        background: 'rgba(191, 167, 93, 0.8)',
        color: 'black',
      },
    },
  },
  '& tbody': {
    '& tr': { '& td': { paddingLeft: 10, textTransform: 'capitalize' } },
  },
}))

const labelsMap = {
  fabricCare: {
    en: ['Ironing/Steaming', 'Important Tips'],
    ar: ['الكي / البخار', 'نصائح مهمة'],
  },
  washingMethods: {
    en: ['Description', 'Best For'],
    ar: ['الوصف', 'الأفضل لـ'],
  },
}

const TipsTable = ({ data = [], title, section }) => {
  const labels = labelsMap[section] || { en: [], ar: [] }

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      {/* Enable horizontal scroll on mobile */}
      <Box sx={{ overflowX: 'auto' }}>
        <TableContainer component={Paper} sx={{ minWidth: 700 }}>
          <StyledTable>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: { xs: '150px', md: '25%' } }}>
                  <strong>
                    {section === 'fabricCare' ? 'Type' : 'Washing Method'}
                  </strong>
                </TableCell>
                <TableCell sx={{ width: { xs: '250px', md: '37.5%' } }}>
                  <strong>{labels.en[0]}</strong>
                </TableCell>
                <TableCell sx={{ width: { xs: '250px', md: '37.5%' } }}>
                  <strong>{labels.en[1]}</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data?.length > 0 ? (
                data.map((item, idx) => {
                  const [tip1, tip2] = item.values

                  return (
                    <TableRow key={idx}>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <ListItem
                          primaryText={item.key.en}
                          secondaryText={item.key.ar}
                        />
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <ListItem
                          primaryText={tip1?.en || '-'}
                          secondaryText={tip1?.ar || '-'}
                          primaryWidth="100%"
                          secondaryWidth="100%"
                        />
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <ListItem
                          primaryText={tip2?.en || '-'}
                          secondaryText={tip2?.ar || '-'}
                          primaryWidth="100%"
                          secondaryWidth="100%"
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableNoData notFound={data?.length > 0} span={3} />
              )}
            </TableBody>
          </StyledTable>
        </TableContainer>
      </Box>
    </Box>
  )
}

export default TipsTable
