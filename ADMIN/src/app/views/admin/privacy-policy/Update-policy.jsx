import { Box, Icon, styled } from '@mui/material'
import { Breadcrumb } from 'app/components'

import { useDataContext } from 'app/contexts/DataContext'

import CommonButton from 'app/components/common-button'
import { useRouter } from 'app/hooks/useRouter'
import PrivacyPolicyForm from './privacy-policy-form'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))
export default function UpdatePolicy() {
  const { config } = useDataContext()
  const router = useRouter()
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Privacy Policy', path: '/dashboard/admin/privacy-policy' },
            { name: 'Update' },
          ]}
        />
      </Box>
      <PrivacyPolicyForm currentSetting={config} />
    </Container>
  )
}
