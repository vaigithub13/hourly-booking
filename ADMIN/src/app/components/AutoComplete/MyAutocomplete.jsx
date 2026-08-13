import { Person } from '@mui/icons-material'
import {
  Autocomplete,
  Avatar,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { useRouter } from 'app/hooks/useRouter'
import { getRequest } from 'app/utils/request'
import React from 'react'
import { useCallback } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

const MyAutocomplete = ({ url, label, setState, placeholder }) => {
  const router = useRouter()
  const [options, setOptions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState(null)
  const [inputValue, setInputValue] = useState('')

  const fetchOptions = useCallback(
    async (value) => {
      setLoading(true)
      const res = await getRequest(`${url}&search=${value}`, router)
      setLoading(false)
      setOptions(
        res?.data?.rows?.length > 0
          ? res?.data?.rows
          : [{ fullName: 'No results found', isNoResults: true }],
      )

      setOpen(true) // Open dropdown when options are fetched
    },
    [url, router], // Dependencies for useCallback
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue) {
        fetchOptions(inputValue)
      } else {
        setOptions([])
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [inputValue, fetchOptions])

  useEffect(() => {
    if (!open) {
      setOptions([])
    }
  }, [open])

  return (
    <Autocomplete
      id="autocomplete-demo"
      open={open}
      onOpen={() => {
        if (options?.length > 0) {
          setOpen(true)
        }
      }}
      onClose={() => {
        setOpen(false)
      }}
      getOptionLabel={(option) =>
        option.isNoResults
          ? option?.ownerName?.en
          : label?.includes('Customer')
          ? `${option?.firstName} ${option?.lastName}`
          : `${option?.ownerName?.en} (${option?.ownerName?.ar})` || ''
      }
      filterOptions={(x) => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      noOptionsText={'No Results found'}
      value={value}
      loading={loading}
      onChange={(event, newValue) => {
        // console.log(newValue)
        setValue(newValue)
        setState(newValue ? newValue?.id : 0)
        setInputValue('') // Clear input after selection
        setOpen(false) // Close dropdown after selecting an option
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue)
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            ),
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}

                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
          placeholder={placeholder}
          fullWidth
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          {option.isNoResults ? (
            <Typography variant="body2" sx={{ ml: 2 }}>
              No results found
            </Typography>
          ) : (
            <Grid container alignItems="center">
              <Grid item>
                <Avatar
                  src={
                    label?.includes('Customer')
                      ? option?.profilePicture
                      : option?.logo
                  }
                  alt={
                    label?.includes('Customer')
                      ? `${option?.firstName} ${option?.lastName}`
                      : option?.ownerName?.en
                  }
                />
              </Grid>
              <Grid item sx={{ ml: 2 }}>
                <Typography variant="body2">
                  {label?.includes('Customer')
                    ? `${option?.firstName} ${option?.lastName}`
                    : `${option?.ownerName?.en} (${option?.ownerName?.ar})`}
                </Typography>
              </Grid>
            </Grid>
          )}
        </li>
      )}
    />
  )
}

export default React.memo(MyAutocomplete)
