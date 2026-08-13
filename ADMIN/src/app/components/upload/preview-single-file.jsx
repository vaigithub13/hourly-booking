import PropTypes from 'prop-types'

import Box from '@mui/material/Box'

import Image from '../image'
import { styled } from '@mui/material'

// ----------------------------------------------------------------------
const ImageGridBox = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '150px', // Fixed height for the image section
  display: 'flex',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
}))

// Styled component for the image inside the grid box
const StyledImage = styled('img')(({ theme, pdf }) => ({
  width: '80%',
  height: '80%',
  objectFit: pdf ? 'contain' : 'cover', // 'contain' for PDFs, 'cover' for images
}))
export default function SingleFilePreview({ fileUrl = '', fileType }) {
  const isPdf = fileType?.endsWith('pdf')
  return isPdf ? (
    <ImageGridBox>
      <StyledImage src={'/assets/images/icon-pdf.png'} alt="pdf" pdf />
    </ImageGridBox>
  ) : (
    <Box
      sx={{
        p: 1,
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        position: 'absolute',
      }}
    >
      <Image
        alt="file preview"
        src={fileUrl}
        sx={{
          width: 1,
          height: '1',
          borderRadius: 1,
        }}
      />
    </Box>
  )
}

SingleFilePreview.propTypes = {
  fileUrl: PropTypes.string,
}
