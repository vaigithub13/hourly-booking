import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Skeleton,
} from '@mui/material'
import ReactECharts from 'echarts-for-react'
import axios from 'axios'
import { getRequest } from 'app/utils/request'
import { InsertChartOutlined } from '@mui/icons-material'

const dayOptions = [
  { label: 'Last 30 Days', value: 30 },
  { label: 'Last 90 Days', value: 90 },
  { label: 'Last 180 Days', value: 180 },
]

export default function OrdersLineChart() {
  const [days, setDays] = useState(30)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async (selectedDays) => {
    setLoading(true)
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
    const fromDate = new Date(
      toDate.getTime() - selectedDays * 24 * 60 * 60 * 1000,
    )

    const from = fromDate.toISOString()
    const to = toDate.toISOString()

    try {
      const res = await getRequest(
        `/statistics/orders-statistics-line-chart?&from=${from}&to=${to}`,
      )
      setChartData(res.data)
    } catch (error) {
      console.error('Error fetching order chart data', error)
    } finally {
      setLoading(false)
    }
  }

  const allDatesSet = new Set([
    ...(chartData?.orders || []).map((o) => o.date),
    ...(chartData?.returnOrders || []).map((r) => r.date),
    ...(chartData?.cancelOrders || []).map((c) => c.date),
  ])
  const allDates = Array.from(allDatesSet).sort() // sort chronologically

  // Helper function to map counts by date
  const mapDataByDate = (dataArr = []) => {
    const map = {}
    dataArr.forEach((item) => {
      map[item.date] = Number(item.count)
    })
    return allDates.map((date) => map[date] || 0)
  }

  useEffect(() => {
    fetchData(days)
  }, [days])

  const chartOptions = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['Orders', 'Returns', 'Cancellations'],
    },
    xAxis: {
      type: 'category',
      data: allDates || [],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Orders',
        type: 'bar',
        data: mapDataByDate(chartData?.orders) || [],
      },
      {
        name: 'Returns',
        type: 'bar',
        data: mapDataByDate(chartData?.returnOrders) || [],
      },
      {
        name: 'Cancellations',
        type: 'bar',
        data: mapDataByDate(chartData?.cancelOrders) || [],
      },
    ],
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Orders Overview</Typography>
          <FormControl size="small">
            <InputLabel id="filter-label">Range</InputLabel>
            <Select
              labelId="filter-label"
              value={days}
              label="Range"
              onChange={(e) => setDays(e.target.value)}
            >
              {dayOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {loading ? (
          <Skeleton variant="rectangular" height={400} width="100%" />
        ) : allDates.length === 0 ||
          (chartData?.orders?.length === 0 &&
            chartData?.returnOrders?.length === 0 &&
            chartData?.cancelOrders?.length === 0) ? (
          <Box
            sx={{
              height: 400,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              gap: 1,
            }}
          >
            <InsertChartOutlined sx={{ fontSize: 64, opacity: 0.5 }} />
            <Typography variant="subtitle1" sx={{ opacity: 0.7 }}>
              No results found for the selected range.
            </Typography>
          </Box>
        ) : (
          <ReactECharts option={chartOptions} style={{ height: 400 }} />
        )}
      </CardContent>
    </Card>
  )
}
