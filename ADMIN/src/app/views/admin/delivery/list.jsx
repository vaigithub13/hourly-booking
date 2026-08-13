import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Icon,
  styled,
  Typography,
} from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'

import { useRouter } from 'app/hooks/useRouter'
import { useBoolean } from 'app/hooks/useBoolean'
import { useDataContext } from 'app/contexts/DataContext'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

export default function Delivery() {
  const router = useRouter()
  const { config } = useDataContext()

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'List', path: '/dashboard/admin/delivery' },
            { name: `Delivery` },
          ]}
          action={
            <Button
              // component={RouterLink}
              // href={paths.dashboard.shop.new}
              onClick={() => router.push('/dashboard/admin/config/update')}
              variant="outlined"
              startIcon={<Icon>add</Icon>}
            >
              Edit
            </Button>
          }
        />
      </Box>

      <Card sx={{ width: '100%', margin: '20px 0' }}>
        <CardHeader title="Delivery Price" />
        <CardContent>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Delivery Price:</strong>
            </Typography>
            <Typography variant="body2">
              <strong>Inside Doha:</strong>{' '}
              {config?.deliveryPricing?.insideDoha || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Outside Doha:</strong>{' '}
              {config?.deliveryPricing?.outsideDoha || 'N/A'}
            </Typography>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  )
}
