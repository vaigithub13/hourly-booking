import { Box, Grid, Icon, Stack, styled } from '@mui/material'
import { Breadcrumb } from 'app/components'
import { useParams } from 'app/hooks/useParams'
import { useState } from 'react'
import { getRequest, patchRequest } from 'app/utils/request'
import { useEffect } from 'react'
import { useRouter } from 'app/hooks/useRouter'
import CommonButton from 'app/components/common-button'
import { useBoolean } from 'app/hooks/useBoolean'
import ErrorDialog from 'app/components/500-dialog/ErrorDialog'
import OrderDetailsToolbar from 'app/components/order-details-info/order-details-toolbar'
import OrderDetailsInfo from 'app/components/order-details-info/order-details-info'
import OrderDetailsItems from 'app/components/order-details-info/order-details-item'
import { toast } from 'react-toastify'
import { ReturnStatusApi } from 'app/utils/utils'
import OrderStepper from 'app/components/stepper'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))
export default function OrderDetails() {
  const router = useRouter()
  const params = useParams()
  const dialog = useBoolean()
  const { id } = params
  const [isLoading, setIsLoading] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)

  const fetchCurrentOrder = async () => {
    setIsLoading(true)
    const res = await getRequest(`/order/return/${Number(id)}`, router)

    if (res?.statusCode === 200) {
      setCurrentOrder(res?.data)
    } else if (res?.statusCode === 500) {
      dialog.onTrue()
    }
    setIsLoading(false)
  }

  const UpdateOrderStatus = async (newStatus) => {
    const res = await patchRequest(
      `/order/return/${id}/${ReturnStatusApi[newStatus]}`,
      null,
    )
    // console.log(res)
    if (res) {
      let updatedOrder = { ...currentOrder, status: newStatus }
      setCurrentOrder(updatedOrder)
      toast.success('Status Updated Succesfully !!')
    }
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
            { name: 'Returns', path: '/dashboard/vendor/returns' },
            { name: 'Details' },
          ]}
          // action={
          //   <CommonButton
          //     // component={RouterLink}
          //     // href={paths.dashboard.shop.new}
          //     title={'Go Back'}
          //     size={'sm'}
          //     onClick={() => router.back()}
          //     variant="outlined"
          //     startIcon={<Icon>arrow_back</Icon>}
          //   />
          // }
        />
      </Box>
      {dialog.value ? (
        <ErrorDialog
          open={dialog.value}
          onClose={() => {
            dialog.onFalse()
            router.back()
          }}
          onRetry={() => {
            dialog.onFalse()
            fetchCurrentOrder()
          }}
        />
      ) : (
        <>
          <OrderDetailsToolbar
            orderNumber={currentOrder}
            createdAt={currentOrder?.createdAt}
            status={currentOrder?.status}
            isLoading={isLoading}
            isReturn={true}
            UpdateOrderStatus={UpdateOrderStatus}
            setCurrentOrder={setCurrentOrder}
            order={currentOrder}
          />
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Stack
                spacing={3}
                direction={{ xs: 'column-reverse', md: 'column' }}
              >
                <OrderDetailsItems
                  title={'Ordered Items'}
                  items={currentOrder?.order?.items}
                  shipping={currentOrder?.order?.deliveryCost}
                  discount={currentOrder?.order?.totalDiscount}
                  subTotal={
                    currentOrder?.order?.grossTotal -
                    currentOrder?.order?.deliveryCost
                  }
                  totalAmount={currentOrder?.order?.finalPrice}
                  isLoading={isLoading}
                />

                <OrderDetailsItems
                  title={'Returned Items'}
                  items={currentOrder?.items}
                  totalAmount={currentOrder?.totalPrice}
                  isLoading={isLoading}
                />

                {currentOrder?.status !== 'Rejected' && (
                  <OrderStepper
                    currentStatus={currentOrder?.status}
                    isLoading={isLoading}
                    isReturn={true}
                  />
                )}
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <OrderDetailsInfo
                status={currentOrder?.status}
                customer={currentOrder?.user}
                vendor={currentOrder?.vendor}
                vendorReason={currentOrder?.vendorReason}
                reason={currentOrder?.returnReason}
                images={currentOrder?.images}
                adminResponse={currentOrder?.deliveryPaidByVendor}
                isReturn={true}
                shippingAddress={currentOrder?.userAddress}
                payment={{
                  method: currentOrder?.order?.paymentMethod,
                }}
                isLoading={isLoading}
              />
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  )
}
