// Expense Tracker with React, Firebase, Material UI, Authentication, Add/Edit/Delete
// Features:
// - User login/register (Firebase Auth)
// - Add expense with multiple categories
// - Edit/Delete expenses
// - Filter by date range and categories
// - Per-user data isolation
// - Dark/Light theme switching

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, where, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Container, Button, Typography, Box, ThemeProvider, CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Analysis from './components/Analysis';
import ExpenseList from './components/ExpenseList';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthDialog from './components/AuthDialog';
import ExpenseFormDialog from './components/ExpenseFormDialog';
import { auth, db } from './firebase.js';
import { lightTheme, darkTheme } from './theme.js';

export default function App() {
  const theme = useTheme();
  // eslint-disable-next-line no-unused-vars
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);

  // Dialog states
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

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


  const handleAddExpenseSubmit = async (data) => {
    if (!auth.currentUser) return;

    const expenseData = {
      ...data,
      uid: auth.currentUser.uid,
      createdAt: new Date()
    };

    try {
      await addDoc(collection(db, 'expenses'), expenseData);
      setAddExpenseOpen(false);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense');
    }
  };

  const handleUpdateExpenseSubmit = async (data) => {
    if (!editId) return;

    const expenseData = {
      ...data,
      updatedAt: new Date()
    };

    try {
      await updateDoc(doc(db, 'expenses', editId), expenseData);
      setEditId(null);
      setExpenseToEdit(null);
      setEditOpen(false);
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Error updating expense');
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'expenses', id));
  };

  const handleOpenAddExpense = () => {
    setAddExpenseOpen(true);
  };

  const handleCloseAddExpense = () => {
    setAddExpenseOpen(false);
  };

  const handleOpenEditExpense = (expense) => {
    setEditId(expense.id);
    setExpenseToEdit(expense);
    setEditOpen(true);
  };

  const handleCloseEditExpense = () => {
    setEditOpen(false);
    setEditId(null);
    setExpenseToEdit(null);
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Container sx={{ pt: { xs: 1, sm: 2 }, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header
            user={user}
            onLogout={handleLogout}
            onThemeToggle={handleThemeToggle}
            isDarkMode={isDarkMode}
            onLogin={handleLoginClick}
          />

          <AuthDialog
            open={authDialogOpen}
            onClose={() => setAuthDialogOpen(false)}
          />

          <Routes>
            <Route path="/" element={
              user ? (
                <>
                  <Box sx={{ mt: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{
                      fontSize: { xs: '1.5rem', sm: '1.75rem' }
                    }}>
                      My Expenses
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleOpenAddExpense}
                      sx={{
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        color: 'white',
                      }}
                    >
                      Add Expense
                    </Button>
                  </Box>

                  <ExpenseFormDialog
                    open={addExpenseOpen}
                    onClose={handleCloseAddExpense}
                    onSubmit={handleAddExpenseSubmit}
                    existingCategories={existingCategories}
                    title="Add New Expense"
                    submitLabel="Add Expense"
                  />

                  <ExpenseFormDialog
                    open={editOpen}
                    onClose={handleCloseEditExpense}
                    onSubmit={handleUpdateExpenseSubmit}
                    initialData={expenseToEdit}
                    existingCategories={existingCategories}
                    title="Edit Expense"
                    submitLabel="Save Changes"
                  />

                  <ExpenseList
                    expenses={expenses}
                    onEdit={handleOpenEditExpense}
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
              )
            } />
            <Route path="/analysis" element={
              user ? <Analysis expenses={expenses} /> : <Navigate to="/" />
            } />
          </Routes>

          <Footer />
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}
