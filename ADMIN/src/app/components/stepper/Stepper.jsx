import React from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Typography,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Build,
  Check,
  DepartureBoard,
  Hail,
  Home,
  HourglassTop,
  LocalShipping,
  PendingActions,
  ShoppingCart,
  ThumbDownAlt,
  ThumbUpAlt,
  Verified,
} from '@mui/icons-material'
import { styled } from '@mui/system'
import StepConnector, {
  stepConnectorClasses,
} from '@mui/material/StepConnector'
import { useDataContext } from 'app/contexts/DataContext'
import { fDate, fTime, ReturnStatusMap } from 'app/utils/utils'
import useSettings from 'app/hooks/useSettings'

const statusIcons = {
  Placed: <ShoppingCart />,
  Confirmed: <Build />,
  'Out For Delivery': <LocalShipping />,
  'Ready To Ship': <ThumbUpAlt />,
  Delivered: <Home />,
}

const returnIcons = {
  Pending: <PendingActions />,
  PendingAdmin: <HourglassTop />,
  Approved: <DepartureBoard />,
  Rejected: <ThumbDownAlt />,
  PickUp: <Hail />,
  Complete: <Verified />,
  OnTheWay: <LocalShipping />,
}

const StepIconRoot = styled('div')(({ theme, ownerState }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor:
    ownerState.active || ownerState.completed ? '#BFA75D' : 'lightgray',
  color: theme.palette.common.white,
}))

const StepIcon = ({ active, completed, icon }) => {
  return (
    <StepIconRoot ownerState={{ active, completed }}>
      {completed ? <Check /> : icon}
    </StepIconRoot>
  )
}

StepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
  icon: PropTypes.node,
}

const CustomStepConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.success.main,
    },
  },

  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.primary.main,
    borderTopWidth: 3,
    borderRadius: 1,
    // shrink line length on mobile
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  },

  [`& .${stepConnectorClasses.completed}`]: {
    borderColor: theme.palette.success.main,
  },
  [`& .${stepConnectorClasses.active}`]: {
    borderColor: theme.palette.success.main,
  },
}))

const OrderStepper = ({
  currentStatus,
  isLoading,
  tracking,
  isReturn = false,
}) => {
  const { statusCodes, returnStatusCodes } = useDataContext()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Filter based on type
  const filteredStatusCodes = isReturn
    ? returnStatusCodes
        ?.filter((s) => s !== 'Rejected')
        ?.map((status, index) => ({ id: index + 1, status })) // create similar structure as statusCodes
    : statusCodes?.filter(
        (codes) =>
          codes?.status !== 'Returned' && codes?.status !== 'Cancelled',
      )

  const activeStep = filteredStatusCodes?.findIndex(
    (item) => item.status === currentStatus,
  )

  const isDelivered = isReturn
    ? currentStatus === 'Complete'
    : currentStatus === 'Delivered'

  if (isLoading) {
    return (
      <Card sx={{ width: '100%' }}>
        <CardContent>
          <Skeleton
            animation="wave"
            variant="text"
            height={32}
            width="40%"
            sx={{ mb: 2 }}
          />

          <Box sx={{ width: '100%' }}>
            <Skeleton
              animation="wave"
              variant="rectangular"
              height={40}
              sx={{ mb: 2, width: { xs: '100%', sm: '50%' } }}
            />
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {isReturn ? 'Return Tracking' : 'Order Tracking'}
        </Typography>

        <Box sx={{ width: '100%' }}>
          <Stepper
            activeStep={activeStep}
            connector={<CustomStepConnector />}
            orientation={isMobile ? 'vertical' : 'horizontal'}
            alternativeLabel={!isMobile}
            // adds spacing below icon in horizontal
            sx={{
              '& .MuiStepLabel-root': {
                flexDirection: isMobile ? 'row' : 'column', // vertical keeps pipe aligned
                alignItems: isMobile ? 'flex-start' : 'center',
                textAlign: isMobile ? 'left' : 'center',
              },
              '& .MuiStepConnector-root': {
                marginLeft: isMobile ? '12px' : 0, // shift pipe under the icon in mobile
              },
            }}
          >
            {filteredStatusCodes?.map((label, index) => {
              const statusLabel = label.status
              const id = label.id

              const trackingItem = tracking?.find(
                (item) => item?.statusId === id,
              )

              return (
                <Step key={id} completed={isDelivered || index < activeStep}>
                  <StepLabel
                    StepIconComponent={(props) => (
                      <StepIcon
                        active={props.active}
                        completed={isDelivered || props.completed}
                        icon={
                          isReturn
                            ? returnIcons[statusLabel]
                            : statusIcons[statusLabel]
                        }
                      />
                    )}
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'column' }, // ensure consistent layout
                      alignItems: { xs: 'center', sm: 'center' }, // center align both
                      textAlign: { xs: 'center', sm: 'center' }, // text center both
                    }}
                  >
                    <Typography
                      variant={isReturn ? 'caption' : 'body2'}
                      color="textPrimary"
                    >
                      {statusLabel === 'Ready To Ship'
                        ? 'Ready To Pickup'
                        : isReturn
                        ? ReturnStatusMap[statusLabel]
                        : statusLabel}
                    </Typography>

                    {trackingItem && (
                      <Box
                        sx={{
                          mt: 0.5,
                          display: 'flex',
                          flexDirection: 'column', // stack vertically
                          alignItems: {
                            xs: 'flex-start', // left-align on mobile
                            sm: 'center', // center-align on tablet/desktop
                          },
                          gap: 0.2, // small spacing between date and time
                        }}
                      >
                        <Typography variant="caption" color="textSecondary">
                          {fDate(trackingItem.loggedAt)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {fTime(trackingItem.loggedAt)}
                        </Typography>
                      </Box>
                    )}
                  </StepLabel>
                </Step>
              )
            })}
          </Stepper>
        </Box>
      </CardContent>
    </Card>
  )
}

export default OrderStepper
