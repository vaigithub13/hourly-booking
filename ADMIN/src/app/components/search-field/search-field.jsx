import { Email, Person, ShoppingBasket } from '@mui/icons-material'
import { Icon, IconButton, InputAdornment, TextField } from '@mui/material'
import React from 'react'
import { useCallback } from 'react'
import { useState } from 'react'
import { useEffect } from 'react'

const SearchField = ({ setSearch, placeholder, label }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (label.includes('Email')) {
      if (value === '') {
        setError('')
      } else if (!validateEmail(value)) {
        setError('Invalid email address')
      } else {
        setError('')
      }
    }
  }

  const handleClear = useCallback(() => {
    setSearchTerm('')
    setError('')
  }, [searchTerm, error, setError, setSearchTerm])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!error) setSearch(searchTerm)
    }, 1500)

    return () => clearTimeout(timer)
  }, [searchTerm, error, setSearchTerm])

  return (
    <TextField
      label={label}
      placeholder={placeholder ? placeholder : 'Ex. John'}
      value={searchTerm}
      onChange={handleChange}
      error={!!error}
      helperText={error}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {label?.includes('Email') ? (
              <Email />
            ) : label?.includes('Products') ? (
              <ShoppingBasket />
            ) : (
              <Person />
            )}
          </InputAdornment>
        ),
        endAdornment: searchTerm && (
          <InputAdornment position="end">
            <IconButton size="small" color="primary" onClick={handleClear}>
              <Icon>clear</Icon>
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  )
}

export default SearchField
