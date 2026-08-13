import PropTypes from "prop-types";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo, useEffect, useCallback, useState } from "react";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";

import Grid from "@mui/material/Unstable_Grid2";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";

import { useRouter } from "app/hooks/useRouter";
import { useResponsive } from "app/hooks/useResponsive";

import { RHFTextField, RHFUpload } from "app/components/hook-form";
import FormProvider from "app/components/hook-form/form-provider";
import { Box, IconButton, InputAdornment } from "@mui/material";
import { UploadFiles, postRequest, putRequest } from "app/utils/request";

import { useDataContext } from "app/contexts/DataContext";
import { toast } from "react-toastify";
import { SettingsSchema } from "app/utils/Schema";
import CommonButton from "app/components/common-button";
import { Add, Delete } from "@mui/icons-material";

// import PostDetailsPreview from './post-details-preview';

// ----------------------------------------------------------------------

export default function SettingsNewEditForm({ currentSetting }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const { setConfig } = useDataContext();

  const mdUp = useResponsive("up", "md");

  const defaultValues = useMemo(
    () => ({
      supportEmail: currentSetting?.supportEmail || "",
      whatsappNumber: currentSetting?.whatsappNumber || 99999999,
      // homePageText: {
      //   en: currentSetting?.homePageText?.en || '',
      //   ar: currentSetting?.homePageText?.ar || '',
      // },
      eventsReceivingEmail: currentSetting?.eventsReceivingEmail || "",
      deliveryPricing: {
        insideDoha: currentSetting?.deliveryPricing?.insideDoha || 0,
        outsideDoha: currentSetting?.deliveryPricing?.outsideDoha || 0
      },
      // walletRefundTimeInMinutes: currentSetting?.walletRefundTimeInMinutes || 0,
      ordersReturnReasons: currentSetting?.ordersReturnReasons || [{ en: "", ar: "" }],
      ordersCancelReasons: currentSetting?.ordersCancelReasons || [{ en: "", ar: "" }]
    }),
    [currentSetting]
  );

  const methods = useForm({
    mode: "onTouched",
    resolver: yupResolver(SettingsSchema),
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

  const values = watch();

  const {
    fields: returnFields,
    append: appendReturn,
    remove: removeReturn
  } = useFieldArray({
    control,
    name: "ordersReturnReasons"
  });

  const {
    fields: cancelFields,
    append: appendCancel,
    remove: removeCancel
  } = useFieldArray({
    control,
    name: "ordersCancelReasons"
  });

  useEffect(() => {
    if (currentSetting) {
      reset(defaultValues);
    }
  }, [currentSetting, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // await new Promise((resolve) => setTimeout(resolve, 500));
      const res = await putRequest("/configurations", data);

      if (res) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setConfig({
          ...currentSetting,
          supportEmail: data.supportEmail,
          whatsappNumber: data.whatsappNumber,
          // homePageText: {
          //   en: data.homePageText?.en,
          //   ar: data.homePageText?.ar,
          // },
          walletRefundTimeInMinutes: data.walletRefundTimeInMinutes,
          ordersReturnReasons: data.ordersReturnReasons,
          ordersCancelReasons: data.ordersCancelReasons,
          deliveryPricing: {
            insideDoha: data.deliveryPricing.insideDoha,
            outsideDoha: data.deliveryPricing.outsideDoha
          }
        });
        router.back();
        toast.success("Update Successfully");
      }
    } catch (error) {
      setConfig(currentSetting);
      console.error(error);
    }
  });

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={3}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Site Details
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Email, Phone, address...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={9}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                md: "repeat(2, 1fr)"
              }}
            >
              <RHFTextField
                type={"email"}
                name="supportEmail"
                label="Support Email"
                maxLength={75}
              />
              <RHFTextField
                type={"email"}
                name="eventsReceivingEmail"
                label="Notification Receiving Email"
                maxLength={75}
              />

              <RHFTextField
                name="whatsappNumber"
                label="Phone"
                maxLength={8}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <div style={{ paddingRight: 8, fontWeight: "bold" }}>+974</div>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Typography variant="h6">Delivery Fee</Typography>
            <Box display={"flex"} alignItems={"center"} gap={2}>
              <RHFTextField
                name="deliveryPricing.insideDoha"
                label="Delivery Price (Inside Doha)"
                maxLength={8}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <div style={{ paddingRight: 8, fontWeight: "bold" }}>QAR</div>
                    </InputAdornment>
                  )
                }}
              />

              <RHFTextField
                name="deliveryPricing.outsideDoha"
                label="Delivery Pirce (Outside Doha)"
                maxLength={8}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <div style={{ paddingRight: 8, fontWeight: "bold" }}>QAR</div>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Typography variant="h6">Return Reasons</Typography>
            {returnFields.map((field, index) => (
              <Box key={field.id} display="flex" alignItems="center" gap={2}>
                <RHFTextField
                  name={`ordersReturnReasons.${index}.en`}
                  label="Return Reason (English)"
                  maxLength={250}
                />
                <RHFTextField
                  name={`ordersReturnReasons.${index}.ar`}
                  label="سبب الإرجاع (عربي)"
                  dir="rtl"
                  maxLength={250}
                />
                <IconButton onClick={() => removeReturn(index)}>
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <CommonButton
              title="Add"
              onClick={() => appendReturn({ en: "", ar: "" })}
              startIcon={<Add />}
            />

            <Typography variant="h6">Cancel Reasons</Typography>
            {cancelFields.map((field, index) => (
              <Box key={field.id} display="flex" alignItems="center" gap={2}>
                <RHFTextField
                  name={`ordersCancelReasons.${index}.en`}
                  label="Cancel Reason (English)"
                  maxLength={250}
                />
                <RHFTextField
                  name={`ordersCancelReasons.${index}.ar`}
                  label="سبب الإلغاء (عربي)"
                  dir="rtl"
                  maxLength={250}
                />
                <IconButton onClick={() => removeCancel(index)}>
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <CommonButton
              title={"Add"}
              onClick={() => appendCancel({ en: "", ar: "" })}
              startIcon={<Add />}
            />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: "flex", justifyContent: "flex-end" }}>
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          sx={{ ml: 2 }}
        >
          {"Save"}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}

SettingsNewEditForm.propTypes = {
  currentSetting: PropTypes.object
};
