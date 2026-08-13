import { Box, Button, Icon, styled } from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'
import { useBoolean } from 'app/hooks/useBoolean'
import { useParams } from 'app/hooks/useParams'
import { getRequest } from 'app/utils/request'
import { useEffect } from 'react'
import { useState } from 'react'
import { useRouter } from 'app/hooks/useRouter'
import ProductDetail from './product-details'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

export default function ProductDetails() {
  const router = useRouter()
  const [currentProduct, setCurrentProduct] = useState(null)
  const params = useParams()
  const loading = useBoolean()
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

  const onEdit = () => {
    router.push(`/dashboard/admin/products/${id}/edit`)
  }

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Product', path: '/dashboard/admin/products' },
            { name: `Details` },
          ]}
        />
      </Box>

      <ProductDetail product={currentProduct} loading={!currentProduct} />
      {/* <ProductInfo
        name={currentProduct?.name}
        description={currentProduct?.description}
        mainImage={currentProduct?.mainImage}
        price={currentProduct?.price}
        serial={currentProduct?.serial}
        categoriesIds={currentProduct?.categories}
        discountPrice={currentProduct?.discountedPrice}
        vendor={currentProduct?.vendor}
        sizesAndColors={currentProduct?.skus}
        images={currentProduct?.images}
        delivery={currentProduct?.etaDays}
        onEdit={onEdit}
        loading={loading.value}
        isEdit={true}
      /> */}
    </Container>
  )
}
