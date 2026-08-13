import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Icon,
  List,
  ListItem,
  styled,
  Typography,
} from '@mui/material'
import { Breadcrumb } from 'app/components'
import { useDataContext } from 'app/contexts/DataContext'
// import SettingsNewEditForm from './settings-new-edit-form'
import DataCard from 'app/components/data-card/data-card'

import { useRouter } from 'app/hooks/useRouter'
import { formatTime } from 'app/utils/utils'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

const StatInfoCard = ({ title, items = [], background }) => {
  return (
    <Card
      sx={{
        width: '100%',
        height: '175px',
        margin: '20px 0',
        background,
        color: '#fff',
      }}
    >
      <CardHeader title={title} />
      <CardContent>
        <Grid container spacing={1}>
          {items.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Typography
                variant="subtitle1"
                sx={{
                  borderBottom: '2px solid #ccc',
                  display: 'inline-block',
                  pb: 0.5,
                }}
              >
                <strong>{item.label}:</strong> {item.value ?? 'N/A'}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default function Setting() {
  const { config } = useDataContext()
  const router = useRouter()

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Settings', path: '/dashboard/admin/config/' },
          ]}
          action={
            <Button
              // component={RouterLink}
              // href={paths.dashboard.shop.new}
              onClick={() => router.push('/dashboard/admin/config/update')}
              variant="outlined"
              startIcon={<Icon>edit</Icon>}
            >
              Edit Settings
            </Button>
          }
        />
      </Box>
      {/* <SettingsNewEditForm currentSetting={config} /> */}

      <Grid container spacing={2}>
        <Grid item sx={12} md={4}>
          <DataCard
            email={config?.supportEmail}
            phone={config?.whatsappNumber}
            homePageText={config?.homePageText}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatInfoCard
            title="Admin Notification Email"
            items={[
              {
                label: 'Email',
                value: config?.eventsReceivingEmail,
              },
            ]}
            background="linear-gradient(135deg,rgb(69, 63, 126),rgb(175, 51, 118))"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatInfoCard
            title="Delivery Fee"
            items={[
              {
                label: 'Inside Doha',
                value: `${config?.deliveryPricing?.insideDoha} QAR`,
              },
              {
                label: 'Outside Doha',
                value: `${config?.deliveryPricing?.outsideDoha} QAR`,
              },
            ]}
            background="linear-gradient(135deg,rgb(63, 126, 67),rgb(24, 93, 91))"
          />
        </Grid>
      </Grid>

      <Card
        sx={{
          width: '100%',
          margin: '20px 0',
          background:
            'linear-gradient(135deg,rgb(221, 18, 18),rgb(165, 119, 155))',
          color: '#fff',
        }}
      >
        {/* <CardHeader title="Return & Cancel Reasons" /> */}
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Return Reasons</Typography>
              <List>
                {config?.ordersReturnReasons?.length > 0 ? (
                  config?.ordersReturnReasons?.map((reason, index) => (
                    <ListItem key={index}>
                      {index + 1}. {reason.en}
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2">
                    No return reasons available.
                  </Typography>
                )}
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6">Cancel Reasons</Typography>
              <List>
                {config?.ordersCancelReasons?.length > 0 ? (
                  config?.ordersCancelReasons?.map((reason, index) => (
                    <ListItem key={index}>
                      {index + 1}. {reason.en}
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2">
                    No cancel reasons available.
                  </Typography>
                )}
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  )
}
