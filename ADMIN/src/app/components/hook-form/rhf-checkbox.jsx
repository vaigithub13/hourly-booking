import PropTypes from 'prop-types'
import { Controller, useFormContext } from 'react-hook-form'

import Checkbox from '@mui/material/Checkbox'
import FormHelperText from '@mui/material/FormHelperText'
import FormControlLabel from '@mui/material/FormControlLabel'

// ----------------------------------------------------------------------

export default function RHFCheckBox({
  name,
  label,
  value,
  showError = false,
  helperText,
  ...other
}) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={
                  Array.isArray(field.value)
                    ? field.value.includes(value) // case 1: multi-select
                    : name === 'refundTarget'
                    ? field.value === value // case 2: radio-like
                    : Boolean(field.value) // case 3: boolean
                }
                onChange={(e) => {
                  if (Array.isArray(field.value)) {
                    // Multi-select array
                    if (e.target.checked) {
                      field.onChange([...field.value, value])
                    } else {
                      field.onChange(field.value.filter((v) => v !== value))
                    }
                  } else if (name === 'refundTarget') {
                    // Radio-like
                    field.onChange(value)
                  } else {
                    // Boolean toggle
                    field.onChange(e.target.checked)
                  }
                }}
              />
            }
            label={label}
            {...other}
          />

          {/* {showError && (!!error || helperText) && (
            <FormHelperText error={!!error}>
              {error ? error?.message : helperText}
            </FormHelperText>
          )} */}
        </div>
      )}
    />
  )
}

RHFCheckBox.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  helperText: PropTypes.string,
}
