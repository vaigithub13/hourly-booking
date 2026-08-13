import { Box, Button, Icon, styled } from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'
import { useDataContext } from 'app/contexts/DataContext'
import { useBoolean } from 'app/hooks/useBoolean'
import { useRouter } from 'app/hooks/useRouter'
import BannersTable from './bannersTable/bannersTable'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

export default function Banners() {
  const router = useRouter()

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Banners', path: '/dashboard/admin/banners' },
          ]}
          action={
            <Button
              // component={RouterLink}
              // href={paths.dashboard.shop.new}
              onClick={() => router.push('/dashboard/admin/banners/create')}
              variant="outlined"
              startIcon={<Icon>add</Icon>}
            >
              Add Banner
            </Button>
          }
        />
      </Box>
      <SimpleCard>
        <BannersTable />
      </SimpleCard>
    </Container>
  )
}
