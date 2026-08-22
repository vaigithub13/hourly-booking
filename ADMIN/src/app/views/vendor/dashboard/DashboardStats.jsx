import React from 'react'
import { motion } from 'framer-motion'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material'
import {
  AccountBalance,
  AccountBalanceWallet,
  RemoveShoppingCart,
  ShoppingCart,
  Store,
} from '@mui/icons-material'
import { useEffect } from 'react'
import { useState } from 'react'
import { getRequest } from 'app/utils/request'
import { formatCurrency } from 'app/utils/utils'
import OrdersLineChart from 'app/views/admin/dashboard/shared/OrdersLineChart'
import RevenueLineChart from 'app/views/admin/dashboard/shared/RevenueLineChart'

const WaveChart = ({ gradient }) => {
  const waveVariants = {
    animate: {
      x: [0, 100, 0], // Move left to right and back
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <motion.svg
      viewBox="0 0 1440 320"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '60px',
        zIndex: 0,
      }}
      variants={waveVariants}
      animate="animate"
    >
      <path
        fill={gradient}
        d="M0,160L48,154.7C96,149,192,139,288,149.3C384,160,480,192,576,197.3C672,203,768,181,864,149.3C960,117,1056,75,1152,64C1248,53,1344,75,1392,85.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      />
    </motion.svg>
  )
}

const DashboardStats = () => {
  const [loading, setLoading] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)
  const [filterDays, setFilterDays] = useState(30)
  const [revenue, setRevenue] = useState(0)
  const [revenueLoading, setRevenueLoading] = useState(0)
  const [filter, setFilter] = useState(30)
  const [orderTotal, setOrderTotal] = useState(0)
  const [cancelled, setCancelled] = useState(0)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [daysFilter, setDaysFilter] = useState(30)
  const [statistics, setStatistics] = useState({
    totalReturns: 0,
    totalEarnings: 0,
  })
  const fetchStats = async () => {
    setLoading(true)
    const [returnsRes, earningRes] = await Promise.all([
      getRequest('/statistics/total-return-orders'),
      getRequest('/statistics/total-earning'),
    ])

    setStatistics({
      totalReturns: returnsRes?.data?.result || 0,
      totalEarnings: earningRes?.data?.result || 0,
    })

    setLoading(false)
  }

  const fetchOrders = async (days) => {
    setOrderLoading(true)
    const now = new Date()
    const toDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    )
    const fromDate = new Date(toDate.getTime() - days * 24 * 60 * 60 * 1000)
    // Convert both to ISO strings
    const from = fromDate.toISOString()
    const to = toDate.toISOString()

    const res = await getRequest(
      `/statistics/total-orders?from=${from}&to=${to}`,
    )

    setOrderTotal(res?.data?.result)

    setOrderLoading(false)
  }

  const fetchCancelledOrders = async (days) => {
    setCancelLoading(true)
    const now = new Date()
    const toDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    )
    const fromDate = new Date(toDate.getTime() - days * 24 * 60 * 60 * 1000)
    // Convert both to ISO strings
    const from = fromDate.toISOString()
    const to = toDate.toISOString()

    const res = await getRequest(
      `/statistics/total-orders?from=${from}&to=${to}&status=Cancelled`,
    )

    setCancelled(res?.data?.result)

    setCancelLoading(false)
  }

  const fetchRenvenue = async (days) => {
    setRevenueLoading(true)
    const now = new Date()
    const toDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    )
    const fromDate = new Date(toDate.getTime() - days * 24 * 60 * 60 * 1000)
    // Convert both to ISO strings
    const from = fromDate.toISOString()
    const to = toDate.toISOString()

    const res = await getRequest(
      `/statistics/total-revenue?from=${from}&to=${to}`,
    )

    setRevenue(res?.data?.result)

    setRevenueLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    fetchOrders(filterDays)
  }, [filterDays])

  useEffect(() => {
    fetchRenvenue(filter)
  }, [filter])

  useEffect(() => {
    fetchCancelledOrders(daysFilter)
  }, [daysFilter])

  return (
    <Grid container spacing={2}>
      {/* Charts Column */}
      <Grid item xs={12} md={8}>
        <Grid container spacing={2} direction="column">
          <Grid item xs={12}>
            <RevenueLineChart />
          </Grid>
          <Grid item xs={12}>
            <OrdersLineChart />
          </Grid>
        </Grid>
      </Grid>

      {/* Stat Cards Column */}
      <Grid item xs={12} md={4}>
        <Grid container spacing={2} direction="column">
          {[
            {
              title: 'Total Revenue',
              subtitle: 'Last 30 days',
              value: revenueLoading ? 0 : formatCurrency(revenue),
              icon: <AccountBalanceWallet fontSize="large" color="primary" />,
              gradient: 'linear-gradient(135deg, #6a82fb, #fc5c7d)',
              waveColor: '#fc5c7d',
              loading: revenueLoading,
            },
            {
              title: 'Total Earnings',
              value: loading ? 0 : formatCurrency(statistics?.totalEarnings),
              icon: <AccountBalance fontSize="large" color="primary" />,
              gradient: 'linear-gradient(135deg,rgb(84, 220, 54), #5b86e5)',
              // waveColor: '#5b86e5',
              loading: loading,
            },
            {
              title: 'Total Returns',
              value: loading ? 0 : statistics?.totalReturns,
              icon: <Store fontSize="large" color="secondary" />,
              gradient: 'linear-gradient(135deg, #36d1dc, #5b86e5)',
              waveColor: '#5b86e5',
              loading: loading,
            },
            {
              title: 'Total Orders',
              subtitle: 'Last 30 days',
              value: orderLoading ? 0 : orderTotal,
              icon: <ShoppingCart fontSize="large" color="info" />,
              gradient:
                'linear-gradient(135deg,rgb(96, 80, 150),rgb(122, 160, 177))',

              loading: orderLoading,
            },
            {
              title: 'Total Cancelled Orders',
              subtitle: 'Last 30 days',
              value: cancelLoading ? 0 : cancelled,
              icon: <RemoveShoppingCart fontSize="large" color="secondary" />,
              gradient:
                'linear-gradient(135deg,rgb(205, 37, 37),rgb(177, 122, 129))',

              loading: cancelLoading,
            },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card
                sx={{
                  background: stat.gradient,
                  color: '#fff',
                  boxShadow: 3,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  padding: 2,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 2,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    zIndex: 1,
                  }}
                >
                  {stat.loading ? (
                    <Skeleton
                      variant="circular"
                      width={48}
                      height={48}
                      sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}
                    />
                  ) : (
                    stat.icon
                  )}
                </Box>

                <CardContent sx={{ marginLeft: 2, zIndex: 1 }}>
                  <Typography variant="subtitle2">
                    {stat.subtitle
                      ? `${stat.title} - (${stat.subtitle})`
                      : stat.title}
                  </Typography>

                  {stat.loading ? (
                    <Skeleton
                      variant="text"
                      width="70%"
                      sx={{ bgcolor: 'rgba(255,255,255,0.4)' }}
                    />
                  ) : (
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                      {stat?.title === 'Total Revenue' && (
                        <Box
                          component="span"
                          sx={{
                            fontSize: '0.45em',
                            verticalAlign: 'super',
                            marginLeft: '4px',
                            opacity: 0.8,
                            color: 'black',
                          }}
                        >
                          INR
                        </Box>
                      )}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default DashboardStats
