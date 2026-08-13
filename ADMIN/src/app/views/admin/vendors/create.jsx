import { Box, styled } from '@mui/material'
import { Breadcrumb } from 'app/components'
import CreateVendor from 'app/components/profile/CreateVendor'

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
            { name: 'Desginers', path: '/dashboard/admin/vendors' },
            { name: `create` },
          ]}
        />
      </Box>
      <CreateVendor currentVendor={null} isAdmin={true} />
    </Container>
  )
}
