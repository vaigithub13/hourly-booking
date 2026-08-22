import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { DatePicker } from "@mui/x-date-pickers";
import * as Yup from "yup";
import { Box, Grid, InputAdornment } from "@mui/material";
import { postRequest } from "app/utils/request";
import { toast } from "react-toastify";
import { useMemo } from "react";
import { useCallback } from "react";
import { CommonDialouge } from "app/components/CommonDialogue/CommonDialogue";
import { RHFTextField } from "app/components/hook-form";
import { useEffect } from "react";

// ----------------------------------------------------------------------

export default function TransactionDialog({
  title,
  vendorId,
  fetchTransactions,
  open,
  onClose,
  orderId,
  amount,
  ...other
}) {
  console.log("---orderId", orderId);
  const TransactionSchema = Yup.object().shape({
    date: Yup.date().required("Date is required"),
    amount: Yup.number().positive(`Required & can't be negative`),
    description: Yup.object().shape({
      en: Yup.string().required("Description in English is required"),
      ar: Yup.string().required("الوصف باللغة العربية مطلوب")
    })
  });

  const defaultValues = useMemo(
    () => ({
      date: new Date(),
      amount: amount || 0,
      attachment: null,
      type: 1,
      description: {
        en: "",
        ar: ""
      }
    }),
    []
  );

  const methods = useForm({
    mode: "onTouched",
    resolver: yupResolver(TransactionSchema),
    defaultValues
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid }
  } = methods;

  useEffect(() => {
    console.log("======amount", amount);
    reset({
      date: new Date(),
      amount: amount || 0,
      attachment: null,
      type: 1,
      description: {
        en: "",
        ar: ""
      }
    });
  }, [amount, orderId, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // await new Promise((resolve) => setTimeout(resolve, 500));
      delete data.amount;
      const res = await postRequest("/transactions", {
        ...data,
        vendorId,
        orderId
      });

      if (res) {
        await fetchTransactions();
        onClose();
        reset();
        toast.success("Added Successfully!!");
      }
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <CommonDialouge
      title="Add Transaction"
      open={open}
      onClose={onClose}
      methods={methods}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      reset={reset}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{ xs: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
          >
            <Box
              sx={{
                gridColumn: { xs: "1 / -1", md: "1 / -1" },
                border: "1px solid",
                borderColor: "divider",
                p: 1.5,
                borderRadius: 1
              }}
            >
              <strong>Order ID:</strong> <code style={{ fontFamily: "monospace" }}>{orderId}</code>
            </Box>

            {/* Amount (now comes after orderId) */}
            <RHFTextField
              name="amount"
              type="number"
              label="Amount"
              disabled
              maxLength={6}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <div style={{ paddingRight: 8, fontWeight: "bold" }}>INR</div>
                  </InputAdornment>
                )
              }}
            />
            <Controller
              name="date"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  format="dd/MM/yyyy"
                  fullWidth
                  value={field.value}
                  minDate={new Date()}
                  onChange={(newValue) => field.onChange(newValue)}
                  slotProps={{
                    textField: { fullWidth: true, error: !!error, helperText: error?.message }
                  }}
                />
              )}
            />
            <RHFTextField
              name="description.en"
              label="Description in english"
              multiline
              rows={3}
              maxLength={150}
            />
            <div dir="rtl">
              <RHFTextField
                name="description.ar"
                label="محتوى"
                multiline
                rows={3}
                maxLength={150}
              />
            </div>
          </Box>
        </Grid>
      </Grid>
    </CommonDialouge>
  );
}
