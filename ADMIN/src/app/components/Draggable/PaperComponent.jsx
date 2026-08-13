import { Paper } from '@mui/material'
import { useRef } from 'react'
import Draggable from 'react-draggable'

export default function PaperComponent(props) {
  const nodeRef = useRef(null)
  return (
    <Draggable
      nodeRef={nodeRef}
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} ref={nodeRef} />
    </Draggable>
  )
}
