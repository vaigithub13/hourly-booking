import { Box, Button, Icon, styled } from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'

import { useRouter } from 'app/hooks/useRouter'
import FaqsTable from './faqsTable/FaqsTable'
import { useBoolean } from 'app/hooks/useBoolean'
import AddFaqs from './FaqsModal/AddFaqModel'
import { useState } from 'react'
import { useCallback } from 'react'

// STYLED COMPONENT
const Container = styled('div')(({ theme }) => ({
  margin: 30,
  [theme.breakpoints.down('sm')]: { margin: 16 },
  '& .breadcrumb': {
    marginBottom: 30,
    [theme.breakpoints.down('sm')]: { marginBottom: 16 },
  },
}))

export default function Faqs() {
  const router = useRouter()
  const confirm = useBoolean()
  const [currentFaq, setCurrentFaq] = useState(null)

  const onEdit = (data) => {
    setCurrentFaq(data)
    confirm.onTrue()
  }

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[{ name: `FAQ's`, path: '/dashboard/admin/faqs' }]}
          action={
            <Button
              // component={RouterLink}
              // href={paths.dashboard.shop.new}
              onClick={() => confirm.onTrue()}
              variant="outlined"
              startIcon={<Icon>add</Icon>}
            >
              Add Faq
            </Button>
          }
        />
      </Box>
      <SimpleCard>
        <FaqsTable onEdit={onEdit} />
      </SimpleCard>
      <AddFaqs
        currentFaq={currentFaq}
        open={confirm.value}
        onClose={useCallback(() => {
          setCurrentFaq(null)
          confirm.onFalse()
        }, [currentFaq, setCurrentFaq, confirm])}
      />
    </Container>
  )
}
