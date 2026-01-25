import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Typography, Button, Box, IconButton,
  useTheme, useMediaQuery, Grid,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import moneyIcon from '../money.png';

const Header = ({
  user,
  onLogin,
  onLogout,
  onThemeToggle,
  isDarkMode
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="static" elevation={2}>
      <Grid container spacing={2} padding={2}>
        {/* App Title */}
        <Grid item spacing={2} sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }} xs={12} md={6} lg={6}>
          <Box
            component="img"
            src={moneyIcon}
            alt="logo"
            sx={{
              height: { xs: 32, sm: 40 },
              width: 'auto'
            }}
          />
          <Typography
            variant={isMobile ? "h6" : "h5"}
            component="div"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              borderRadius: 2
            }}
          >
            Expense Tracker
          </Typography>
        </Grid>

        {/* Navigation Links */}
        {user && (
          <Grid item spacing={2} sx={{ display: 'flex', gap: 1, mr: 2 }} xs={12} md={6} lg={6}>
            <Button
              color="inherit"
              onClick={() => navigate('/')}
              sx={{
                borderBottom: location.pathname === '/' ? '2px solid white' : 'none',
                borderRadius: 0
              }}
            >
              Home
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/analysis')}
              sx={{
                borderBottom: location.pathname === '/analysis' ? '2px solid white' : 'none',
                borderRadius: 0
              }}
            >
              Analysis
            </Button>
          </Grid>
        )}
        <Grid item sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }} xs={12} md={12} lg={12}>
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
        </Grid>
      </Grid>
    </AppBar >
  );
};

export default Header; 
