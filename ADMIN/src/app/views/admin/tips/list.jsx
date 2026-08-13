import { Box, Button, Icon, styled } from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'

import { useDataContext } from 'app/contexts/DataContext'
import { useBoolean } from 'app/hooks/useBoolean'
import { useState } from 'react'
import { useCallback } from 'react'
import AddTips from './Model/AddTipsMode'
import TipsTable from './Table/TipsTable'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))
export default function Tips() {
  const { tips } = useDataContext()

  const confirm = useBoolean()

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            {
              name: 'tips',
              path: '/dashboard/admin/tips/',
            },
          ]}
          action={
            <Button
              // component={RouterLink}
              // href={paths.dashboard.shop.new}
              onClick={() => confirm.onTrue()}
              variant="outlined"
              startIcon={<Icon>edit</Icon>}
            >
              Edit Tips
            </Button>
          }
        />
      </Box>
      <SimpleCard>
        <TipsTable
          data={tips?.washingMethods}
          section="washingMethods"
          title="Washing Methods"
        />

        <TipsTable
          data={tips?.fabricCare}
          section="fabricCare"
          title="Fabric Care"
        />
      </SimpleCard>
      <AddTips
        currentTips={tips}
        open={confirm.value}
        onClose={() => confirm.onFalse()}
      />
    </Container>
  )
}
