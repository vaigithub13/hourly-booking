import { Box, Button, Icon, styled } from '@mui/material'
import { Breadcrumb } from 'app/components'

import { useDataContext } from 'app/contexts/DataContext'
import SizeGuideList from './size-guide-list'
import { useBoolean } from 'app/hooks/useBoolean'
import { useState } from 'react'
import { useCallback } from 'react'
import AddSizeGuide from './Model/AddSizeGuide'
import SizeGuideTable from './Table/size-guide-table'
import DescriptionCard from './DescriptionCard'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))
export default function SizeGuide() {
  const { sizeGuide } = useDataContext()
  const [currentSizeGuide, setCurrentSizeGuide] = useState([])
  const confirm = useBoolean()

  const onEdit = useCallback(
    (data) => {
      setCurrentSizeGuide(data)
      confirm.onTrue()
    },
    [currentSizeGuide, setCurrentSizeGuide, confirm],
  )
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            {
              name: 'size-guide',
              path: '/dashboard/admin/size-guide/',
            },
          ]}
        />
      </Box>
      {/* <SizeGuideList sizeGuide={sizeGuide} onEdit={onEdit} /> */}

      <SizeGuideTable sizeGuide={sizeGuide} onEdit={onEdit} />

      <DescriptionCard description={sizeGuide?.description} />

      <AddSizeGuide
        open={confirm.value}
        currentSizeGuide={currentSizeGuide}
        onClose={useCallback(() => {
          setCurrentSizeGuide([])
          confirm.onFalse()
        }, [currentSizeGuide, setCurrentSizeGuide, confirm])}
      />
    </Container>
  )
}
