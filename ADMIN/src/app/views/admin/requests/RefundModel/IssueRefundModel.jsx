import { useForm } from 'react-hook-form'
import {
  Box,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import { useEffect } from 'react'

import { RHFSelect, RHFTextField, RHFUpload } from 'app/components/hook-form'
import { useCallback } from 'react'

import { useDataContext } from 'app/contexts/DataContext'
import { patchRequest, postRequest, UploadFiles } from 'app/utils/request'
import { toast } from 'react-toastify'
import { yupResolver } from '@hookform/resolvers/yup'
import { CategorySchema, RefundSchema } from 'app/utils/Schema'
import { CommonDialouge } from 'app/components/CommonDialogue/CommonDialogue'
import RHFCheckBox from 'app/components/hook-form/rhf-checkbox'

// ----------------------------------------------------------------------

export default function IssueRefundModel({
  open,
  onClose,
  orderValue,
  id,
  setRequestUpdate,
  isReturn = false,
  ...other
}) {
  const { refundTarget } = useDataContext()
  const defaultValues = useMemo(
    () => ({
      refundTarget: 'Wallet',
      walletRefundValue: 0,
    }),
    [],
  )

  const methods = useForm({
    mode: 'onTouched',
    resolver: yupResolver(RefundSchema(orderValue)),
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
    // Reset to default values when currentAdmin is null
    reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isReturn) {
        data.amount = data.walletRefundValue
        delete data.walletRefundValue
      }
      const res = await patchRequest(
        isReturn
          ? `/order/return/${id}/change-refund-method`
          : `/order/set-refund-target/${id}`,
        data,
      )
      if (res) {
        setRequestUpdate(data.refundTarget)
        onClose()
        toast.success('Refund Issued Successfully')
      }
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <CommonDialouge
      title={'Issue Refund'}
      open={open}
      onClose={onClose}
      methods={methods}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      reset={reset}
      buttonText="Submit"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Stack spacing={3}>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
              }}
            >
              {/* <RHFSelect name="refundTarget" label="Select Refund Mode">
                {refundTarget
                  ?.filter((target) => target !== 'PENDING')
                  ?.map((refund, index) => (
                    <MenuItem key={index + 1} value={refund}>
                      {refund}
                    </MenuItem>
                  ))}
              </RHFSelect> */}
              {refundTarget?.map((target) => {
                const isSelected = values.refundTarget === target
                const label =
                  target === 'Original Payment Method'
                    ? 'Paid by SkipCash'
                    : target

                return (
                  <Box key={target} sx={{ mb: 1 }}>
                    <RHFCheckBox
                      key={target}
                      name="refundTarget"
                      label={label}
                      value={target}
                    />
                    {isSelected && (
                      <Typography
                        variant="caption"
                        sx={{ pl: 4, color: 'text.primary' }}
                      >
                        {target === 'Wallet'
                          ? 'Note: Money will be credited to wallet within the system.'
                          : 'Note: Make sure refund must be processed from skipcash to original payment method to the customer.'}
                      </Typography>
                    )}
                  </Box>
                )
              })}

              <RHFTextField
                name="walletRefundValue"
                label="Refund Value"
                type="number"
                disabled={values.refundTarget !== 'Wallet'}
                maxLength={4}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <div style={{ paddingRight: 8, fontWeight: 'bold' }}>
                        INR
                      </div>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </CommonDialouge>
  )
}
