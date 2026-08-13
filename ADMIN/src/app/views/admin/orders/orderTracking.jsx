import { Box, Grid, Icon, Stack, styled } from '@mui/material'
import { Breadcrumb } from 'app/components'
import { useParams } from 'app/hooks/useParams'
import { useState } from 'react'
import { getRequest } from 'app/utils/request'
import { useEffect } from 'react'
import { useRouter } from 'app/hooks/useRouter'
import CommonButton from 'app/components/common-button'
// import OrderStepper from 'app/components/stepper/Stepper'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))
export default function OrderTracking() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const [isLoading, setIsLoading] = useState(false)
  const [tracking, setTracking] = useState(null)

  const fetchCurrentOrder = async () => {
    setIsLoading(true)
    const res = await getRequest(`/order/track/${Number(id)}`, router)
    if (res?.statusCode === 200) {
      setTracking(res?.data?.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (id) {
      fetchCurrentOrder()
    }
  }, [id])

  // const currentOrder = orders?.rows?.find((order) => order?.id === Number(id))
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Orders', path: '/dashboard/orders' },
            { name: 'Tracking' },
          ]}
          action={
            <CommonButton
              // component={RouterLink}
              // href={paths.dashboard.shop.new}
              title={'Go Back'}
              size={'sm'}
              onClick={() => router.back()}
              variant="outlined"
              startIcon={<Icon>arrow_back</Icon>}
            />
          }
        />
      </Box>
      <iframe
        srcDoc={tracking}
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
        }}
        title="HTML Content"
      />
    </Container>
  )
}
