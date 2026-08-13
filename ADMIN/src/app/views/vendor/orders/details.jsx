import { Box, Grid, Icon, Stack, styled } from "@mui/material";
import { Breadcrumb } from "app/components";
import { useParams } from "app/hooks/useParams";
import { useState } from "react";
import { getRequest, patchRequest, postRequest } from "app/utils/request";
import { useEffect } from "react";
import { useRouter } from "app/hooks/useRouter";
import CommonButton from "app/components/common-button";
import { useBoolean } from "app/hooks/useBoolean";
import ErrorDialog from "app/components/500-dialog/ErrorDialog";
import OrderDetailsToolbar from "app/components/order-details-info/order-details-toolbar";
import OrderDetailsInfo from "app/components/order-details-info/order-details-info";
import OrderDetailsItems from "app/components/order-details-info/order-details-item";
import { toast } from "react-toastify";
import OrderStepper from "app/components/stepper";

// STYLED COMPONENT
const Container = styled("div")(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down("sm")]: { margin: 16 },
  "& .breadcrumb": {
    marginBottom: 30,
    [theme.breakpoints.down("sm")]: { marginBottom: 16 }
  }
}));
export default function OrderDetails() {
  const router = useRouter();
  const params = useParams();
  const dialog = useBoolean();
  const { id } = params;
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [tracking, setTracking] = useState([]);

  const fetchCurrentOrder = async () => {
    setIsLoading(true);
    const res = await getRequest(`/order/${Number(id)}`, router);
    const resTrack = await postRequest(`/order-trackings/by-order/${Number(id)}`, router);
    if (res?.statusCode === 200) {
      setCurrentOrder(res?.data);
      setTracking(resTrack ? resTrack?.data : []);
    } else if (res?.statusCode === 500) {
      dialog.onTrue();
    }
    setIsLoading(false);
  };

  const UpdateOrderStatus = async (newStatus) => {
    const res = await patchRequest(`/order/change-order-status/${id}`, {
      newStatus
    });
    if (res) {
      let updatedOrder = {
        ...currentOrder,
        status: newStatus,
        deliveryId: res?.data?.deliveryId
      };
      setCurrentOrder(updatedOrder);
      toast.success("Status Updated Succesfully !!");
    }
  };
  const UpdateOrderStatusBackToConfirmed = async (newStatus) => {
    const res = await patchRequest(`/order/revert-pickup-status/${id}`, null);
    // console.log(res)
    if (res) {
      let updatedOrder = { ...currentOrder, status: newStatus };
      setCurrentOrder(updatedOrder);
      toast.success("Status Updated Succesfully !!");
    }
  };

  const CancelOrderStatus = async () => {
    const res = await postRequest(`/order/cancel-order-by-admin/${id}`);
    if (res) {
      let updatedOrder = {
        ...currentOrder,
        status: "Cancelled"
      };
      setCurrentOrder(updatedOrder);
      toast.success("Status Updated Succesfully !!");
    }
  };

  useEffect(() => {
    if (id) {
      fetchCurrentOrder();
    }
  }, [id]);

  // const currentOrder = orders?.rows?.find((order) => order?.id === Number(id))
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Orders", path: "/dashboard/vendor/orders" },
            { name: "Details" }
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
            dialog.onFalse();
            router.back();
          }}
          onRetry={() => {
            dialog.onFalse();
            fetchCurrentOrder();
          }}
        />
      ) : (
        <>
          <OrderDetailsToolbar
            orderNumber={currentOrder}
            createdAt={currentOrder?.createdAt}
            status={currentOrder?.status}
            isLoading={isLoading}
            UpdateOrderStatus={UpdateOrderStatus}
            CancelOrderStatus={CancelOrderStatus}
            UpdateOrderStatusBackToConfirmed={UpdateOrderStatusBackToConfirmed}
          />
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Stack spacing={3} direction={{ xs: "column-reverse", md: "column" }}>
                <OrderDetailsItems
                  items={currentOrder?.items}
                  shipping={currentOrder?.deliveryCost}
                  discount={currentOrder?.totalDiscount}
                  subTotal={currentOrder?.grossTotal - currentOrder?.deliveryCost}
                  totalAmount={
                    currentOrder?.returnOrderId > 0
                      ? currentOrder?.finalPriceWithoutReturned
                      : currentOrder?.finalPrice
                  }
                  isLoading={isLoading}
                />
                {currentOrder?.status !== "Returned" && currentOrder?.status !== "Cancelled" && (
                  <OrderStepper
                    currentStatus={currentOrder?.status}
                    isLoading={isLoading}
                    tracking={tracking}
                  />
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <OrderDetailsInfo
                customer={currentOrder?.user}
                vendor={currentOrder?.vendor}
                shippingAddress={currentOrder?.userAddress}
                payment={{
                  method: currentOrder?.paymentMethod
                }}
                delivery={currentOrder?.deliveryId || ""}
                isLoading={isLoading}
              />
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}
