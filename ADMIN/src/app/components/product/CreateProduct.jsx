import React, { useState, useEffect, useCallback } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  IconButton,
  Icon,
  MenuItem,
  Card,
  Chip,
  Stack,
  Divider,
  FormHelperText
} from "@mui/material";
import FormProvider, {
  RHFAutocomplete,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFUpload
} from "app/components/hook-form";
import { useMemo } from "react";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { useDataContext } from "app/contexts/DataContext";
import { Add, Delete } from "@mui/icons-material";
import { ProductSchema } from "app/utils/Schema";
import useAuth from "app/hooks/useAuth";
import { postRequest, putRequest, UploadFiles, UploadMultiple } from "app/utils/request";
import { useBoolean } from "app/hooks/useBoolean";
import { useRouter } from "app/hooks/useRouter";
import SuccessDialog from "../success-dialog/success-dialog";
import ProductInfo from "./ProductInfo";
import { useRef } from "react";
import RHFCheckBox from "../hook-form/rhf-checkbox";

const generateSerialKey = (length = 10) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let serial = "";

  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    serial += chars[randomValues[i] % chars.length];
  }

  return serial;
};

const CreateProduct = ({ currentProduct }) => {
  const { user } = useAuth();
  const { categories, attributes, lengths, metaData } = useDataContext();
  const dialog = useBoolean();
  const router = useRouter();
  const ref = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isLengthRequired, setIsLengthRequired] = useState(false);
  const [ready, setReady] = useState(false);
  const [bool, setBool] = useState(false);

  const mySchema = useMemo(() => {
    return ProductSchema(user?.role === "admin", isLengthRequired, ready);
  }, [user?.role, isLengthRequired, ready]);

  const currentSchema = useMemo(() => {
    return mySchema[activeStep] || Yup.object().shape({});
  }, [mySchema, ready, activeStep]);

  const defaultValues = useMemo(
    () => ({
      name: {
        en: currentProduct?.name?.en || "",
        ar: currentProduct?.name?.ar || ""
      },

      description: {
        en: currentProduct?.description?.en || "",
        ar: currentProduct?.description?.ar || ""
      },
      price: currentProduct?.price || 0,
      serial: currentProduct?.seria || generateSerialKey(),
      categoriesIds: currentProduct?.categories || [],
      metadata: {
        fabric: currentProduct?.metadata?.fabric || "",
        type: currentProduct?.metadata?.type || "",
        washingInstructions: currentProduct?.metadata?.washingInstructions || "",
        ironingInstructions: currentProduct?.metadata?.ironingInstructions || "",
        includesHijab: currentProduct?.metadata?.includesHijab || false
      },
      vendorId: currentProduct?.vendor || null,
      mainImage: currentProduct?.mainImage || null,
      images: currentProduct?.images || [],
      etaDays: currentProduct?.etaDays || 0,
      readyToShip: currentProduct?.readyToShip || false,
      discountedPrice: currentProduct?.discountedPrice || 0,
      supportedCustomAttributes: currentProduct?.supportedCustomAttributes?.length
        ? currentProduct?.supportedCustomAttributes?.map((sp) => sp?.id)
        : [],
      sizesAndColors: currentProduct?.skus?.length
        ? currentProduct.skus.map((sku) => ({
            colorId: sku?.color?.id,
            sizeId: sku?.size?.id,
            amount: sku?.amount,
            lengthId: sku?.length?.id
          }))
        : [{ colorId: null, sizeId: null, lengthId: null, amount: 1 }]
    }),
    [currentProduct]
  );

  const methods = useForm({
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldUnregister: false,
    resolver: yupResolver(currentSchema),
    defaultValues
  });

  const {
    reset,
    watch,
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { isSubmitting, errors, isValid }
  } = methods;

  const values = watch();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sizesAndColors" // Refers to the array in the form
  });

  useEffect(() => {
    if (values.readyToShip) {
      setReady(true);
      clearErrors("etaDays"); // ✅ clear the error manually
      setValue("etaDays", 0); // (optional) reset value
    } else {
      setReady(false);
    }
  }, [values.readyToShip, clearErrors, setValue]);

  useEffect(() => {
    if (values.readyToShip) {
      const categories = values?.categoriesIds || [];

      // count how many categories do NOT require length
      const noLengthRequiredCount = categories.filter(
        (cat) => cat?.isRequiredLength === false
      ).length;

      let required = false;

      if (categories.length === 1) {
        // Case 1: single category, check if it doesn't require length
        required = categories[0]?.isRequiredLength === false;
      } else if (categories.length > 1) {
        // Case 2: multiple categories, check if more than one doesn't require length
        required = noLengthRequiredCount > 1;
      }

      setIsLengthRequired(required);
    }
  }, [isLengthRequired, values.readyToShip, values.categoriesIds, activeStep]);

  const steps = ["Info", "Details", "Availability", "Images", "Review & Confirm"];

  useEffect(() => {
    currentSchema?.isValid(values).then((valid) => {
      // set local state if needed
      setBool(valid);
    });
  }, [activeStep, values, isLengthRequired, currentSchema]);

  const handleNext = async () => {
    const filled = await methods.trigger();
    if (filled) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const onSubmit = handleSubmit(async (data) => {
    ref.current && ref.current.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof data.mainImage === "object") {
      const res = await UploadFiles(data.mainImage);
      data.mainImage = res;
    }
    if (data.images.length > 0) {
      const imgs = await UploadMultiple(data.images);
      data.images = imgs;
    }
    user?.role !== "admin" ? delete data.vendorId : (data.vendorId = data.vendorId.id);

    data.etaDays = Number(data.etaDays);
    data.discountedPrice = Number(data.discountedPrice);
    const res = currentProduct
      ? await putRequest(
          `/products/edit-product`,
          {
            ...data,
            sizesAndColors: data.readyToShip
              ? data.sizesAndColors.map((item) => ({
                  sizeId: item.sizeId,
                  colorId: item.colorId,
                  amount: item.amount,
                  lengthId: isLengthRequired ? null : item.lengthId
                }))
              : [],
            categoriesIds: data.categoriesIds.map((category) => category.id),
            productId: currentProduct?.id
          },
          router
        )
      : await postRequest(
          "/products/new-product",
          {
            ...data,
            sizesAndColors: data.readyToShip
              ? data.sizesAndColors.map((item) => ({
                  sizeId: item.sizeId,
                  colorId: item.colorId,
                  amount: item.amount,
                  lengthId: isLengthRequired ? null : item.lengthId
                }))
              : [],
            categoriesIds: data.categoriesIds.map((category) => category.id),
            productId: currentProduct?.id
          },
          router
        );
    if (res) {
      dialog.onTrue();
      setTimeout(() => {
        dialog.onFalse();
        router.back();
      }, 3000);
    }
  });

  const isLastStep = activeStep === steps.length - 1;

  const handleDrop = useCallback(
    (field, acceptedFiles) => {
      const file = acceptedFiles[0];
      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file)
      });

      if (file) {
        setValue(field, newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRemoveFile = useCallback(
    (field) => {
      setValue(field, null);
    },
    [setValue]
  );

  const handleMultiDrop = useCallback(
    (acceptedFiles) => {
      const files = values.images || []; // Existing files

      // Create new file previews
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      );

      // Combine existing files with new files
      const combinedFiles = [...files, ...newFiles];

      // Limit to MAX_FILES (e.g., 5)
      const limitedFiles = combinedFiles.slice(0, 5);

      // Update the form value with the limited array of files
      setValue("images", limitedFiles, { shouldValidate: true });
    },
    [setValue, values.images]
  );

  const handleMultiRemoveFile = useCallback(
    (inputFile) => {
      const filtered = values.images && values.images?.filter((file) => file !== inputFile);
      setValue("images", filtered);
    },
    [setValue, values.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue("images", []);
  }, [setValue]);

  return (
    <>
      <Paper
        ref={ref}
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 1050,
          bgcolor: "background.paper",
          borderRadius: 4,
          p: { xs: 2, sm: 3, md: 2 },
          mx: "auto",
          my: 4
        }}
      >
        <Typography variant="h4" align="center" sx={{ fontWeight: 600, mb: 2 }}>
          {currentProduct ? "Edit Product" : "Add Product"}
        </Typography>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{ mb: 4, px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 1 } }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ px: 3, py: 2 }}>
            {steps[activeStep] === "Info" && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <RHFTextField
                    name="name.en"
                    label="Product Name (English) *"
                    maxLength={150}
                    placeholder="Enter Product name in English"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <div dir="rtl">
                    <RHFTextField
                      name="name.ar"
                      maxLength={150}
                      label="اسم المنتج (عربي)*"
                      placeholder="أدخل اسم المنتج باللغة العربية"
                    />
                  </div>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <RHFTextField
                    name="description.en"
                    label="Product Description (English) *"
                    maxLength={500}
                    multiline
                    rows={3}
                    placeholder="Enter Product description in English"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <div dir="rtl">
                    <RHFTextField
                      name="description.ar"
                      label="وصف المنتج (عربي) *"
                      maxLength={500}
                      multiline
                      rows={3}
                      placeholder="أدخل وصف المنتج باللغة العربية"
                    />
                  </div>
                </Grid>

                <Grid item xs={12} sm={!values?.readyToShip ? 6 : 12}>
                  <RHFSwitch name={"readyToShip"} label="Is Ready to Wear ?" />
                </Grid>

                {!values?.readyToShip && (
                  <Grid item xs={12} sm={6}>
                    <RHFTextField
                      name={"etaDays"}
                      label="Delivery Time (in days)"
                      type={"number"}
                      maxLength={4}
                      disabled={values.readyToShip}
                    />
                  </Grid>
                )}
              </Grid>
            )}

            {steps[activeStep] === "Details" && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <RHFTextField disabled name="serial" label="Product Serial *" maxLength={20} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField
                    name="price"
                    type="number"
                    label="Product Price *"
                    InputProps={{
                      startAdornment: <Box sx={{ paddingRight: 2, fontWeight: "bold" }}>+INR</Box>
                    }}
                    maxLength={6}
                  />
                </Grid>

                <Grid item xs={6}>
                  <RHFTextField
                    name="discountedPrice"
                    type="number"
                    label="Discounted Price"
                    maxLength={6}
                    InputProps={{
                      startAdornment: <Box sx={{ paddingRight: 2, fontWeight: "bold" }}>+INR</Box>
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  {user?.role === "admin" ? (
                    <RHFAutocomplete
                      name="vendorId"
                      // type="country"
                      disabled={currentProduct}
                      label="Search & Select Designers"
                      placeholder="Search Designers"
                      url={"/vendors?limit=200&offset=0&status=Approved"}
                      filter="search"
                      fullWidth
                      getOptionLabel={(option) => `${option?.vendorName?.en}`}
                      renderOption={(props, option) => (
                        <li {...props} key={option?.id}>
                          <Typography
                            color={"primary"}
                            variant="subtitle2"
                            sx={{ fontStyle: "italic" }}
                          >{`${option?.vendorName?.en}`}</Typography>
                        </li>
                      )}
                    />
                  ) : (
                    <RHFTextField disabled name="vendor" label="Designer Name" value={user?.name} />
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFAutocomplete
                    name="categoriesIds"
                    placeholder="Add Categories"
                    multiple
                    disableCloseOnSelect
                    options={categories?.rows?.map((option) => option)}
                    getOptionLabel={(option) => option?.name?.en}
                    renderOption={(props, option) => (
                      <li {...props} key={option?.name?.en}>
                        {option?.name?.en}
                      </li>
                    )}
                    renderTags={(selected, getTagProps) =>
                      selected?.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option?.id}
                          label={option?.name?.en}
                          size="small"
                          color="primary"
                          variant="soft"
                        />
                      ))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFSwitch name="metadata.includesHijab" label="Includes Hijab ?" />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <RHFSelect name="metadata.fabric" label="Fabric">
                    {metaData?.Fabric?.flatMap((fab, i) => [
                      <MenuItem
                        key={`header-${i}`}
                        disabled
                        sx={{
                          fontWeight: "bold",
                          fontSize: "0.95rem",
                          opacity: 5,
                          backgroundColor: "#f5f5f5",
                          borderBottom: "1px solid #120404ff" // underline between header and items
                        }}
                      >
                        {fab?.name?.en} ({fab?.name?.ar})
                      </MenuItem>,
                      ...fab?.values?.map((val, j) => (
                        <MenuItem
                          key={`val-${i}-${j}`}
                          value={val?.en} // unique value
                        >
                          {val?.en} ({val?.ar})
                        </MenuItem>
                      ))
                    ])}
                  </RHFSelect>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <RHFSelect name="metadata.type" label="Product Type">
                    {metaData?.ProductType?.map((pt, index) => (
                      <MenuItem key={index + 1} value={pt}>
                        {pt}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <RHFSelect name="metadata.washingInstructions" label="Washing Instructions">
                    {metaData?.WashingInstructions?.map((w, index) => (
                      <MenuItem key={index + 1} value={w}>
                        {w}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <RHFSelect name="metadata.ironingInstructions" label="Iron Instructions">
                    {metaData?.IroningInstructions?.map((i, index) => (
                      <MenuItem key={index + 1} value={i}>
                        {i}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                </Grid>
              </Grid>
            )}

            {steps[activeStep] === "Availability" && (
              <>
                {values.readyToShip ? (
                  // Existing sizesAndColors fields
                  <>
                    {isLengthRequired && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          mb: 2 // add margin bottom to separate it from the fields
                        }}
                      >
                        <Typography variant="subtitle2" color="warning.main">
                          Note: Categories you have selected do not require length.
                        </Typography>
                      </Box>
                    )}
                    <Grid container spacing={2}>
                      {fields.map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                          <Card
                            sx={{
                              width: "100%",
                              minHeight: 280,
                              p: { xs: 2, sm: 3 },
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                              position: "relative"
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: 1
                              }}
                            >
                              <Typography variant="subtitle1" fontWeight="bold">
                                Enter Attribute Details
                              </Typography>

                              {index > 0 && (
                                <IconButton
                                  onClick={() => remove(index)}
                                  color="error"
                                  sx={{
                                    backgroundColor: "white",
                                    boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
                                    "&:hover": {
                                      backgroundColor: "rgba(255,0,0,0.1)"
                                    }
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              )}
                            </Box>

                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <RHFSelect
                                  name={`sizesAndColors.${index}.colorId`}
                                  label="Select Color"
                                >
                                  {attributes?.rows
                                    ?.filter((att) => att?.type === "color")
                                    .map((attribute) => (
                                      <MenuItem key={attribute?.id} value={attribute?.id}>
                                        {typeof attribute?.name === "object"
                                          ? `${attribute?.name?.en || ""} (${
                                              attribute?.name?.ar || ""
                                            })`
                                          : attribute?.name}
                                      </MenuItem>
                                    ))}
                                </RHFSelect>
                              </Grid>

                              <Grid item xs={12}>
                                <RHFSelect
                                  name={`sizesAndColors.${index}.sizeId`}
                                  label="Select Size"
                                >
                                  {attributes?.rows
                                    ?.filter((att) => att?.type === "size")
                                    .map((attribute) => (
                                      <MenuItem key={attribute?.id} value={attribute?.id}>
                                        {typeof attribute?.name === "object"
                                          ? `${attribute?.name?.en || ""} (${
                                              attribute?.name?.ar || ""
                                            })`
                                          : attribute?.name}
                                      </MenuItem>
                                    ))}
                                </RHFSelect>
                              </Grid>

                              {!isLengthRequired && (
                                <Grid item xs={12}>
                                  <RHFSelect
                                    name={`sizesAndColors.${index}.lengthId`}
                                    label="Select Length"
                                  >
                                    {attributes?.rows
                                      ?.filter((att) => att?.type === "length")
                                      .map((attribute) => (
                                        <MenuItem key={attribute?.id} value={attribute?.id}>
                                          {typeof attribute?.name === "object"
                                            ? `${attribute?.name?.en || ""}`
                                            : attribute?.name?.en}
                                        </MenuItem>
                                      ))}
                                  </RHFSelect>
                                </Grid>
                              )}

                              <Grid item xs={12}>
                                <RHFTextField
                                  name={`sizesAndColors.${index}.amount`}
                                  label="Quantity"
                                  maxLength={4}
                                  sx={{ minHeight: 72 }}
                                />
                              </Grid>
                            </Grid>
                          </Card>
                        </Grid>
                      ))}

                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<Add />}
                          onClick={() =>
                            append({
                              colorId: null,
                              sizeId: null,
                              lengthId: null,
                              amount: 1
                            })
                          }
                        >
                          Add More
                        </Button>
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  // ✅ If readyToShip is false → Show checkboxes for "color" type attributes
                  <>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Select available colors for customized product
                    </Typography>

                    {/* Show the error below Typography */}
                    <FormHelperText error sx={{ mb: 2 }}>
                      {methods?.formState?.errors?.supportedCustomAttributes?.message}
                    </FormHelperText>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      {attributes?.rows
                        ?.filter((att) => att?.type === "color")
                        .map((attribute, index) => (
                          <Grid item xs={6} sm={6} md={4} key={attribute?.id}>
                            <RHFCheckBox
                              name="supportedCustomAttributes"
                              label={
                                typeof attribute?.name === "object"
                                  ? `${attribute?.name?.en || ""} (${attribute?.name?.ar || ""})`
                                  : attribute?.name
                              }
                              value={attribute?.id} // each checkbox holds the attribute id
                              showError={index === 0}
                            />
                          </Grid>
                        ))}
                    </Grid>
                  </>
                )}
              </>
            )}

            {steps[activeStep] === "Images" && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box display={"flex"} flexDirection={"column"}>
                    <Typography variant="subtitle2">Main Image</Typography>
                    <RHFUpload
                      name="mainImage"
                      onDrop={(acceptedFiles) => handleDrop("mainImage", acceptedFiles)}
                      onDelete={() => handleRemoveFile("mainImage")}
                      helperText={
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 3,
                            mx: "auto",
                            display: "block",
                            textAlign: "center",
                            color: "text.disabled"
                          }}
                        >
                          Allowed *.jpeg, *.jpg, *.png
                        </Typography>
                      }
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="subtitle2">
                      Images ({`${values?.images?.length}/5`})
                    </Typography>
                    <RHFUpload
                      multiple
                      thumbnail
                      name="images"
                      onDrop={handleMultiDrop}
                      onRemove={handleMultiRemoveFile}
                      onRemoveAll={handleRemoveAllFiles}
                      onUpload={() => console.info("ON UPLOAD")}
                      helperText={
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 3,
                            mx: "auto",
                            display: "block",
                            textAlign: "center",
                            color: "text.disabled"
                          }}
                        >
                          Allowed *.jpeg, *.jpg, *.png
                          <br /> max images 5
                        </Typography>
                      }
                    />
                  </Box>
                </Grid>
              </Grid>
            )}
            {steps[activeStep] === "Review & Confirm" && (
              <ProductInfo
                name={values.name}
                description={values.description}
                price={values.price}
                serial={values.serial}
                vendor={values.vendorId}
                categoriesIds={values.categoriesIds}
                discountPrice={values.discountedPrice}
                sizesAndColors={values.sizesAndColors}
                mainImage={values.mainImage}
                images={values.images}
                delivery={values.etaDays}
                readyToShip={values.readyToShip}
                metaData={values.metadata}
                supportedCustomAttributes={values.supportedCustomAttributes}
              />
            )}
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            mt={4}
          >
            {/* Back Button */}
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="contained"
              fullWidth={true}
              sx={{ width: { sm: "auto" } }}
            >
              Back
            </Button>

            {/* Submit or Next Button */}
            {isLastStep ? (
              <LoadingButton
                type="submit"
                variant="contained"
                size="large"
                loading={isSubmitting}
                fullWidth
                sx={{ width: { sm: "auto" } }}
              >
                Confirm & Submit
              </LoadingButton>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                fullWidth
                disabled={!bool}
                sx={{ width: { sm: "auto" } }}
              >
                Next
              </Button>
            )}
          </Stack>
        </FormProvider>
      </Paper>
      <SuccessDialog
        open={dialog.value}
        onClose={() => {
          dialog.onFalse();
        }}
        title={currentProduct ? "Product updated successfully!!" : "Product added successfully!!"}
      />
    </>
  );
};

export default CreateProduct;
