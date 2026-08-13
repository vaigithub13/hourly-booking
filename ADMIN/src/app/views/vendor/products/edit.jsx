import { Box, styled } from '@mui/material'
import { Breadcrumb, MatxLoading } from 'app/components'
import CreateProduct from 'app/components/product/CreateProduct'
import { useBoolean } from 'app/hooks/useBoolean'
import { useParams } from 'app/hooks/useParams'
import { getRequest } from 'app/utils/request'
import { useEffect, useState } from 'react'

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
  const params = useParams()
  const loading = useBoolean()
  const [currentProduct, setCurrentProduct] = useState(null)
  const { id } = params

  const fetchCurrentProduct = async () => {
    loading.onTrue()
    const res = await getRequest(`/products/for-admin/${id}`)
    if (res) {
      setCurrentProduct(res?.data)
    }
    loading.onFalse()
  }

  useEffect(() => {
    if (id) {
      fetchCurrentProduct()
    }
  }, [id])

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'products', path: '/dashboard/vendor/products' },
            { name: `edit` },
          ]}
        />
      </Box>
      {loading.value ? (
        <MatxLoading />
      ) : (
        <CreateProduct currentProduct={currentProduct} />
      )}
    </Container>
  )
}
