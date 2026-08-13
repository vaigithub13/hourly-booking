import {
  Box,
  Icon,
  Table,
  styled,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Stack,
  Avatar,
  Typography,
  Tooltip,
  Button,
  ListItemText,
  Skeleton,
} from '@mui/material'
import { ConfirmDialog } from 'app/components/custom-dialog'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useDataContext } from 'app/contexts/DataContext'
import { useBoolean } from 'app/hooks/useBoolean'
import { useRouter } from 'app/hooks/useRouter'
import { deleteRequest, patchRequest } from 'app/utils/request'
import { useCallback } from 'react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { TableNoData } from 'app/components/table'
import Label from 'app/components/label'
import CommonButton from 'app/components/common-button'
import MyAvatar from 'app/components/common-avatar/avatar'
import ListItem from 'app/components/listitemtext/ListItem'
import ImagePopup from 'app/components/ImageModel/ImagePopup'

// STYLED COMPONENT
const StyledTable = styled(Table)(({ theme }) => ({
  whiteSpace: 'pre',
  '& thead': {
    '& tr': {
      '& th': {
        paddingLeft: 10,
        background: 'rgba(191, 167, 93, 0.8)',
        color: 'white',
      },
    },
  },
  '& tbody': {
    '& tr': { '& td': { paddingLeft: 10, textTransform: 'capitalize' } },
  },
}))

const TableRowsLoader = ({ rowsNum }) => {
  return [...Array(rowsNum)].map((row, index) => (
    <TableRow key={index}>
      <TableCell component="th" scope="row">
        <Skeleton
          animation="wave"
          variant="circular"
          sx={{ mr: 1 }}
          width={48}
          height={48}
        />
      </TableCell>
      <TableCell>
        <Skeleton animation="wave" width={100} variant="text" />
      </TableCell>
      <TableCell>
        <Skeleton animation="wave" width={100} variant="text" />
      </TableCell>
      <TableCell>
        <Skeleton animation="wave" width={100} variant="text" />
      </TableCell>
      <TableCell>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Skeleton animation="wave" width={50} variant="text" />
          <Skeleton animation="wave" width={50} variant="text" />
        </Box>
      </TableCell>
    </TableRow>
  ))
}

export default function BannersTable() {
  const { banners, setBanners } = useDataContext()
  const [rowId, setRowId] = useState(0)
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState(null)
  const confirm = useBoolean()
  const router = useRouter()
  const notFound = !banners?.rows?.length

  const handleImagePopup = useCallback(
    (data) => {
      setOpen(true)
      setUrl(data)
    },
    [open, setOpen, url, setUrl],
  )

  //re-ordering
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
  }

  //get dragged item style
  const getItemStyle = (isDragging, draggableStyle) => ({
    background: isDragging ? 'lightGray' : 'white',
    ...draggableStyle,
    ...(isDragging && {
      display: 'flex',
      alignItems: 'center', // Align items vertically
      justifyContent: 'space-between', // Spread items evenly horizontally
      padding: '8px', // Adjust padding to match table row
      border: '1px solid lightgray', // Add border to match table row
      borderRadius: '4px', // Add border radius to match table row
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Add shadow to match table row
      width: '75%', // Match width of table row
    }),
  })

  //dragEnd
  const onDragEnd = async (result) => {
    if (!result.destination) {
      return
    }

    // Prevent updating if the row is not moved
    if (result.source.index === result.destination.index) {
      return
    }

    const previousOrder = [...banners.rows]

    let movedItems = reorder(
      previousOrder,
      result.source.index,
      result.destination.index,
    )
    setBanners({ ...banners, rows: movedItems })

    const res = await patchRequest('/banners/sort', {
      banner: movedItems?.map((banner) => banner?.id),
      router,
    })

    if (res) {
      toast.success('Order Updated')
    } else {
      setBanners({ ...banners, ...previousOrder })
    }

    // setBanners(movedItems)
  }

  //delete banner
  const handleDeleteRow = useCallback(
    async (id) => {
      // console.log(typeof id);
      const updatedBanners = banners?.rows?.filter(
        (banner) => banner?.id !== id,
      )
      const res = await deleteRequest(`/banners/${id}`, null, router)

      if (res) {
        // enqueueSnackbar(`Removed success!`);
        toast.success('Status updated')
        setBanners({
          ...banners,
          count: banners?.count - 1,
          rows: updatedBanners,
        })
      }
    },
    [banners, setBanners],
  )
  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <StyledTable sx={{ minWidth: 750 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ minWidth: 140 }}>Banner Image</TableCell>
            <TableCell sx={{ minWidth: 200 }}>Banner Title</TableCell>
            <TableCell sx={{ minWidth: 120 }}>Type</TableCell>
            <TableCell sx={{ minWidth: 200 }} align="center">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                {banners?.isLoading ? (
                  <TableRowsLoader rowsNum={5} />
                ) : (
                  <TableNoData notFound={notFound} span={4} />
                )}

                {banners.rows?.map((banner, index) => (
                  <Draggable
                    key={banner.id}
                    draggableId={`b-${banner.id}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <TableRow
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        key={banner.id}
                        style={{
                          ...getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style,
                          ),
                          backgroundColor: banner.isDeleted
                            ? '#f0f0f0'
                            : 'inherit',
                        }}
                      >
                        <TableCell>
                          <MyAvatar
                            image={banner?.image}
                            name={banner?.title?.en}
                            onClick={() => handleImagePopup(banner)}
                          />
                        </TableCell>

                        <TableCell>
                          <ListItem
                            primaryText={banner?.title?.en}
                            secondaryText={banner?.title?.ar}
                          />
                        </TableCell>

                        <TableCell>
                          <Label
                            variant="soft"
                            color={
                              banner?.type === 'Marketing'
                                ? 'info'
                                : 'secondary'
                            }
                          >
                            {banner?.type}
                          </Label>
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexWrap: { xs: 'wrap', md: 'nowrap' },
                            }}
                          >
                            <CommonButton
                              title="Edit"
                              color="info"
                              size="small"
                              disabled={banner?.isDeleted}
                              onClick={() =>
                                router.push(
                                  `/dashboard/admin/banners/${banner.id}/edit`,
                                )
                              }
                            />
                            <CommonButton
                              title="Delete"
                              color="error"
                              size="small"
                              disabled={banner?.isDeleted}
                              onClick={() => {
                                confirm.onTrue()
                                setRowId(banner.id)
                              }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </TableBody>
            )}
          </Droppable>
        </DragDropContext>
      </StyledTable>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={<>Are you sure want to delete?</>}
        action={
          <CommonButton
            title="Delete"
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRow(rowId)
              confirm.onFalse()
            }}
          />
        }
      />

      <ImagePopup
        open={open}
        image={url?.image}
        title={url?.title}
        onClose={useCallback(() => {
          setOpen(false)
        }, [open, setOpen, url, setUrl])}
      />
    </Box>
  )
}
