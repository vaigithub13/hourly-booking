import React from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { Box } from '@mui/material'

const ProductImageSlider = ({ mainImage, images }) => {
  // Combine mainImage with the rest of the images
  const allImages = mainImage ? [mainImage, ...images] : images

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true, // ✅ Enable Auto Sliding
    autoplaySpeed: 1500, // ✅ 1 seconds delay
    pauseOnHover: true, // Optional: Stops autoplay when hovering
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 500,
        height: 300,
        mx: 'auto',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 3,
      }}
    >
      <Slider {...settings}>
        {allImages.map((img, index) => (
          <Box
            key={index}
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
            }}
          >
            <img
              src={img}
              alt={`Product ${index}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        ))}
      </Slider>
    </Box>
  )
}

export default ProductImageSlider
