import { useForm, useFieldArray } from 'react-hook-form'
import { Box, Button, Grid, IconButton, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useEffect } from 'react'

import { RHFTextField, RHFUpload } from 'app/components/hook-form'
import { useCallback } from 'react'

import { useDataContext } from 'app/contexts/DataContext'
import {
  patchRequest,
  postRequest,
  putRequest,
  UploadFiles,
} from 'app/utils/request'
import { toast } from 'react-toastify'
import { yupResolver } from '@hookform/resolvers/yup'
import { SizeGuideSchema } from 'app/utils/Schema'
import { CommonDialouge } from 'app/components/CommonDialogue/CommonDialogue'
import { Add, Delete } from '@mui/icons-material'

// ----------------------------------------------------------------------

const BodyPartsFields = ({ control, sizeIndex }) => {
  const {
    fields: bodyPartsFields,
    append: addBodyPart,
    remove: removeBodyPart,
  } = useFieldArray({
    control,
    name: `sizeGuide.${sizeIndex}.bodyParts`,
  })

  return (
    <Stack spacing={2} mt={2}>
      {bodyPartsFields.map((bodyPart, bodyIndex) => (
        <Box
          key={bodyPart.id}
          sx={{ p: 2, border: '1px dashed #ddd', borderRadius: 2 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Box
                columnGap={2}
                rowGap={3}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(2, 1fr)',
                  md: 'repeat(5, 1fr)',
                }}
              >
                {/* Body Part Name */}
                <RHFTextField
                  name={`sizeGuide.${sizeIndex}.bodyParts.${bodyIndex}.name.en`}
                  label="Body Part (EN)"
                  maxLength={100}
                />
                <div dir="rtl">
                  <RHFTextField
                    name={`sizeGuide.${sizeIndex}.bodyParts.${bodyIndex}.name.ar`}
                    label="اسم جزء الجسم (AR)"
                    maxLength={100}
                  />
                </div>

                <RHFTextField
                  name={`sizeGuide.${sizeIndex}.bodyParts.${bodyIndex}.measurements.cm`}
                  label="Measurement in Cm"
                  type="number"
                  maxLength={7}
                />

                <RHFTextField
                  name={`sizeGuide.${sizeIndex}.bodyParts.${bodyIndex}.measurements.inch`}
                  label="Measurement in Inch"
                  type="number"
                  maxLength={7}
                />
                <Button
                  onClick={() => removeBodyPart(bodyIndex)}
                  startIcon={<Delete />}
                  color="error"
                >
                  Remove
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      ))}

      {/* Add Body Part Button */}
      <Button
        onClick={() =>
          addBodyPart({
            name: { en: '', ar: '' },
            measurements: { cm: 0, inch: 0 },
          })
        }
        startIcon={<Add />}
      >
        Add Body Part
      </Button>
    </Stack>
  )
}

export default function AddSizeGuide({
  currentSizeGuide,
  open,
  onClose,
  ...other
}) {
  const { setSizeGuide } = useDataContext()
  const defaultValues = useMemo(
    () => ({
      sizeGuide: [
        {
          sizeName: { en: '', ar: '' },

          bodyParts: [
            { name: { en: '', ar: '' }, measurements: { cm: 0, inch: 0 } },
          ],
        },
      ],
      description: { en: '', ar: '' },
    }),
    [currentSizeGuide],
  )

  const methods = useForm({
    mode: 'onTouched',
    resolver: yupResolver(SizeGuideSchema),
    defaultValues,
  })

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods

  const {
    fields: sizeFields,
    append: addSize,
    remove: removeSize,
  } = useFieldArray({
    control,
    name: 'sizeGuide',
  })

  const values = watch()
  useEffect(() => {
    if (currentSizeGuide) {
      // Reset to currentAdmin values when currentAdmin is present
      reset({
        sizeGuide: currentSizeGuide?.sizeGuide,
        description: {
          en: currentSizeGuide?.description?.en,
          ar: currentSizeGuide?.description?.ar,
        } || [
          {
            sizeName: { en: '', ar: '' },
            bodyParts: [
              { name: { en: '', ar: '' }, measurements: { cm: 0, inch: 0 } },
            ],
          },
        ],
      })
    } else {
      // Reset to default values when currentAdmin is null
      reset(defaultValues)
    }
  }, [currentSizeGuide, defaultValues, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await putRequest('/size-guides', data)
      if (res) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setSizeGuide(res?.data)
        reset(defaultValues)
        onClose()
        toast.success(
          currentSizeGuide ? 'Updated Successfully!!' : 'Added Successfully!!',
        )
      }
    } catch (error) {
      setSizeGuide(currentSizeGuide)
      console.error(error)
    }
  })

  return (
    <CommonDialouge
      title={currentSizeGuide ? 'Edit Size Guide' : 'Add Size Guide'}
      open={open}
      size={'lg'}
      onClose={onClose}
      methods={methods}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      reset={reset}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Stack spacing={3}>
            <Box display="flex" justifyContent="space-between" gap={1}>
              {/* Add Size Button */}
              <Typography
                variant="caption"
                sx={{ pl: 4, color: 'text.primary' }}
              >
                Note: Make sure to provide same body parts name for all sizes.
              </Typography>
              <Button
                onClick={() =>
                  addSize({
                    sizeName: { en: '', ar: '' },

                    bodyParts: [],
                  })
                }
                startIcon={<Add />}
                variant="contained"
                size="small"
              >
                Add Size
              </Button>
            </Box>

            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField
                name={`description.en`}
                label="Description (EN)"
                maxLength={500}
                multiline
                rows={3}
              />

              <div dir="rtl">
                <RHFTextField
                  name={`description.ar`}
                  label="الوصف (بالإنكليزية)"
                  maxLength={500}
                  multiline
                  rows={3}
                />
              </div>
            </Box>
            {sizeFields.map((size, sizeIndex) => (
              <Box
                key={size.id}
                sx={{
                  p: 3,
                  pt: 5,
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  position: 'relative',
                }}
              >
                {/* Remove Button Inside Each Size Section (Top Right) */}
                {sizeIndex > 0 && (
                  <IconButton
                    onClick={() => removeSize(sizeIndex)}
                    color="error"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 8,
                      mb: 2,
                      background: '#fff', // White background to avoid visual clash
                      boxShadow: 1, // Slight shadow for better visibility
                      '&:hover': { background: '#f8d7da' }, // Light red on hover
                    }}
                  >
                    <Delete />
                  </IconButton>
                )}
                <Box
                  columnGap={2}
                  rowGap={3}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    md: 'repeat(2, 1fr)',
                  }}
                >
                  {/* Size Name */}
                  <RHFTextField
                    name={`sizeGuide.${sizeIndex}.sizeName.en`}
                    label="Size Name (EN)"
                    maxLength={20}
                  />
                  <div dir="rtl">
                    <RHFTextField
                      name={`sizeGuide.${sizeIndex}.sizeName.ar`}
                      label="اسم المقاس (AR)"
                      maxLength={20}
                    />
                  </div>
                </Box>

                {/* Body Parts Section */}
                <BodyPartsFields control={control} sizeIndex={sizeIndex} />

                {/* Remove Size Button
                {sizeIndex > 0 && (
                  <Button
                    onClick={() => removeSize(sizeIndex)}
                    startIcon={<Delete />}
                    color="error"
                    sx={{ mt: 2 }}
                  >
                    Remove Size
                  </Button>
                )} */}
              </Box>
            ))}

            {/* Add Size Button
            <Button
              onClick={() =>
                addSize({ sizeName: { en: '', ar: '' }, bodyParts: [] })
              }
              startIcon={<Add />}
            >
              Add Size
            </Button> */}
          </Stack>
        </Grid>
      </Grid>
    </CommonDialouge>
  )
}
