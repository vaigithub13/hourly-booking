import { Box, Button, Icon, ListItemText, Stack, styled } from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'
import { ConfirmDialog } from 'app/components/custom-dialog'
import MyDataTable from 'app/components/DataTable/MyDataTable'
import Label from 'app/components/label'
import { useDataContext } from 'app/contexts/DataContext'
import { useBoolean } from 'app/hooks/useBoolean'
import { useRouter } from 'app/hooks/useRouter'
//   import { deleteRequest } from 'app/utils/request'
import { useCallback, useState } from 'react'
import AddNotification from './NotificationModal/AddNotification'
import { debounce } from 'lodash'
import { toast } from 'react-toastify'
import CommonButton from 'app/components/common-button'
import { postRequest } from 'app/utils/request'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

export default function Notifications() {
  const {
    notifications,
    setNotifications,
    setNotificationsPage,
    setNotificationsLimit,
  } = useDataContext()
  const [rowId, setRowId] = useState(0)
  const router = useRouter()
  const confirm = useBoolean()

  const handleNotify = useCallback(
    async (id) => {
      const updatedNotifications = notifications?.rows?.map((notification) =>
        notification.id === id
          ? { ...notification, isSent: true }
          : notification,
      )
      const res = await postRequest(
        `/notifications/send-public-notifications/${id}`,
        null,
      )
      if (res) {
        toast.success(`Notification send successfully!`)
        setNotifications({ ...notifications, rows: updatedNotifications })
      }
    },
    [notifications, setNotifications],
  )

  const debouncedNotify = debounce(handleNotify, 500)
  const columns = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 200,
      hideable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <ListItemText
            primary={row?.title?.en}
            secondary={row?.title?.ar}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
            sx={{ display: 'flex', flexDirection: 'column' }}
          />
        </Stack>
      ),
    },
    {
      field: 'content',
      headerName: 'Content',
      flex: 1,
      minWidth: 200,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <ListItemText
            primary={row?.content?.en}
            secondary={row?.content?.ar}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
            sx={{ display: 'flex', flexDirection: 'column' }}
          />
        </Stack>
      ),
    },

    {
      field: 'isNotified',
      headerName: 'is Notified ?',
      flex: 0.2,
      minWidth: 150,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
          <Label variant="soft" color={row?.isSent ? 'success' : 'error'}>
            {row?.isSent ? 'true' : 'false'}
          </Label>
        </Stack>
      ),
    },
    {
      type: 'actions',
      field: 'actions',
      flex: 0.2,
      minWidth: 200,
      headerName: 'Actions',
      // align: 'right',
      // headerAlign: 'right',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <CommonButton
            title={'Notify User'}
            color={'info'}
            disabled={row?.isSent}
            onClick={() => debouncedNotify(row?.id)}
          />
        </Box>
      ),
    },
  ]
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Notifications', path: '/dashboard/admin/notifications' },
          ]}
          action={
            <Button
              onClick={() => confirm.onTrue()}
              variant="outlined"
              startIcon={<Icon>add</Icon>}
            >
              Add Notification
            </Button>
          }
        />
      </Box>
      <SimpleCard>
        <MyDataTable
          rows={notifications?.rows}
          rowCount={notifications?.count}
          loading={notifications?.isLoading}
          columns={columns}
          //   paginationModel={paginationModel}
          //   onPaginationModelChange={handlePaginationChanges}
        />
      </SimpleCard>
      {/* <ConfirmDialog
          open={confirm.value}
          onClose={confirm.onFalse}
          title="Delete"
          content={<>Are you sure want to delete?</>}
          action={
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleDeleteRow(rowId)
                confirm.onFalse()
              }}
            >
              Delete
            </Button>
          }
        /> */}
      <AddNotification
        currentNotification={null}
        open={confirm.value}
        onClose={() => confirm.onFalse()}
      />
    </Container>
  )
}
