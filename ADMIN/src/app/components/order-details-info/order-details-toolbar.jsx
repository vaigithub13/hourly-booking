import PropTypes from "prop-types";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Label from "app/components/label";
import { fDateTime, ReturnStatusColorMap, ReturnStatusMap, statusColorMap } from "app/utils/utils";
import { useDataContext } from "app/contexts/DataContext";
import CustomPopover, { usePopover } from "../custom-popover";
import {
  Box,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  TextField,
  Tooltip,
  MenuItem,
  Select,
  Button
} from "@mui/material";
import useAuth from "app/hooks/useAuth";
import CommonButton from "../common-button";
import { useState } from "react";
import { patchRequest } from "app/utils/request";
import { toast } from "react-toastify";
import { useCallback } from "react";
import { useBoolean } from "app/hooks/useBoolean";
import { ConfirmDialog } from "../custom-dialog";

// ----------------------------------------------------------------------

export default function OrderDetailsToolbar({
  status,
  createdAt,
  orderNumber,
  order,
  setCurrentOrder,
  isLoading,
  isReturn,
  UpdateOrderStatus,
  UpdateOrderStatusBackToConfirmed,
  CancelOrderStatus
}) {
  const { statusCodes, returnStatusCodes } = useDataContext();
  const { user } = useAuth();
  const modal = useBoolean();
  const [remarkOpen, setRemarkOpen] = useState(false);
  const [remarkText, setRemarkText] = useState("");

  const [approveOpen, setApproveOpen] = useState(false);
  const [deliveryPaidByVendor, setDeliveryPaidByVendor] = useState(true);

  const isAdmin = user?.role === "admin";
  const isVendor = user?.role === "vendor";
  const isReturnFlow = Boolean(isReturn);

  const handleSubmitRemark = useCallback(async () => {
    if (!remarkText.trim()) return; // optional guard
    // await submitVendorRemark?.(remarkText.trim())
    const res = await patchRequest(`/order/return/${order?.id}/add-data-vendor`, {
      vendorReason: remarkText,
      vendorImages: []
    });
    if (res) {
      setCurrentOrder({
        ...order,
        status: "PendingAdmin",
        vendorReason: remarkText
      });
      setRemarkOpen(false);
      setRemarkText("");
      toast.success("Response added succesfully");
    }
  }, [remarkText, setRemarkText, remarkOpen, setRemarkOpen, order, setCurrentOrder]);

  const handleApprove = useCallback(async () => {
    const res = await patchRequest(`/order/return/${order?.id}/approve`, {
      deliveryPaidByVendor
    });
    if (res) {
      setApproveOpen(false);
      setCurrentOrder({ ...order, status: "Approved", deliveryPaidByVendor });
      toast.success("Approved succesfully");
    }
  }, [
    deliveryPaidByVendor,
    setDeliveryPaidByVendor,
    approveOpen,
    setApproveOpen,
    order,
    setCurrentOrder
  ]);

  const getNextStatus = (currentStatus) => {
    if (isReturn) {
      // Filter only "PickUp" and "Complete" after approval
      const allowedStatuses = returnStatusCodes.filter(
        (status) => status === "PickUp" || status === "Complete"
      );

      // If the current status is "Approved", the next step should be "PickUp"
      if (currentStatus === "Approved") return "PickUp";

      // If the current status is "PickUp", the next step should be "Complete"
      if (currentStatus === "PickUp") return "Complete";

      // If the current status is "Complete" or anything else, return the same status
      return currentStatus;
    } else {
      const currentIndex = statusCodes.findIndex((s) => s.status === currentStatus);
      return currentIndex !== -1 && currentIndex < statusCodes.length - 1
        ? statusCodes[currentIndex + 1].status // Return the `status` property
        : currentStatus;
    }
  };

  const nextStatus = getNextStatus(status);

  return (
    <Stack
      spacing={3}
      direction={{ xs: "column", md: "row" }}
      sx={{
        mb: { xs: 3, md: 5 },
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        flexWrap: "wrap"
      }}
    >
      {/* Left Section - Order Info */}
      <Stack spacing={1} direction="row" alignItems="flex-start" flexWrap="wrap">
        <Stack spacing={0.5}>
          <Stack spacing={1} direction="row" alignItems="center" flexWrap="wrap">
            {isLoading ? (
              <Skeleton variant="text" width={120} height={40} />
            ) : (
              <Typography variant="h6">
                {isReturn
                  ? `Return Order #${orderNumber?.id} (Order #${order?.order?.id})`
                  : `Order #${orderNumber?.id}`}
              </Typography>
            )}
            {isLoading ? (
              <Skeleton variant="rectangular" width={80} height={30} />
            ) : (
              <Label
                variant="soft"
                color={
                  isReturn ? ReturnStatusColorMap[status] : statusColorMap[status] || "default"
                }
              >
                {status === "Ready To Ship"
                  ? "Ready To Pickup"
                  : isReturn
                  ? ReturnStatusMap[status]
                  : status}
              </Label>
            )}
          </Stack>

          {isLoading ? (
            <Skeleton variant="text" width={150} />
          ) : (
            <Typography variant="body2" sx={{ color: "text.disabled" }}>
              {fDateTime(createdAt)}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Box sx={{ width: { xs: "100%", md: "auto" }, ml: { xs: 0, md: "auto" } }}>
        {isLoading ? (
          <Skeleton variant="rectangular" width={140} height={32} sx={{ borderRadius: 2 }} />
        ) : status === "Cancelled" ? null : (
          (() => {
            // ---------- RETURN FLOW (no Select here) ----------
            if (isReturnFlow) {
              // Vendor: Pending -> show "Add Remarks" button
              if (isVendor && status === "Pending") {
                return (
                  <>
                    <Stack direction="row" spacing={1} flexWrap="wrap" mt={{ xs: 1, md: 0 }}>
                      <CommonButton
                        variant="contained"
                        size="small"
                        title="Add Remarks"
                        onClick={() => setRemarkOpen(true)}
                      />
                    </Stack>

                    {/* Vendor Remark Dialog */}
                    <Dialog
                      open={remarkOpen}
                      onClose={() => setRemarkOpen(false)}
                      fullWidth
                      maxWidth="sm"
                    >
                      <DialogTitle>Add Response</DialogTitle>
                      <DialogContent>
                        <TextField
                          autoFocus
                          fullWidth
                          multiline
                          minRows={3}
                          placeholder="Enter description"
                          value={remarkText}
                          onChange={(e) => setRemarkText(e.target.value)}
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setRemarkOpen(false)}>Cancel</Button>
                        <Button
                          variant="contained"
                          onClick={handleSubmitRemark}
                          disabled={!remarkText.trim()}
                        >
                          Submit
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                );
              }

              // Admin: PendingAdmin -> Approve/Reject; Approve opens checkbox dialog
              if (isAdmin && status === "PendingAdmin") {
                return (
                  <>
                    <Stack direction="row" spacing={1} flexWrap="wrap" mt={{ xs: 1, md: 0 }}>
                      <CommonButton
                        variant="contained"
                        color="success"
                        size="small"
                        title="Approve"
                        onClick={() => setApproveOpen(true)}
                      />
                      <CommonButton
                        variant="contained"
                        color="error"
                        size="small"
                        title="Reject"
                        onClick={() => UpdateOrderStatus?.("Rejected")}
                      />
                    </Stack>

                    {/* Admin Approve Dialog */}
                    <Dialog
                      open={approveOpen}
                      onClose={() => setApproveOpen(false)}
                      fullWidth
                      maxWidth="sm"
                    >
                      <DialogTitle>Approve Return</DialogTitle>
                      <DialogContent sx={{ pt: 2 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={deliveryPaidByVendor}
                              onChange={(e) => setDeliveryPaidByVendor(e.target.checked)}
                            />
                          }
                          label="Delivery paid by Designer"
                        />
                        <Box sx={{ mt: 1, fontSize: 14, color: "text.secondary" }}>
                          {deliveryPaidByVendor
                            ? "Delivery fee will be paid by designer."
                            : "Delivery fee will be paid by customer."}
                        </Box>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setApproveOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleApprove}>
                          Confirm Approve
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                );
              }

              // Other return states/roles: no controls
              return null;
            }

            // ---------- NON-RETURN FLOW (kept as before) ----------
            if (isVendor) {
              return (
                <Stack direction="row" spacing={1} flexWrap="wrap" mt={{ xs: 1, md: 0 }}>
                  {status === "Confirmed" ? (
                    <CommonButton
                      variant="contained"
                      color="primary"
                      size="small"
                      title="Ready To Pickup"
                      onClick={() => UpdateOrderStatus?.("Ready To Ship")}
                    />
                  ) : status === "Placed" ? (
                    <>
                      <CommonButton
                        variant="contained"
                        color="success"
                        size="small"
                        title="Confirm Order"
                        onClick={() => UpdateOrderStatus?.("Confirmed")}
                      />
                      <CommonButton
                        variant="contained"
                        color="error"
                        size="small"
                        title="Cancel Order"
                        onClick={() => modal.onTrue()}
                      />
                    </>
                  ) : null}
                </Stack>
              );
            }

            // Default Select for non-vendors, non-return (unchanged)
            return (
              <FormControl fullWidth sx={{ minWidth: 140 }}>
                <Box display={"flex"} gap={1}>
                  {status === "Ready To Ship" && isAdmin && (
                    <CommonButton
                      variant="contained"
                      color="warning"
                      size="small"
                      title="Back to Confirmed"
                      onClick={() => UpdateOrderStatusBackToConfirmed?.("Confirmed")}
                    />
                  )}
                  <Select
                    value={status}
                    disabled={
                      status === "Cancelled" || status === "Returned" || status === "Delivered"
                    }
                    onChange={(e) => UpdateOrderStatus?.(e.target.value)}
                    displayEmpty
                    sx={{
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      boxShadow: 2,
                      height: 32
                    }}
                  >
                    {statusCodes
                      .filter((opt) => opt?.status !== "Cancelled" && opt?.status !== "Returned")
                      .map((opt) => (
                        <MenuItem
                          key={opt.status}
                          value={opt.status}
                          disabled={opt.status !== nextStatus}
                        >
                          {opt.status === "Ready To Ship" ? "Ready To Pickup" : opt.status}
                        </MenuItem>
                      ))}
                  </Select>

                  <CommonButton
                    variant="contained"
                    color="error"
                    size="small"
                    title="Cancel Order"
                    onClick={() => modal.onTrue()}
                  />
                </Box>
              </FormControl>
            );
          })()
        )}
      </Box>
      <ConfirmDialog
        title={"Cancel Order"}
        open={modal.value}
        onClose={modal.onFalse}
        content={<>Are you sure want to cancel the order?</>}
        action={
          <CommonButton
            title={"Cancel"}
            color={"error"}
            size={"large"}
            onClick={() => {
              CancelOrderStatus();
              modal.onFalse();
            }}
          />
        }
      />
    </Stack>
  );
}

OrderDetailsToolbar.propTypes = {
  createdAt: PropTypes.instanceOf(Date),
  orderNumber: PropTypes.object,
  status: PropTypes.string,
  isLoading: PropTypes.bool // Add this prop type
};
