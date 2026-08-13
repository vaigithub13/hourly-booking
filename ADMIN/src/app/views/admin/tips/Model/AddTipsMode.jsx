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
import { TipsSchema } from 'app/utils/Schema'
import { CommonDialouge } from 'app/components/CommonDialogue/CommonDialogue'
import { Add, Delete } from '@mui/icons-material'

// ----------------------------------------------------------------------

const labelsMap = {
  fabricCare: {
    en: ['Ironing/Steaming', 'Important Tips'],
    ar: ['الكي / البخار', 'نصائح مهمة'],
  },
  washingMethods: {
    en: ['Description', 'Best For'],
    ar: ['الوصف', 'الأفضل لـ'],
  },
}

const titleMap = {
  fabricCare: {
    en: 'Fabric Type',
    ar: 'نوع القماش',
  },
  washingMethods: {
    en: 'Washing Method',
    ar: 'طريقة الغسيل',
  },
}

const ValuesFieldArray = ({ parentName, control, section }) => {
  const { fields } = useFieldArray({
    control,
    name: parentName,
  })

  return (
    <Stack spacing={2}>
      {fields.slice(0, 2).map((field, index) => (
        <Grid container spacing={2} key={field.id}>
          <Grid item xs={6}>
            <RHFTextField
              name={`${parentName}[${index}].en`}
              label={`${labelsMap[section]?.en[index]}`}
              maxLength={500}
              rows={3}
              multiline
            />
          </Grid>
          <Grid item xs={6}>
            <div dir="rtl">
              <RHFTextField
                name={`${parentName}[${index}].ar`}
                label={`${labelsMap[section]?.ar[index]}`}
                maxLength={500}
                rows={3}
                multiline
              />
            </div>
          </Grid>
        </Grid>
      ))}
    </Stack>
  )
}

const FieldSection = ({ name, control }) => {
  const { fields, append, remove } = useFieldArray({ control, name })

  return (
    <Stack spacing={3}>
      {fields?.map((item, index) => (
        <Box
          key={item.id}
          sx={{ border: '1px solid #ccc', p: 2, borderRadius: 2 }}
        >
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            mb={2}
          >
            {/* <Typography variant="subtitle1">{titleMap[name]}</Typography> */}
            <IconButton
              color="error"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              <Delete />
            </IconButton>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <RHFTextField
                name={`${name}[${index}].key.en`}
                label={`${titleMap[name]?.en}`}
                maxLength={100}
              />
            </Grid>
            <Grid item xs={6}>
              <div dir="rtl">
                <RHFTextField
                  name={`${name}[${index}].key.ar`}
                  label={`${titleMap[name]?.ar}`}
                  maxLength={100}
                />
              </div>
            </Grid>
          </Grid>

          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Values
            </Typography>
            <ValuesFieldArray
              parentName={`${name}[${index}].values`}
              control={control}
              section={name}
            />
          </Box>
        </Box>
      ))}

      {/* Add New Section Button */}
      <Button
        variant="outlined"
        startIcon={<Add />}
        onClick={() =>
          append({
            key: { en: '', ar: '' },
            values: [
              { en: '', ar: '' },
              { en: '', ar: '' }, // force exactly 2 values when added
            ],
          })
        }
      >
        Add New {titleMap[name]?.en}
      </Button>
    </Stack>
  )
}

export default function AddTips({ currentTips, open, onClose, ...other }) {
  const { setTips } = useDataContext()
  const defaultValues = useMemo(
    () => ({
      fabricCare: [
        {
          key: {
            en: '',
            ar: '',
          },
          values: [
            {
              en: '',
              ar: '',
            },
            {
              en: '',
              ar: '',
            },
          ],
        },
      ],
      washingMethods: [
        {
          key: {
            en: '',
            ar: '',
          },
          values: [
            {
              en: '',
              ar: '',
            },
            {
              en: '',
              ar: '',
            },
          ],
        },
      ],
    }),
    [],
  )

  const methods = useForm({
    mode: 'onTouched',
    resolver: yupResolver(TipsSchema),
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

  const values = watch()
  useEffect(() => {
    if (currentTips) {
      // Reset to currentAdmin values when currentAdmin is present

      reset({
        fabricCare: currentTips?.fabricCare || [
          {
            key: {
              en: '',
              ar: '',
            },
            values: [
              {
                en: '',
                ar: '',
              },
            ],
          },
        ],
        washingMethods: currentTips?.washingMethods || [
          {
            key: {
              en: '',
              ar: '',
            },
            values: [
              {
                en: '',
                ar: '',
              },
            ],
          },
        ],
      })
    } else {
      // Reset to default values when currentAdmin is null
      reset(defaultValues)
    }
  }, [currentTips, defaultValues, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await putRequest('/tips', data)
      if (res) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setTips(res?.data)
        reset(defaultValues)
        onClose()
        toast.success(
          currentTips ? 'Updated Successfully!!' : 'Added Successfully!!',
        )
      }
    } catch (error) {
      setTips(currentTips)
      console.error(error)
    }
  })

  return (
    <CommonDialouge
      title={currentTips ? 'Edit Tips' : 'Add Tips'}
      open={open}
      size={'lg'}
      onClose={onClose}
      methods={methods}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      reset={reset}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6">Washing Methods</Typography>
          <FieldSection name="washingMethods" control={control} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Fabric Care</Typography>
          <FieldSection name="fabricCare" control={control} />
        </Grid>
      </Grid>
    </CommonDialouge>
  )
}
