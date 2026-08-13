import { Box, Button, Icon, styled } from '@mui/material'
import { Breadcrumb, MatxLoading, SimpleCard } from 'app/components'
import CreateVendor from 'app/components/profile/CreateVendor'
import { useBoolean } from 'app/hooks/useBoolean'
import { useParams } from 'app/hooks/useParams'
import { getRequest } from 'app/utils/request'
import { useEffect } from 'react'
import { useState } from 'react'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

export default function Edit() {
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

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Designers', path: '/dashboard/admin/vendors' },
            { name: `Edit` },
          ]}
        />
      </Box>
      {loading.value ? (
        <MatxLoading />
      ) : (
        <CreateVendor currentVendor={currentVendor} isAdmin={true} />
      )}
    </Container>
  )
}
