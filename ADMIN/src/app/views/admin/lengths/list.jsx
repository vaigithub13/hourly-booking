import { Box, Button, Icon, styled } from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'

import { useRouter } from 'app/hooks/useRouter'
import { useBoolean } from 'app/hooks/useBoolean'
import LengthsTable from './Table/LengthTable'
import AddLengths from './Table/AddLength'
import { useDataContext } from 'app/contexts/DataContext'
import { useState } from 'react'
import { useCallback } from 'react'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

export default function Lengths() {
  const { lengths } = useDataContext()
  const router = useRouter()
  const confirm = useBoolean()

  const [currentLength, setCurrentLength] = useState(null)

  const handleEdit = (data) => {
    setCurrentLength(data)
    confirm.onTrue()
  }

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Lengths', path: '/dashboard/admin/lengths' },
          ]}
          action={
            <Button
              // component={RouterLink}
              // href={paths.dashboard.shop.new}
              onClick={() => confirm.onTrue()}
              variant="outlined"
              startIcon={<Icon>add</Icon>}
            >
              Add Length
            </Button>
          }
        />
      </Box>
      <SimpleCard>
        <LengthsTable onEdit={handleEdit} />
      </SimpleCard>

      <AddLengths
        open={confirm.value}
        currentLength={currentLength}
        onClose={useCallback(() => {
          confirm.onFalse()
          setCurrentLength(null)
        }, [currentLength, setCurrentLength, confirm])}
      />
    </Container>
  )
}
