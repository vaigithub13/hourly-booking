import PropTypes from 'prop-types'
import { Controller, useFormContext } from 'react-hook-form'

import TextField from '@mui/material/TextField'

// ----------------------------------------------------------------------

export default function RHFTextField({
  name,
  helperText,
  InputLabelProps,
  maxLength,
  type,
  ...other
}) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          sx={{
            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
              display: 'none',
            },
            '& input[type=number]': {
              MozAppearance: 'textfield',
            },
          }}
          {...field}
          fullWidth
          type={type}
          value={type === 'number' && field.value === 0 ? '' : field.value}
          onChange={(event) => {
            const value = event.target.value
            if (type === 'number') {
              if (/^\d*\.?\d*$/.test(value)) {
                if (!maxLength || value.length <= maxLength) {
                  field.onChange(value)
                }
              }
            } else {
              if (!maxLength || value.length <= maxLength) {
                field.onChange(value)
              }
            }
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          InputLabelProps={InputLabelProps}
          inputProps={{ maxLength }}
          {...other}
        />
      )}
    />
  )
}

RHFTextField.propTypes = {
  helperText: PropTypes.object,
  InputLabelProps: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string,
  maxLength: PropTypes.number,
}
