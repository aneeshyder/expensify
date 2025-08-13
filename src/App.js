// Expense Tracker with React, Firebase, Material UI, Authentication, Add/Edit/Delete
// Features:
// - User login/register (Firebase Auth)
// - Add expense with multiple categories
// - Edit/Delete expenses
// - Filter by date range and categories
// - Per-user data isolation
// - Dark/Light theme switching

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, where, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Container, TextField, Button, Typography, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, ThemeProvider, CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import ExpenseList from './components/ExpenseList';
import Header from './components/Header';
import Footer from './components/Footer';
import { auth, db } from './firebase.js';
import { lightTheme, darkTheme } from './theme.js';

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryInput, setCategoryInput] = useState('');
  const [date, setDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Get unique categories from existing expenses
  const existingCategories = [...new Set(expenses.flatMap(exp => exp.categories || []))];

  // Theme switching
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const handleThemeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('isDarkMode', JSON.stringify(newMode));
  };

  // Login/Register dialog state
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const handleLoginClick = () => {
    setAuthDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const q = query(collection(db, 'expenses'), where('uid', '==', u.uid), orderBy('date', 'desc'));
        const unsubscribeSnap = onSnapshot(q, (snapshot) => {
          setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return unsubscribeSnap;
      } else {
        setExpenses([]);
      }
    });
    return unsubscribeAuth;
  }, []);


  const handleAddExpense = async () => {
    if (!auth.currentUser) return;

    if (editId) {
      // Update existing expense
      try {
        const expenseData = {
          description,
          amount: parseFloat(amount),
          date: date || new Date(),
          categories: selectedCategories,
          updatedAt: new Date()
        };

        await updateDoc(doc(db, 'expenses', editId), expenseData);

        // Reset edit state
        setEditId(null);
        setEditOpen(false);

        // Reset form
        setAmount('');
        setDescription('');
        setDate('');
        setSelectedCategories([]);
      } catch (error) {
        console.error('Error updating expense:', error);
        alert('Error updating expense');
      }
    } else {
      // Add new expense
      const expenseData = {
        description,
        amount: parseFloat(amount),
        date: date || new Date(),
        categories: selectedCategories,
        uid: auth.currentUser.uid,
        createdAt: new Date()
      };

      try {
        await addDoc(collection(db, 'expenses'), expenseData);
        // Reset form
        setAmount('');
        setDescription('');
        setDate('');
        setSelectedCategories([]);
      } catch (error) {
        console.error('Error adding expense:', error);
        alert('Error adding expense');
      }
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'expenses', id));
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Container sx={{ pt: { xs: 1, sm: 2 }, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header
          user={user}
          onLogout={handleLogout}
          onThemeToggle={handleThemeToggle}
          isDarkMode={isDarkMode}
          onLogin={handleLoginClick}
        />

        {/* Authentication Dialog */}
        <Dialog 
          open={authDialogOpen} 
          onClose={() => setAuthDialogOpen(false)} 
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
              onClick={async () => {
                try {
                  if (isRegister) {
                    await createUserWithEmailAndPassword(auth, email, password);
                  } else {
                    await signInWithEmailAndPassword(auth, email, password);
                  }
                  setAuthDialogOpen(false);
                  setEmail('');
                  setPassword('');
                } catch (error) {
                  alert(error.message);
                }
              }}
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

        {user ? (
          <>
            <Box sx={{ mt: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, flexGrow: 1 }}>
              <Typography variant="h5" sx={{ 
                mb: { xs: 1.5, sm: 2 },
                fontSize: { xs: '1.5rem', sm: '1.75rem' }
              }}>
                Add New Expense
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                flexWrap: 'wrap', 
                gap: { xs: 1.5, sm: 2 }, 
                mb: { xs: 1.5, sm: 2 }
              }}>
                <TextField 
                  label="Amount" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  size="small"
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                  }}
                />
                <TextField 
                  label="Description" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  size="small"
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                  }}
                />
                <TextField 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  size="small"
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                  }}
                />
              </Box>

              {/* Category Selection Section */}
              <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                <Typography variant="subtitle2" sx={{ 
                  mb: 1,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}>
                  Select Categories:
                </Typography>

                {/* Existing Categories */}
                {existingCategories.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{
                      fontSize: { xs: '0.75rem', sm: '0.75rem' }
                    }}>
                      Existing categories:
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {existingCategories.map((category) => (
                        <Chip
                          key={category}
                          label={category}
                          onClick={() => {
                            if (!selectedCategories.includes(category)) {
                              setSelectedCategories([...selectedCategories, category]);
                            }
                          }}
                          color={selectedCategories.includes(category) ? "primary" : "default"}
                          variant={selectedCategories.includes(category) ? "filled" : "outlined"}
                          sx={{ 
                            cursor: 'pointer',
                            fontSize: { xs: '0.75rem', sm: '0.75rem' }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Add New Category */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' }, 
                  gap: 1 
                }}>
                  <TextField
                    size="small"
                    label="Add New Category"
                    value={categoryInput}
                    onChange={e => setCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && categoryInput.trim()) {
                        const newCategory = categoryInput.trim();
                        if (!selectedCategories.includes(newCategory)) {
                          setSelectedCategories([...selectedCategories, newCategory]);
                        }
                        setCategoryInput('');
                      }
                    }}
                    sx={{ 
                      flexGrow: 1,
                      '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      if (categoryInput.trim()) {
                        const newCategory = categoryInput.trim();
                        if (!selectedCategories.includes(newCategory)) {
                          setSelectedCategories([...selectedCategories, newCategory]);
                        }
                        setCategoryInput('');
                      }
                    }}
                    sx={{ 
                      minHeight: { xs: 44, sm: 40 },
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }}
                  >
                    Add
                  </Button>
                </Box>

                {/* Selected Categories */}
                {selectedCategories.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{
                      fontSize: { xs: '0.75rem', sm: '0.75rem' }
                    }}>
                      Selected categories:
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedCategories.map((category, index) => (
                        <Chip
                          key={`${category}-${index}`}
                          label={category}
                          onDelete={() => setSelectedCategories(selectedCategories.filter((_, i) => i !== index))}
                          color="primary"
                          variant="filled"
                          sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.75rem' }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>

              <Button
                onClick={handleAddExpense}
                variant="contained"
                size="large"
                disabled={!amount || !description || selectedCategories.length === 0}
                sx={{ 
                  minHeight: { xs: 40, sm: 56 },
                  fontSize: { xs: '0.675rem', sm: '1rem' },
                  padding: { xs: 1, sm: 2 }
                }}
              >
                {editId ? 'Update Expense' : 'Add Expense'}
              </Button>
            </Box>

            {/* Edit Expense Dialog */}
            <Dialog 
              open={editOpen} 
              onClose={() => setEditOpen(false)} 
              maxWidth="md" 
              fullWidth
              PaperProps={{
                sx: { 
                  m: { xs: 2, sm: 'auto' },
                  width: { xs: 'calc(100% - 32px)', sm: 'auto' }
                }
              }}
            >
              <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Edit Expense</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 }, mt: 1 }}>
                  <TextField 
                    label="Amount" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    fullWidth 
                    size="small"
                    sx={{
                      '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                    }}
                  />
                  <TextField 
                    label="Description" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    fullWidth 
                    size="small"
                    sx={{
                      '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                    }}
                  />
                  <TextField 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    fullWidth 
                    size="small"
                    sx={{
                      '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                    }}
                  />

                  {/* Category Selection in Edit Dialog */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ 
                      mb: 1,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}>
                      Select Categories:
                    </Typography>

                    {/* Existing Categories */}
                    {existingCategories.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{
                          fontSize: { xs: '0.75rem', sm: '0.75rem' }
                        }}>
                          Existing categories:
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {existingCategories.map((category) => (
                            <Chip
                              key={category}
                              label={category}
                              onClick={() => {
                                if (!selectedCategories.includes(category)) {
                                  setSelectedCategories([...selectedCategories, category]);
                                }
                              }}
                              color={selectedCategories.includes(category) ? "primary" : "default"}
                              variant={selectedCategories.includes(category) ? "filled" : "outlined"}
                              sx={{ 
                                cursor: 'pointer',
                                fontSize: { xs: '0.75rem', sm: '0.75rem' }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Add New Category */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'stretch', sm: 'center' }, 
                      gap: 1 
                    }}>
                      <TextField
                        size="small"
                        label="Add New Category"
                        value={categoryInput}
                        onChange={e => setCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && categoryInput.trim()) {
                            const newCategory = categoryInput.trim();
                            if (!selectedCategories.includes(newCategory)) {
                              setSelectedCategories([...selectedCategories, newCategory]);
                            }
                            setCategoryInput('');
                          }
                        }}
                        sx={{ 
                          flexGrow: 1,
                          '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                        }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (categoryInput.trim()) {
                            const newCategory = categoryInput.trim();
                            if (!selectedCategories.includes(newCategory)) {
                              setSelectedCategories([...selectedCategories, newCategory]);
                            }
                            setCategoryInput('');
                          }
                        }}
                        sx={{ 
                          minHeight: { xs: 44, sm: 40 },
                          fontSize: { xs: '0.875rem', sm: '0.875rem' }
                        }}
                      >
                        Add
                      </Button>
                    </Box>

                    {/* Selected Categories */}
                    {selectedCategories.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{
                          fontSize: { xs: '0.75rem', sm: '0.75rem' }
                        }}>
                          Selected categories:
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedCategories.map((category, index) => (
                            <Chip
                              key={`${category}-${index}`}
                              label={category}
                              onDelete={() => setSelectedCategories(selectedCategories.filter((_, i) => i !== index))}
                              color="primary"
                              variant="filled"
                              sx={{ 
                                fontSize: { xs: '0.75rem', sm: '0.75rem' }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions sx={{ 
                p: { xs: 1.5, sm: 2 },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 }
              }}>
                <Button 
                  onClick={handleAddExpense} 
                  variant="contained"
                  fullWidth={isMobile}
                  size="small"
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    minHeight: { xs: 44, sm: 32 }
                  }}
                >
                  Save
                </Button>
                <Button 
                  onClick={() => {
                    setEditOpen(false);
                    setEditId(null);
                    setAmount('');
                    setDescription('');
                    setDate('');
                    setSelectedCategories([]);
                  }}
                  fullWidth={isMobile}
                  size="small"
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    minHeight: { xs: 44, sm: 32 }
                  }}
                >
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>

            {/* Expense List Component */}
            <ExpenseList
              expenses={expenses}
              onEdit={(expense) => {
                setEditId(expense.id);
                setAmount(expense.amount.toString());
                setDescription(expense.description);
                setSelectedCategories(expense.categories || []);
                setDate(expense.date);
                setEditOpen(true);
              }}
              onDelete={handleDelete}
            />
          </>
        ) : (
          <Box sx={{
            textAlign: 'center',
            mt: { xs: 4, sm: 8 },
            p: { xs: 2, sm: 4 },
            borderRadius: 2,
            backgroundColor: 'background.paper',
            flexGrow: 1
          }}>
            <Typography variant="h4" sx={{ 
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: '1.75rem', sm: '2.125rem' }
            }}>
              Welcome to Expense Tracker
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ 
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}>
              Sign in to start tracking your expenses and managing your budget effectively.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleLoginClick}
              sx={{
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF5252, #26A69A)',
                },
                minHeight: { xs: 48, sm: 56 },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Get Started
            </Button>
          </Box>
        )}

        {/* Footer Component */}
        <Footer />
      </Container>
    </ThemeProvider>
  );
}
