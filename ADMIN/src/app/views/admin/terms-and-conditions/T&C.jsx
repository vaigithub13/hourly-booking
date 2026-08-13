import { Box, Button, Icon, styled } from '@mui/material'
import { Breadcrumb } from 'app/components'

import { useDataContext } from 'app/contexts/DataContext'
import TermsAndConditionsCard from './Card'
import { useRouter } from 'app/hooks/useRouter'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))
export default function TermsAndConditions() {
  const { config } = useDataContext()
  const router = useRouter()
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            {
              name: 'terms & conditions',
              path: '/dashboard/admin/terms-and-conditions/',
            },
          ]}
          action={
            <Button
              // component={RouterLink}
              // href={paths.dashboard.shop.new}
              onClick={() =>
                router.push('/dashboard/admin/terms-and-conditions/edit')
              }
              variant="outlined"
              startIcon={<Icon>edit</Icon>}
            >
              Edit
            </Button>
          }
        />
      </Box>
      <TermsAndConditionsCard termsAndConditions={config?.termsAndConditions} />
    </Container>
  )
}
