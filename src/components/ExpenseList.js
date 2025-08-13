import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, IconButton, Box, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, TextField, Chip, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';

const ExpenseList = ({ expenses = [], onEdit, onDelete }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Filter states with default values
  const [selectedFilterCategories, setSelectedFilterCategories] = useState([]);
  const [filterStartDate, setFilterStartDate] = useState(() => {
    // Set to 1st of current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return firstDayOfMonth.toISOString().split('T')[0];
  });
  const [filterEndDate, setFilterEndDate] = useState(() => {
    // Set to current date
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [filterAmountMin, setFilterAmountMin] = useState('');
  const [filterAmountMax, setFilterAmountMax] = useState('');

  // Get unique categories from expenses for filter options
  const availableCategories = useMemo(() => {
    return [...new Set(expenses.flatMap(exp => exp.categories || []))];
  }, [expenses]);

  // Helper function to get current month range
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: firstDayOfMonth.toISOString().split('T')[0],
      end: lastDayOfMonth.toISOString().split('T')[0]
    };
  };

  // Apply filters to expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Category filter
      if (selectedFilterCategories.length > 0) {
        const hasMatchingCategory = selectedFilterCategories.some(cat => 
          expense.categories && expense.categories.includes(cat)
        );
        if (!hasMatchingCategory) return false;
      }

      // Date range filter
      if (filterStartDate && new Date(expense.date) < new Date(filterStartDate)) {
        return false;
      }
      if (filterEndDate && new Date(expense.date) > new Date(filterEndDate)) {
        return false;
      }

      // Amount range filter
      if (filterAmountMin && expense.amount < parseFloat(filterAmountMin)) {
        return false;
      }
      if (filterAmountMax && expense.amount > parseFloat(filterAmountMax)) {
        return false;
      }

      return true;
    });
  }, [expenses, selectedFilterCategories, filterStartDate, filterEndDate, filterAmountMin, filterAmountMax]);

  // Calculate total for filtered expenses
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilterCategories([]);
    // Reset dates to current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    setFilterStartDate(firstDayOfMonth.toISOString().split('T')[0]);
    setFilterEndDate(now.toISOString().split('T')[0]);
    setFilterAmountMin('');
    setFilterAmountMax('');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedFilterCategories.length > 0 || 
                          filterStartDate || 
                          filterEndDate || 
                          filterAmountMin || 
                          filterAmountMax;

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (expenseToDelete) {
      onDelete(expenseToDelete.id);
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setExpenseToDelete(null);
  };

  return (
    <>
      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon />
            Filters
          </Typography>
          {hasActiveFilters && (
            <Button size="small" onClick={clearFilters} color="secondary">
              Reset to Current Month
            </Button>
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Default view shows current month's expenses. Use filters below to customize your view.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          {/* Category Filter */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Categories</InputLabel>
            <Select
              multiple
              value={selectedFilterCategories}
              onChange={(e) => setSelectedFilterCategories(e.target.value)}
              label="Filter by Categories"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {availableCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date Range Filter */}
          <TextField
            type="date"
            label="From Date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="To Date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          
          {/* Quick Filter Buttons */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const { start, end } = getCurrentMonthRange();
              setFilterStartDate(start);
              setFilterEndDate(end);
            }}
            sx={{ height: 56, px: 2 }}
          >
            Current Month
          </Button>

          {/* Amount Range Filter */}
          <TextField
            type="number"
            label="Min Amount"
            value={filterAmountMin}
            onChange={(e) => setFilterAmountMin(e.target.value)}
            InputProps={{ startAdornment: '₹' }}
            sx={{ width: 120 }}
          />
          <TextField
            type="number"
            label="Max Amount"
            value={filterAmountMax}
            onChange={(e) => setFilterAmountMax(e.target.value)}
            InputProps={{ startAdornment: '₹' }}
            sx={{ width: 120 }}
          />
        </Box>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Active filters:
            </Typography>
            {selectedFilterCategories.map(cat => (
              <Chip key={cat} label={`Category: ${cat}`} size="small" color="primary" variant="outlined" />
            ))}
            {filterStartDate && (
              <Chip label={`From: ${new Date(filterStartDate).toLocaleDateString()}`} size="small" color="primary" variant="outlined" />
            )}
            {filterEndDate && (
              <Chip label={`To: ${new Date(filterEndDate).toLocaleDateString()}`} size="small" color="primary" variant="outlined" />
            )}
            {filterAmountMin && (
              <Chip label={`Min: ₹${filterAmountMin}`} size="small" color="primary" variant="outlined" />
            )}
            {filterAmountMax && (
              <Chip label={`Max: ₹${filterAmountMax}`} size="small" color="primary" variant="outlined" />
            )}
          </Box>
        )}
      </Paper>

      {/* Summary Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            My Expenses
            <Typography component="span" variant="body2" color="text.secondary"
              sx={{
                ml: { xs: 0, sm: 1 }, // 0 on mobile, 1 on larger screens
                display: { xs: 'inline-block', sm: 'inline' } // inline-block on mobile
              }}
            >
              {hasActiveFilters 
                ? `(Filtered: ${filteredExpenses.length} of ${expenses.length})`
                : `(${expenses.length} total)`
              }
            </Typography>
          </Typography>
          <Typography variant="h6" color="primary">
            Total: ₹{totalAmount.toFixed(2)}
          </Typography>
        </Box>
      </Paper>

      {/* Expenses Table */}
      <TableContainer component={Paper}>
        {filteredExpenses.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {hasActiveFilters 
                ? 'No expenses match the current filters. Try adjusting your filter criteria.'
                : 'No expenses found. Add your first expense above!'
              }
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Categories</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell>₹{exp.amount}</TableCell>
                  <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                  <TableCell>{exp.description || '-'}</TableCell>
                  <TableCell>
                    {exp.categories && exp.categories.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {exp.categories.map((cat, index) => (
                          <Chip key={index} label={cat} size="small" variant="outlined" />
                        ))}
                      </Box>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => onEdit(exp)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteClick(exp)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the expense "{expenseToDelete?.description}" for ₹{expenseToDelete?.amount}?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExpenseList;
