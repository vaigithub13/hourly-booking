import PropTypes from 'prop-types'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

// ----------------------------------------------------------------------

export default function EmptyContent({
  title,
  imgUrl,
  action,
  filled,
  sx,
  ...other
}) {
  return (
    <Stack
      flexGrow={1}
      alignItems="center"
      justifyContent="center"
      sx={{
        px: 3,
        height: 1,
        ...(filled && {
          borderRadius: 2,
          bgcolor: '#f3f3f3',
          border: `dashed 1px #f3f3f3`,
        }),
        ...sx,
      }}
      {...other}
    >
      <Box
        component="img"
        alt="empty content"
        src={imgUrl || '/assets/icons/empty/ic_content.svg'}
        sx={{ width: 1, maxWidth: 160 }}
      />

      {title && (
        <Typography
          variant="h6"
          component="span"
          sx={{ mt: 1, color: 'text.disabled', textAlign: 'center' }}
        >
          {title}
        </Typography>
      )}

      {action && action}
    </Stack>
  )
}

EmptyContent.propTypes = {
  action: PropTypes.node,
  filled: PropTypes.bool,
  imgUrl: PropTypes.string,
  sx: PropTypes.object,
  title: PropTypes.string,
}
