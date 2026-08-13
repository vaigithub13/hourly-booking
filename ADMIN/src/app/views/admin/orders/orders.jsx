import { Box, FormControl, IconButton, Stack, styled, Tooltip, Typography } from "@mui/material";
import { Breadcrumb, SimpleCard } from "app/components";
import MyAutocomplete from "app/components/AutoComplete/MyAutocomplete";
import MyAvatar from "app/components/common-avatar/avatar";
import CommonButton from "app/components/common-button";
import { ConfirmDialog } from "app/components/custom-dialog";
import MyDataTable from "app/components/DataTable/MyDataTable";
import Label from "app/components/label";
import ListItem from "app/components/listitemtext/ListItem";
import SelectBox from "app/components/select-box/select-box";
import { useDataContext } from "app/contexts/DataContext";
import { useBoolean } from "app/hooks/useBoolean";
import { useRouter } from "app/hooks/useRouter";
import { ordersReducer } from "app/utils/reducers";
import { getRequest, postRequest } from "app/utils/request";
import { fDate, fDateTime, formatCurrency, fTime, statusColorMap } from "app/utils/utils";
import { useCallback } from "react";
import { useEffect } from "react";
import { useReducer } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import ReturnOrderModel from "./ReturnOrder/ReturnOrderModel";
import { AssignmentReturn, Cancel, Visibility } from "@mui/icons-material";

// STYLED COMPONENT
const Container = styled("div")(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down("sm")]: { margin: 16 },
  "& .breadcrumb": {
    marginBottom: 30,
    [theme.breakpoints.down("sm")]: { marginBottom: 16 }
  }
}));

export default function Orders() {
  const router = useRouter();
  const bool = useBoolean();
  const newBool = useBoolean();
  const [orderId, setOrderId] = useState(0);
  const [returnId, setReturnId] = useState(0);
  const { statusCodes } = useDataContext();
  const initialOrdersState = {
    isLoading: false,
    count: 0,
    rows: [],
    status: 0,
    userId: 0,
    vendorId: 0
  };

  const [orders, dispatch] = useReducer(ordersReducer, initialOrdersState);

  //action creaters
  const setOrders = (orders) => dispatch({ type: "SET_ORDERS", payload: orders });
  const setLoading = (loading) => dispatch({ type: "SET_LOADING", payload: loading });
  const setStatus = (status) => dispatch({ type: "SET_STATUS", payload: status });
  const setCustomer = (customer) => dispatch({ type: "SET_CUSTOMER", payload: customer });
  const setVendor = (vendor) => dispatch({ type: "SET_VENDOR", payload: vendor });

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0
  });

  const fetchOrders = async () => {
    const offset = (paginationModel?.page + 1 - 1) * paginationModel?.pageSize;
    let url = `/order/?limit=${paginationModel?.pageSize}&offset=${offset}`;
    if (orders?.status !== 0) {
      url += `&status=${orders?.status}`;
    }

    if (orders?.userId !== 0) {
      url += `&userId=${orders?.userId}`;
    }

    if (orders?.vendorId !== 0) {
      url += `&vendorId=${orders?.vendorId}`;
    }
    setLoading(true);
    const res = await getRequest(url, router);
    setLoading(false);
    setOrders(res?.data);
  };

  useEffect(() => {
    fetchOrders();
  }, [
    paginationModel?.page,
    paginationModel?.pageSize,
    orders?.status,
    orders?.userId,
    orders?.vendorId
  ]);

  const handleOpenCancelMOdel = useCallback(
    (id) => {
      bool.onTrue();
      setOrderId(id);
    },
    [orderId, setOrderId]
  );

  const handleOpenReturnModel = useCallback(
    (id) => {
      newBool.onTrue();
      setReturnId(id);
    },
    [returnId, setReturnId]
  );

  const handleCancelOrder = async () => {
    const res = await postRequest(`/order/cancel-order-by-admin/${orderId}`);
    const updatedOrders = orders?.rows?.map((order) =>
      order?.id === orderId ? { ...order, status: "Cancelled" } : order
    );
    if (res) {
      toast.success("Order cancelled succesfully");
      setOrders({ ...orders, rows: updatedOrders });
      bool.onFalse();
    }
  };

  const columns = [
    {
      field: "orderId",
      headerName: "Order Id",
      flex: 0.1,
      minWidth: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Label variant="soft" color={"info"}>
          {`${row?.id}`}
        </Label>
      )
    },
    {
      field: "customerName",
      headerName: "Customer Name",
      flex: 0.2,
      minWidth: 200,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: "100%" }}>
          <MyAvatar
            image={row?.user?.profilePicture}
            name={`${row?.user?.firstName} ${row?.user?.lastName}`}
          />
          <ListItem
            primaryText={`${row?.user?.firstName} ${row?.user?.lastName}`}
            secondaryText={row?.user?.email || ""}
            primaryWidth={"250px"}
            secondaryWidth={"100px"}
          />
        </Stack>
      )
    },

    {
      field: "vendorName",
      headerName: "Business Name",
      flex: 0.2,
      minWidth: 180,
      sortable: false,
      filterable: false,
      renderHeader: (params) => (
        <Box
          sx={{
            whiteSpace: "normal", // Allow text to wrap
            overflowWrap: "break-word", // Handle long words

            lineHeight: "normal", // Ensure no extra vertical space
            padding: 0, // Remove default padding
            margin: 0 // Remove default margins
          }}
        >
          {params.colDef.headerName}
        </Box>
      ),
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <MyAvatar image={row?.vendor?.logo} name={row?.vendor?.vendorName} />

          <ListItem
            primaryText={`${row?.vendor?.ownerName}`}
            secondaryText={row?.vendor?.vendorName}
            // primaryWidth={'100px'}
            // secondaryWidth={'100px'}
          />
        </Stack>
      )
    },
    {
      field: "date",
      headerName: "Date",
      flex: 0.1,
      minWidth: 150,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: ({ row }) => (
        <ListItem
          primaryText={fDate(row?.createdAt)}
          secondaryText={fTime(row?.createdAt)}
          primaryProps={{ typography: "subtitle2", noWrap: true }}
          secondaryProps={{
            mt: 0.5,
            component: "span",
            typography: "caption"
          }}
        />
      )
    },

    {
      field: "return",
      headerName: "Return Request?",
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderHeader: (params) => (
        <Box
          sx={{
            whiteSpace: "normal", // Allow text to wrap
            overflowWrap: "break-word", // Handle long words

            lineHeight: "normal", // Ensure no extra vertical space
            padding: 0, // Remove default padding
            margin: 0 // Remove default margins
          }}
        >
          {params.colDef.headerName}
        </Box>
      ),
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Label variant="soft" color={row?.returnOrderId > 0 ? "error" : "success"}>
          {row?.returnOrderId > 0 ? "True" : "False"}
        </Label>
      )
    },
    {
      field: "items",
      headerName: "Items",
      flex: 0.1,
      minWidth: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Label variant="soft" color={"info"}>
          {`${row?.itemsCount}`}
        </Label>
      )
    },

    {
      field: "total",
      headerName: "Total (QAR)",
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderHeader: (params) => (
        <Box
          sx={{
            whiteSpace: "normal", // Allow text to wrap
            overflowWrap: "break-word", // Handle long words

            lineHeight: "normal", // Ensure no extra vertical space
            padding: 0, // Remove default padding
            margin: 0 // Remove default margins
          }}
        >
          {params.colDef.headerName}
        </Box>
      ),
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Label variant="soft" color={"primary"}>
          {formatCurrency(row?.grossTotal - row?.totalDiscount)}
        </Label>
      )
    },

    {
      field: "status",
      headerName: "Status",
      flex: 0.1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Label
          variant="soft"
          sx={{
            px: 1, // padding for multi-line
            py: 0.5
          }}
          color={`${statusColorMap[row?.status]}`}
        >
          {row?.status === "Ready To Ship" ? "Ready To Pickup" : row?.status}
        </Label>
      )
    },
    {
      type: "actions",
      field: "actions",
      flex: 0.5,
      minWidth: 120,
      headerName: "Actions",
      headerAlign: "center",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="View Details" placement="top" arrow>
            <IconButton
              color="info"
              size="sm"
              component="a"
              // target="_blank"
              // rel="noopener noreferrer"
              href={`/dashboard/admin/orders/${row?.id}/details`}
            >
              <Visibility />
            </IconButton>
          </Tooltip>

          {/* {row?.status === 'Placed' && (
            <IconButton
              color="error"
              size="sm"
              disabled={row?.status !== 'Placed'}
              onClick={() => handleOpenCancelMOdel(row?.id)}
            >
              <Tooltip title="Cancel Order" placement="top" arrow>
                <Cancel />
              </Tooltip>
            </IconButton>
          )} */}

          {/* {row?.status === 'Delivered' && row?.returnOrderId === 0 && (
            <IconButton
              color="secondary"
              size="sm"
              disabled={
                !(row?.status === 'Delivered' && row?.returnOrderId === 0)
              }
              onClick={() => handleOpenReturnModel(row?.id)}
            >
              <Tooltip title="Return Order" placement="top" arrow>
                <AssignmentReturn />
              </Tooltip>
            </IconButton>
          )} */}
        </Box>
      )
    }
  ];

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Orders", path: "/dashboard/admin/orders" }]} />
      </Box>
      <SimpleCard>
        <FormControl style={{ minWidth: 300, marginBottom: 20, marginRight: 20 }}>
          <MyAutocomplete
            url={`/users?limit=20&offset=0&role=customer`}
            label={"Search By Customer"}
            setState={setCustomer}
            placeholder={"Customer Name"}
          />
        </FormControl>

        <FormControl style={{ minWidth: 300, marginBottom: 20, marginRight: 20 }}>
          <MyAutocomplete
            url={`/vendors?limit=20&offset=0`}
            label={"Search By Designer"}
            setState={setVendor}
            placeholder={"Business Name"}
          />
        </FormControl>
        <FormControl style={{ minWidth: 300, marginBottom: 20, marginRight: 20 }}>
          <SelectBox
            id="status"
            label="Select Status"
            value={orders?.status}
            setState={setStatus}
            data={statusCodes}
          />
        </FormControl>
        <MyDataTable
          columns={columns}
          rows={orders?.rows}
          loading={orders?.isLoading}
          rowCount={orders?.count}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
        <ConfirmDialog
          open={bool.value}
          onClose={bool.onFalse}
          title="Cancel Order"
          content={<>Are you sure want to cancel?</>}
          action={
            <CommonButton
              title="Cancel"
              variant="contained"
              color="error"
              onClick={handleCancelOrder}
            />
          }
        />
        <ReturnOrderModel
          open={newBool.value}
          onClose={() => newBool.onFalse()}
          orderId={returnId}
          fetchOrders={fetchOrders}
        />
      </SimpleCard>
    </Container>
  );
}
