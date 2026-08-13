import { Box, styled } from '@mui/material'
import { Breadcrumb } from 'app/components'
import CreateProduct from 'app/components/product/CreateProduct'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

export default function Create() {
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'products', path: '/dashboard/admin/products' },
            { name: `create` },
          ]}
        />
      </Box>
      <CreateProduct />
    </Container>
  )
}
