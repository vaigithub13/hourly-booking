import { Box, Button, Icon, styled } from '@mui/material'
import { Breadcrumb } from 'app/components'

import { useDataContext } from 'app/contexts/DataContext'
import { useParams } from 'app/hooks/useParams'

import { useRouter } from 'app/hooks/useRouter'
import PrivacyPolicyCard from './privacy-policy-card'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))
export default function PrivacyPolicy() {
  const { config } = useDataContext()
  const router = useRouter()
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            {
              name: 'Privacy Policy',
              path: '/dashboard/admin/privacy-policy/',
            },
          ]}
          action={
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {/* <Button
                variant="text"
                color="primary"
                onClick={() => window.open('/privacy-policy', '_blank')}
              >
                View Policy
              </Button> */}
              <Button
                // component={RouterLink}
                // href={paths.dashboard.shop.new}
                onClick={() =>
                  router.push('/dashboard/admin/privacy-policy/edit')
                }
                variant="outlined"
                startIcon={<Icon>edit</Icon>}
              >
                Edit
              </Button>
            </Box>
          }
        />
      </Box>
      <PrivacyPolicyCard privacyPolicyText={config?.privacyAndPolicy} />
    </Container>
  )
}
