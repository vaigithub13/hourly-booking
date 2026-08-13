import { Box, Button, Icon, Stack, styled } from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'

import { useRouter } from 'app/hooks/useRouter'
import { useBoolean } from 'app/hooks/useBoolean'
import AttributesTable from './AttributesTable/Table'
import AddAttribute from './Modal/AddAttribute'
import { useState } from 'react'
import { useCallback } from 'react'
import { useDataContext } from 'app/contexts/DataContext'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

export default function Attributes() {
  const [currentAttribute, setCurrentAttribute] = useState(null)
  const { attributes, setAttributesType } = useDataContext()
  const router = useRouter()
  const confirm = useBoolean()

  const types = ['All', 'size', 'color', 'length']

  const onEdit = useCallback(
    (data) => {
      confirm.onTrue()
      setCurrentAttribute(data)
    },
    [currentAttribute, confirm],
  )

  const handleClick = (type) => {
    setAttributesType(type === 'All' ? '' : type)
  }

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Attributes', path: '/dashboard/admin/attributes' },
          ]}
          action={
            <Button
              // component={RouterLink}
              // href={paths.dashboard.shop.new}
              onClick={() => confirm.onTrue()}
              variant="outlined"
              startIcon={<Icon>add</Icon>}
            >
              Add Attributes
            </Button>
          }
        />
      </Box>

      <SimpleCard>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          {types.map((type) => (
            <Button
              key={type}
              variant={
                attributes.type === (type === 'All' ? '' : type)
                  ? 'contained'
                  : 'outlined'
              }
              color="primary"
              onClick={() => handleClick(type)}
            >
              {type}
            </Button>
          ))}
        </Stack>
        <AttributesTable onEdit={onEdit} />
      </SimpleCard>
      <AddAttribute
        currentAttributes={currentAttribute}
        open={confirm.value}
        onClose={() => {
          confirm.onFalse()
          setCurrentAttribute(null)
        }}
      />
    </Container>
  )
}
