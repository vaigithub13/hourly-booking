import { Box, styled } from '@mui/material'
import { Breadcrumb } from 'app/components'
import CreateProduct from 'app/components/product/CreateProduct'
import DeliveryEditForm from './delivery-edit-form'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

export default function AddLocation() {
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Delivery', path: '/dashboard/admin/delivery' },
            { name: `create` },
          ]}
        />
      </Box>
      <DeliveryEditForm currentLocation={null} />
    </Container>
  )
}
