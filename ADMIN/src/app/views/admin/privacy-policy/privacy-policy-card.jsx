import React from 'react'
import PropTypes from 'prop-types'
import {
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  CardHeader,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const PrivacyPolicyCard = ({ privacyPolicyText }) => {
  const contentEn =
    privacyPolicyText?.en || '<b>No Privacy Policy available</b>'
  const contentAr = privacyPolicyText?.ar || '<b>لا توجد شروط وأحكام متاحة</b>'

  return (
    <Box>
      {/* English Card */}
      <Card sx={{ mb: 2 }}>
        <CardHeader />
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Privacy Policy (English)
          </Typography>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header-en"
            >
              <Typography>View Privacy Policy</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                component="div"
                dangerouslySetInnerHTML={{
                  __html: contentEn,
                }}
              />
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {/* Arabic Card */}
      <Card>
        <CardContent sx={{ direction: 'rtl' }}>
          <Typography variant="h5">سياسة الخصوصية (العربية)</Typography>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header-ar"
            >
              <Typography>عرض سياسة الخصوصية</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                dangerouslySetInnerHTML={{
                  __html: contentAr,
                }}
              />
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    </Box>
  )
}

PrivacyPolicyCard.propTypes = {
  privacyPolicyText: PropTypes.shape({
    en: PropTypes.string.isRequired,
    ar: PropTypes.string.isRequired,
  }).isRequired,
}

export default PrivacyPolicyCard
