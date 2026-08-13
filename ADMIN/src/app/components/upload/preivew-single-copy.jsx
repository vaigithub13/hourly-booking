import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'

import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import ListItemText from '@mui/material/ListItemText'

import { varFade } from '../animate'
import FileThumbnail, { fileData } from '../file-thumbnail'
import { fData } from 'app/utils/utils'
import { Icon } from '@mui/material'

// ----------------------------------------------------------------------

export default function SingleFilePreviewCopy({ file, onRemove, sx }) {
  const { key, name = '', size = 0 } = fileData(file)
  const isNotFormatFile = typeof file === 'string'
  return (
    <AnimatePresence initial={false}>
      <Stack
        key={key}
        component={motion.div}
        {...varFade().inUp}
        alignItems="center"
        display="inline-flex"
        justifyContent="center"
        sx={{
          m: 0.5,
          width: 80,
          height: 80,
          borderRadius: 1.25,
          overflow: 'hidden',
          position: 'relative',
          border: (theme) =>
            `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
          ...sx,
        }}
      >
        <FileThumbnail
          tooltip
          imageView
          file={file}
          sx={{ position: 'absolute' }}
          imgSx={{ position: 'absolute' }}
        />

        {onRemove && (
          <IconButton
            size="small"
            onClick={() => onRemove(file)}
            sx={{
              p: 0.5,
              top: 4,
              right: 4,
              position: 'absolute',
              color: 'common.white',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
              },
            }}
          >
            <Icon width={14}>close</Icon>
          </IconButton>
        )}
      </Stack>
    </AnimatePresence>
  )
}

SingleFilePreviewCopy.propTypes = {
  file: PropTypes.string,
  onRemove: PropTypes.func,
  sx: PropTypes.object,
  thumbnail: PropTypes.bool,
}
