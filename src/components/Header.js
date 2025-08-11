import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  useTheme, useMediaQuery
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const Header = ({ 
  user, 
  onLogin, 
  onLogout, 
  onThemeToggle, 
  isDarkMode 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        {/* App Title */}
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            borderRadius: 2
          }}
        >
          💰 Expense Tracker
        </Typography>

        {/* Theme Toggle Button */}
        <IconButton
          onClick={onThemeToggle}
          color="inherit"
          sx={{ mr: 2 }}
          aria-label="toggle theme"
        >
          {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        {/* User Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user ? (
            <>
              {/* User Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                <AccountCircleIcon />
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {user.email}
                </Typography>
              </Box>
              
              {/* Logout Button */}
              <Button
                variant="outlined"
                color="inherit"
                onClick={onLogout}
                startIcon={<LogoutIcon />}
                sx={{ 
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                {isMobile ? '' : 'Logout'}
              </Button>
            </>
          ) : (
            /* Login Button */
            <Button
              variant="contained"
              color="secondary"
              onClick={onLogin}
              sx={{
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF5252, #26A69A)',
                }
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 
