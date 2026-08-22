import { Box, Button, Icon, ListItemText, Stack, styled, Typography } from "@mui/material";
import { Breadcrumb, SimpleCard } from "app/components";

import { useParams } from "app/hooks/useParams";
import { useState } from "react";
import { deleteRequest, getRequest } from "app/utils/request";
import { useEffect } from "react";
import Label from "app/components/label";
import { fDate, formatCurrency, fTime, statusColorMap } from "app/utils/utils";
import { useBoolean } from "app/hooks/useBoolean";
import { useDataContext } from "app/contexts/DataContext";
import { toast } from "react-toastify";
import { ConfirmDialog } from "app/components/custom-dialog";
import { useCallback } from "react";
import CommonButton from "app/components/common-button";
import MyDataTable from "app/components/DataTable/MyDataTable";
import { useRouter } from "app/hooks/useRouter";
import { Attachment } from "@mui/icons-material";
import TransactionDialog from "./transaction-dialog/transaction-dialog";
import TransactionAttachmentDialog from "./transaction-dialog/TransactionAttachment";
import ListItem from "app/components/listitemtext";

// STYLED COMPONENT
const Container = styled("div")(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down("sm")]: { margin: 16 },
  "& .breadcrumb": {
    marginBottom: 30,
    [theme.breakpoints.down("sm")]: { marginBottom: 16 }
  }
}));
export default function Transactions() {
  const { transactions } = useDataContext();
  const confirm = useBoolean();
  const router = useRouter();
  const params = useParams();
  // at the top of your component
  const [orderSelected, setOrderSelected] = useState(null);
  const { id } = params;
  const [rowId, setRowId] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [topen, setTopen] = useState(false);
  const [tdata, setTData] = useState(0);

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0
  });

  const handleDeleteRow = useCallback(
    async (id) => {
      // console.log(typeof id);
      const updatedTransactions = data?.rows?.filter((t) => t?.id !== id);
      const res = await deleteRequest(`/transactions/${id}`, router);

      if (res) {
        // enqueueSnackbar(`Removed success!`);
        toast.success("Removed Succssfully");
        setData({
          ...data,
          count: data?.count - 1,
          rows: updatedTransactions
        });
      }
    },
    [data, setData]
  );

  const fetchTransactions = async () => {
    const offset = (paginationModel?.page + 1 - 1) * paginationModel?.pageSize;
    setLoading(true);
    const res = await getRequest(
      `/order/?limit=${paginationModel?.pageSize}&offset=${offset}&vendorId=${id}&isSortDesc=true&status=Delivered`,
      router
    );
    setData(res?.data);
    setLoading(false);
  };

  const handleTPopup = useCallback(
    (data) => {
      setTopen(true);
      setTData(data);
    },
    [tdata, setTData, topen, setTopen]
  );

  useEffect(() => {
    if (id) {
      fetchTransactions();
    }
  }, [id, paginationModel?.page, paginationModel?.pageSize]);

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
      field: "amount",
      headerName: "Total (INR)",
      flex: 0.2,
      minWidth: 200,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: ({ row }) => (
        <Typography variant="subtitle2">{formatCurrency(row?.accounting.amount)}</Typography>
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

    // {
    //   field: 'type',
    //   headerName: 'Type',
    //   flex: 0.2,
    //   minWidth: 200,
    //   sortable: false,
    //   filterable: false,
    //   disableColumnMenu: true,

    //   renderCell: ({ row }) => (
    //     <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
    //       <Label variant="soft" color={row?.type === 0 ? 'info' : 'error'}>
    //         {row?.type === 0 ? 'In' : 'Out'}
    //       </Label>
    //     </Stack>
    //   ),
    // },
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
    // {
    //   field: "description",
    //   headerName: "Description",
    //   flex: 0.2,
    //   minWidth: 200,
    //   sortable: false,
    //   filterable: false,
    //   disableColumnMenu: true,

    //   renderCell: ({ row }) => (
    //     <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
    //       <ListItemText
    //         primary={row?.description?.en}
    //         secondary={row?.description?.ar}
    //         primaryTypographyProps={{ typography: "body2", noWrap: true }}
    //         secondaryTypographyProps={{
    //           mt: 0.5,
    //           component: "span",
    //           typography: "caption"
    //         }}
    //       />
    //     </Stack>
    //   )
    // },

    {
      type: "actions",
      field: "actions",
      flex: 0.2,
      minWidth: 150,
      headerName: "Action",
      headerAlign: "center",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <CommonButton
            title={row?.attachment !== "" ? "Edit File" : "Attach File"}
            color={row?.attachment !== "" ? "primary" : "info"}
            variant={row?.attachment !== "" ? "contained" : "outlined"}
            onClick={() => handleTPopup(row)}
          />
          {row?.isPaid == false ? (
            <CommonButton
              title="Pay Now"
              color="info"
              onClick={() => {
                console.log("row", row);
                console.log("---orderSelected,", orderSelected);
                setOrderSelected(row);
                confirm.onTrue();
              }}
            />
          ) : null}
        </Box>
      )
    }
  ];

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Accounting", path: "/dashboard/admin/accounting" },
            { name: "Transactions" }
          ]}
          action={
            <CommonButton
              // component={RouterLink}
              // href={paths.dashboard.shop.new}
              title={"Go Back"}
              size={"sm"}
              onClick={() => router.push("/dashboard/admin/accounting")}
              variant="outlined"
              startIcon={<Icon>arrow_back</Icon>}
            />
          }
        />
      </Box>
      <SimpleCard
        title={
          transactions?.rows?.find((transaction) => transaction?.userId === Number(id))?.user
            ?.fullName
        }
      >
        {/* <Box sx={{ display: "flex", justifyContent: "end", mb: 2 }}>
          <Button onClick={() => confirm.onTrue()} variant="outlined" startIcon={<Icon>add</Icon>}>
            Add Transaction
          </Button>
        </Box> */}
        <MyDataTable
          columns={columns}
          rows={data?.rows}
          rowCount={data?.count}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </SimpleCard>
      {/* Add Transactions Dialog */}
      <TransactionDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        vendorId={id}
        orderId={orderSelected?.id}
        amount={orderSelected?.accounting.amount}
        fetchTransactions={fetchTransactions}
      />
      {/* Add Transactions Attachment Dialog */}
      <TransactionAttachmentDialog
        open={topen}
        fetch={fetchTransactions}
        current={tdata}
        onClose={() => {
          setTopen(false);
          setTData(null);
        }}
      />
      {/* confirmDialog */}
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete"
        content={<>Are you sure want to delete?</>}
        action={
          <CommonButton
            title={"Delete"}
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRow(rowId);
              setOpen(false);
            }}
          />
        }
      />
    </Container>
  );
}
