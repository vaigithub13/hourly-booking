import { Box, Button, Icon, styled } from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'
import { useBoolean } from 'app/hooks/useBoolean'
import { useParams } from 'app/hooks/useParams'
import { getRequest } from 'app/utils/request'
import { useEffect } from 'react'
import { useState } from 'react'
import VendorInfo from 'app/components/profile/VendorInfo'
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

export default function Profile() {
  const router = useRouter()
  const [currentVendor, setCurrentVendor] = useState(null)
  const params = useParams()
  const loading = useBoolean()
  const { id } = params

  const fetchCurrentVendor = async () => {
    loading.onTrue()
    const res = await getRequest(`/vendors/${id}`)
    if (res) {
      setCurrentVendor(res?.data)
    }
    loading.onFalse()
  }

  useEffect(() => {
    if (id) {
      fetchCurrentVendor()
    }
  }, [id])

  const onEdit = () => {
    router.push(`/dashboard/vendor/${id}/edit`)
  }

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'profile', path: `/dashboard/vendor/${id}/profile` },
          ]}
        />
      </Box>
      <VendorInfo
        logo={currentVendor?.logo}
        vendorName={currentVendor?.vendorName}
        username={currentVendor?.username}
        ownerName={currentVendor?.ownerName}
        email={currentVendor?.email}
        phoneNumber={currentVendor?.phoneNumber}
        address={currentVendor?.address}
        certificate={currentVendor?.certificate}
        appPercentage={currentVendor?.appPercentage}
        approved={currentVendor?.approved}
        rate={currentVendor?.rate}
        onEdit={onEdit}
        isVendor={true}
        loading={loading.value}
      />
    </Container>
  )
}
