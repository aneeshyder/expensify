import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, useTheme, useMediaQuery
} from '@mui/material';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const AuthDialog = ({ open, onClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);

    const handleAuthAction = async () => {
        try {
            if (isRegister) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            onClose();
            // Reset form
            setEmail('');
            setPassword('');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    m: { xs: 2, sm: 'auto' },
                    width: { xs: 'calc(100% - 32px)', sm: 'auto' }
                }
            }}
        >
            <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                {isRegister ? 'Create Account' : 'Sign In'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 }, mt: 1 }}>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        size="small"
                        sx={{
                            '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        size="small"
                        sx={{
                            '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{
                p: { xs: 1.5, sm: 2 },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 }
            }}>
                <Button
                    onClick={() => setIsRegister(!isRegister)}
                    fullWidth={isMobile}
                    size="small"
                    sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        minHeight: { xs: 44, sm: 32 }
                    }}
                >
                    {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
                </Button>
                <Button
                    onClick={handleAuthAction}
                    variant="contained"
                    disabled={!email || !password}
                    fullWidth={isMobile}
                    size="small"
                    sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        minHeight: { xs: 44, sm: 32 }
                    }}
                >
                    {isRegister ? 'Register' : 'Sign In'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AuthDialog;
