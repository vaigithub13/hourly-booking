import React, { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Typography,
} from '@mui/material'
import { getRequest } from 'app/utils/request'
import { InsertChartOutlined } from '@mui/icons-material'

const RevenueLineChart = () => {
  const [data, setData] = useState([])
  const [selectedDays, setSelectedDays] = useState(30)
  const [loading, setLoading] = useState(false)

  const fetchRevenueData = async (days) => {
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
    const fromDate = new Date(toDate.getTime() - days * 24 * 60 * 60 * 1000)

    const from = fromDate.toISOString()
    const to = toDate.toISOString()
    try {
      const response = await getRequest(
        `/statistics/revenue-statistics-line-chart?from=${from}&to=${to}`,
      )
      setData(response?.data?.revenue || [])
    } catch (error) {
      console.error('Error fetching revenue data:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRevenueData(selectedDays)
  }, [selectedDays])

  const chartOptions = {
    title: {
      text: 'Revenue Over Time',
      left: 'center',
      textStyle: {
        fontSize: 16,
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: ({ 0: point }) => {
        return `${point.axisValue}<br/>Revenue: ${point.data} QAR`
      },
    },
    xAxis: {
      type: 'category',
      data: data?.map((item) => item.date),
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} QAR',
      },
    },
    series: [
      {
        name: 'Revenue',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: data.map((item) => item.sum),
        areaStyle: {
          color: 'rgba(54, 144, 255, 0.1)',
        },
        lineStyle: {
          color: '#3690ff',
        },
        itemStyle: {
          color: '#3690ff',
        },
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      containLabel: true,
    },
  }

  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Revenue Overview</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Days</InputLabel>
          <Select
            value={selectedDays}
            label="Days"
            onChange={(e) => setSelectedDays(Number(e.target.value))}
          >
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 90 days</MenuItem>
            <MenuItem value={180}>Last 180 days</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {loading ? (
        <Skeleton variant="rectangular" height={400} width="100%" />
      ) : data?.length === 0 ? (
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
        <ReactECharts
          option={chartOptions}
          style={{ height: 350 }}
          showLoading={loading}
        />
      )}
    </Box>
  )
}

export default RevenueLineChart
