import React from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, LinearProgress } from '@mui/material'
import NoRowsOverlay from '../NoRowsOverlay/NoRowsOverlay'

const MyDataTable = ({
  columns,
  rows,
  rowCount,
  loading,
  paginationModel,
  onPaginationModelChange,
}) => {
  return (
    <Box
      sx={{
        height: !rows?.length
          ? 400
          : rows?.length <= 5 && !loading
          ? 'auto'
          : 550,
        width: '100%',
        overflowX: 'hidden', // Disable horizontal scrolling by default
        '& .MuiDataGrid-columnHeaders': {
          background:
            'linear-gradient(160deg, rgba(191, 167, 93, 0.8), rgba(34, 34, 34, 0.8))',
          color: 'white',
        },
        '& .MuiDataGrid-columnSeparator': {
          display: 'none',
        },
      }}
    >
      <DataGrid
        disableRowSelectionOnClick
        rows={rows || []}
        columns={columns}
        loading={loading}
        rowCount={rowCount}
        getRowHeight={() => 'auto'}
        slots={{ noRowsOverlay: NoRowsOverlay, loadingOverlay: LinearProgress }}
        pageSizeOptions={[20, 50, 100]}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
      />
    </Box>
  )
}

export default React.memo(MyDataTable)
