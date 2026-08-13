import { Box, Icon, styled } from '@mui/material'
import { Breadcrumb } from 'app/components'
import BannersNewEditForm from './banners-new-edit-form'
import { useDataContext } from 'app/contexts/DataContext'
import { useParams } from 'app/hooks/useParams'
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
export default function EditBanner() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const { banners } = useDataContext()
  const currentBanner =
    banners?.rows?.length > 0 &&
    banners?.rows?.find((banner) => banner.id === Number(id))
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Banners', path: '/dashboard/admin/banners' },
            { name: 'Create' },
          ]}
          // action={
          //   <CommonButton
          //     // component={RouterLink}
          //     // href={paths.dashboard.shop.new}
          //     title={'Go Back'}
          //     size={'sm'}
          //     onClick={() => router.push('/dashboard/banners')}
          //     variant="outlined"
          //     startIcon={<Icon>arrow_back</Icon>}
          //   />
          // }
        />
      </Box>
      <BannersNewEditForm currentBanner={currentBanner} />
    </Container>
  )
}
