import { useForm } from 'react-hook-form'
// import { yupResolver } from '@hookform/resolvers/yup'
import { LoadingButton } from '@mui/lab'
import { Box, Grid, MenuItem, Stack, Typography } from '@mui/material'
// import { postRequest } from 'app/utils/request'
// import { toast } from 'react-toastify'
import { useMemo } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useRouter } from 'app/hooks/useRouter'
// import { AdminSchema } from 'app/utils/schema'

import { RHFSelect, RHFTextField, RHFUpload } from 'app/components/hook-form'
import { useCallback } from 'react'
import { CommonDialouge } from 'app/components/CommonDialogue/CommonDialogue'
import { putRequest, postRequest } from 'app/utils/request'
import { useDataContext } from 'app/contexts/DataContext'
import { toast } from 'react-toastify'

// ----------------------------------------------------------------------

export default function AddFaqs({ currentFaq, open, onClose, ...other }) {
  const router = useRouter()
  const { faqs, setFaqs } = useDataContext()
  const defaultValues = useMemo(
    () => ({
      title: {
        en: '',
        ar: '',
      },

      question: {
        en: '',
        ar: '',
      },
      answer: {
        en: '',
        ar: '',
      },
    }),
    [currentFaq],
  )

  const methods = useForm({
    mode: 'onTouched',
    // resolver: yupResolver(AdminSchema(currentAdmin)),
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
    if (currentFaq) {
      // Reset to currentAdmin values when currentAdmin is present
      reset({
        title: {
          en: currentFaq?.title?.en || '',
          ar: currentFaq?.title?.ar || '',
        },

        question: {
          en: currentFaq?.question?.en || '',
          ar: currentFaq?.question?.ar || '',
        },
        answer: {
          en: currentFaq?.answer?.en || '',
          ar: currentFaq?.answer?.ar || '',
        },
      })
    } else {
      // Reset to default values when currentAdmin is null
      reset(defaultValues)
    }
  }, [currentFaq, defaultValues, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = currentFaq
        ? await putRequest(`/faqs/${currentFaq?.id}`, data)
        : await postRequest('/faqs/', data)
      if (res) {
        setFaqs(
          currentFaq
            ? faqs?.map((faq) =>
                faq?.id === currentFaq?.id
                  ? {
                      ...faq,
                      title: {
                        en: data?.title?.en,
                        ar: data?.title?.ar,
                      },
                      question: {
                        en: data?.question?.en,
                        ar: data?.question?.ar,
                      },
                      answer: {
                        en: data?.answer?.en,
                        ar: data?.answer?.ar,
                      },
                    }
                  : faq,
              )
            : [res?.data, ...faqs],
        )

        onClose()
        toast.success(
          currentFaq ? 'Updated Successfully!!' : 'Added Successfully!!',
        )
      }
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <CommonDialouge
      title={currentFaq ? 'Edit Faq' : 'Add Faq'}
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
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField
              name="title.en"
              label="Title in English"
              maxLength={100}
            />

            <div dir="rtl">
              <RHFTextField
                name="title.ar"
                label="العنوان باللغة العربية"
                maxLength={100}
              />
            </div>

            <RHFTextField
              name="question.en"
              label="Question in English"
              maxLength={100}
            />

            <div dir="rtl">
              <RHFTextField
                name="question.ar"
                label="سؤال باللغة العربية"
                maxLength={100}
              />
            </div>

            <RHFTextField
              name="answer.en"
              label="Description in English"
              multiline
              rows={4}
              maxLength={500}
            />

            <div dir="rtl">
              <RHFTextField
                name="answer.ar"
                label="الوصف باللغة العربية"
                multiline
                rows={4}
                maxLength={500}
              />
            </div>
          </Box>
        </Grid>
      </Grid>
    </CommonDialouge>
  )
}
