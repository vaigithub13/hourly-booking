import { ListItemText } from '@mui/material'
import React from 'react'

const ListItem = ({
  primaryText,
  secondaryText,
  primaryProps,
  primaryWidth,
  secondaryWidth,
  secondayProps,
}) => {
  return (
    <ListItemText
      primary={primaryText}
      secondary={secondaryText}
      primaryTypographyProps={{
        ...primaryProps,
        typography: 'subtitle2',
        style: {
          whiteSpace: 'normal',
          width: primaryWidth || 'auto',
          overflowWrap: 'break-word',
        },
      }}
      secondaryTypographyProps={{
        ...secondayProps,
        component: 'span',
        style: {
          whiteSpace: 'normal',
          width: secondaryWidth || 'auto',
          overflowWrap: 'break-word',
        },
      }}
      sx={{ display: 'flex', flexDirection: 'column' }}
    />
  )
}

export default ListItem
