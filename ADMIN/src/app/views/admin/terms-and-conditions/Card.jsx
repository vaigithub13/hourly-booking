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

const TermsAndConditionsCard = ({ termsAndConditions }) => {
  const contentEn =
    termsAndConditions?.en || '<p>No terms and conditions available</p>'
  const contentAr = termsAndConditions?.ar || '<p>لا توجد شروط وأحكام متاحة</p>'

  return (
    <Box>
      {/* English Card */}
      <Card sx={{ mb: 2 }}>
        <CardHeader />
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Terms & Conditions (English)
          </Typography>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header-en"
            >
              <Typography>View Terms & Conditions</Typography>
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
          <Typography variant="h5">الشروط والأحكام (العربية)</Typography>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header-ar"
            >
              <Typography>عرض الشروط والأحكام</Typography>
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

TermsAndConditionsCard.propTypes = {
  termsAndConditions: PropTypes.shape({
    en: PropTypes.string.isRequired,
    ar: PropTypes.string.isRequired,
  }).isRequired,
}

export default TermsAndConditionsCard
