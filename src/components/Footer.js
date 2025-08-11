import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        mt: 3,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        textAlign: 'center'
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary">
          © {currentYear} Expense Tracker. Built with{' '}
          <Typography
            component="span"
            variant="body2"
            sx={{
              color: 'primary.main',
              fontWeight: 'medium',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
                cursor: 'pointer'
              }
            }}
            onClick={() => window.open('https://reactjs.org/', '_blank')}
          >
            React.js
          </Typography>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 
