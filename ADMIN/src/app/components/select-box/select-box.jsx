import { Box, Chip, InputLabel, MenuItem, Select } from '@mui/material'
import React from 'react'
import Label from '../label'
import { statusColorMap } from '../../utils/utils'

const statusColor = {
  Pending: 'secondary',
  Rejected: 'error',
  Approved: 'success',
}

const SelectBox = ({ id, label, menuProp, value, data, setState }) => {
  const renderSelectedChips = (selected) => {
    if (selected.length === 0) {
      return <Chip color="primary" label="All / الجميع" size="small" />
    }

    const selectedItems = data.filter((item) => selected.includes(item.id))

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selectedItems.map((item) => (
          <Chip
            color="primary"
            size="small"
            key={item.id}
            label={
              typeof item.name === 'object'
                ? `${item.name.en} / ${item.name.ar}`
                : item.name
            }
            onMouseDown={(event) => {
              // prevent Select from closing when clicking on chip
              event.stopPropagation()
            }}
            onDelete={() => setState(selected.filter((id) => id !== item.id))}
          />
        ))}
      </Box>
    )
  }

  const isCategory = id === 'categoryId'
  const selected = isCategory
    ? Array.isArray(value)
      ? value
      : []
    : value ?? ''

  const handleChange = (e) => {
    const val = e.target.value

    // For categoryId, if 'All' (0) is selected, reset to empty
    if (isCategory && val.includes(0)) {
      setState([])
    } else {
      setState(val)
    }
  }
  return (
    <>
      <InputLabel id={id} shrink>
        {label}
      </InputLabel>
      <Select
        labelId={id}
        id={id}
        multiple={isCategory}
        value={selected}
        onChange={handleChange}
        label={label}
        MenuProps={menuProp}
        displayEmpty={isCategory}
        renderValue={
          isCategory ? (selected) => renderSelectedChips(selected) : undefined
        }
      >
        {!isCategory && <MenuItem value={0}>{'All'}</MenuItem>}
        {data?.map((d) => (
          <MenuItem value={id === 'userId' || isCategory ? d?.id : d?.status}>
            {id === 'userId' ? (
              d?.fullName
            ) : isCategory ? (
              `${typeof d?.name === 'object' ? d?.name?.en : d?.name} / ${
                typeof d?.name === 'object' ? d?.name?.ar : d?.name
              } `
            ) : id === 'status' || id === 'statusId' ? (
              <Label
                variant="soft"
                color={
                  id === 'statusId'
                    ? statusColor[d?.key]
                    : statusColorMap[d?.status]
                }
              >
                {id === 'satusID' ? d?.key : d?.status}
              </Label>
            ) : (
              d?.key
            )}
          </MenuItem>
        ))}
      </Select>
    </>
  )
}

export default SelectBox
