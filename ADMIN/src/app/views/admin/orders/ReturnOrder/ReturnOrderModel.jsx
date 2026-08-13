import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
  Box,
  TextField,
  Skeleton,
} from '@mui/material'
import { Add, Close, Remove } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import { getRequest, postRequest } from 'app/utils/request'
import { useBoolean } from 'app/hooks/useBoolean'
import { LoadingButton } from '@mui/lab'
import { toast } from 'react-toastify'

const ReturnOrderModel = ({ open, onClose, orderId, fetchOrders }) => {
  const bool = useBoolean()
  const [orderData, setOrderData] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchOrderData = async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/order/${orderId}`) // You pass this as prop
      setOrderData(res?.data)
      const initial = res?.data?.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        selected: false,
        max: item.quantity,
        sku: item?.sku?.id,
      }))
      setSelectedItems(initial)
    } catch (error) {
      console.error('Failed to fetch order data', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchOrderData()
    }
  }, [open])

  const handleSelectAll = (e) => {
    const checked = e.target.checked
    setSelectAll(checked)
    setSelectedItems((prev) =>
      prev.map((item) => ({ ...item, selected: checked })),
    )
  }

  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item,
      ),
    )
  }

  const handleQuantityChange = (id, delta) => {
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, Math.min(item.quantity + delta, item.max))
          return { ...item, quantity: newQty }
        }
        return item
      }),
    )
  }

  const handleSubmit = async () => {
    const selected = selectedItems
      .filter((item) => item.selected && item.quantity > 0)
      .map((item) => ({
        id: item?.sku,
        quantity: item?.quantity,
      }))

    const data = {
      products: selected,
      userAddressId: orderData.userAddress.id,
      images: [],
    }
    bool.onTrue()
    const res = await postRequest(`/order/${orderId}/return`, data)
    if (res) {
      toast.success('Return Created Successfully!!')
      await fetchOrders()
    }
    onClose()
    bool.onFalse()
    setSelectedItems([])
    setSelectAll(false)
  }

  const renderSkeletonItem = () => (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      p={2}
      borderBottom="1px solid #eee"
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="rectangular" width={80} height={80} />
        <Box>
          <Skeleton variant="text" width={120} height={20} />
          <Skeleton variant="text" width={100} height={16} />
        </Box>
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="rectangular" width={40} height={40} />
        <Skeleton variant="circular" width={32} height={32} />
      </Box>
    </Box>
  )

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box display={'flex'} justifyContent={'space-between'}>
        <DialogTitle>Select Items to Return</DialogTitle>
        <IconButton size="small" onClick={() => onClose()}>
          <Close />
        </IconButton>
      </Box>
      <DialogContent dividers>
        {loading ? (
          <>
            {Array.from({ length: 2 }).map((_, i) => (
              <Box key={i}>{renderSkeletonItem()}</Box>
            ))}
          </>
        ) : (
          <>
            <FormControlLabel
              control={
                <Checkbox checked={selectAll} onChange={handleSelectAll} />
              }
              label="Select All"
            />
            {orderData?.items?.map((item) => {
              const selectedItem = selectedItems.find((i) => i.id === item.id)
              return (
                <Box
                  key={item.id}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  p={2}
                  borderBottom="1px solid #eee"
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Checkbox
                      checked={selectedItem?.selected || false}
                      onChange={() => handleSelectItem(item.id)}
                    />
                    <img
                      src={
                        item?.sku
                          ? item.sku.product.mainImage
                          : item?.product?.mainImage
                      }
                      alt=""
                      style={{ width: 80, height: 80, objectFit: 'cover' }}
                    />
                    <Box>
                      <Typography variant="subtitle1">
                        {item?.sku
                          ? item.sku.product.name
                          : item?.product?.name?.en}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Size:{' '}
                        {item?.sku
                          ? item.sku.size.name.en
                          : item?.size?.name?.en}{' '}
                        | Color:{' '}
                        {item?.sku
                          ? item.sku.color.name.en
                          : item?.color?.name?.en}{' '}
                        | Length:{' '}
                        {item?.sku
                          ? item.sku.length.en
                          : item?.length?.en || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton
                      onClick={() => handleQuantityChange(item.id, -1)}
                      disabled={selectedItem?.quantity === 0}
                    >
                      <Remove />
                    </IconButton>
                    <TextField
                      size="small"
                      value={selectedItem?.quantity || 0}
                      inputProps={{
                        readOnly: true,
                        style: { width: 40, textAlign: 'center' },
                      }}
                    />
                    <IconButton
                      onClick={() => handleQuantityChange(item.id, 1)}
                      disabled={selectedItem?.quantity >= selectedItem?.max}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Box>
              )
            })}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton
          variant="text"
          onClick={handleSubmit}
          loading={bool.value}
          disabled={loading || selectedItems.every((item) => !item.selected)}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default ReturnOrderModel
