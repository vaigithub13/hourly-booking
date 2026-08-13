import { Avatar, Skeleton } from '@mui/material'
import React, { useState } from 'react'
import { useEffect } from 'react'

const MyAvatar = ({ image, name, onClick }) => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!image) {
      setLoading(false) // If no image, no need to show skeleton
    }
  }, [image])

  return (
    <>
      {loading && (
        <Skeleton variant="rounded" width={48} height={48} sx={{ mr: 1 }} />
      )}
      <Avatar
        alt={name}
        src={image}
        variant="rounded"
        sx={{
          width: 48,
          height: 48,
          mr: 1,
          cursor: typeof onClick === 'function' && 'pointer',
          display: loading ? 'none' : 'block', // Hide Avatar until loaded
        }}
        onClick={onClick}
        onLoad={() => setLoading(false)} // Set loading to false once the image loads
        onError={() => setLoading(false)} // Also hide the skeleton if the image fails to load
      />
    </>
  )
}

export default MyAvatar
