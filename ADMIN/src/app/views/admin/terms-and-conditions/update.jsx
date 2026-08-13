import { Box, Icon, styled } from '@mui/material'
import { Breadcrumb } from 'app/components'

import { useDataContext } from 'app/contexts/DataContext'
import TermsConditionsForm from './form'
import CommonButton from 'app/components/common-button'
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
export default function Update() {
  const { config } = useDataContext()
  const router = useRouter()
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            {
              name: 'terms & conditions',
              path: '/dashboard/admin/terms-and-conditions',
            },
            { name: 'Update' },
          ]}
          action={
            <CommonButton
              // component={RouterLink}
              // href={paths.dashboard.shop.new}
              title={'Go Back'}
              size={'sm'}
              onClick={() =>
                router.push('/dashboard/admin/terms-and-conditions')
              }
              variant="outlined"
              startIcon={<Icon>arrow_back</Icon>}
            />
          }
        />
      </Box>
      <TermsConditionsForm currentSetting={config} />
    </Container>
  )
}
