import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, IconButton, Box, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, TextField, Chip, FormControl, InputLabel, Select, MenuItem,
  useMediaQuery, useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';

const ExpenseList = ({ expenses = [], onEdit, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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

  // Helper function to format numbers in Indian standard (with commas at thousands, lakhs, crores)
  const formatIndianNumber = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return '0';
    
    const numStr = number.toString();
    const [wholePart, decimalPart] = numStr.split('.');
    
    // Add commas to whole part following Indian numbering system
    let formattedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Return with decimal part if it exists
    return decimalPart ? `${formattedWhole}.${decimalPart}` : formattedWhole;
  };

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
          const hasAllCategories = selectedFilterCategories.every(cat =>
            expense.categories && expense.categories.includes(cat)
          );
          if (!hasAllCategories) return false;
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
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', mb: 2, gap: 1 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            <FilterListIcon />
            Filters
          </Typography>
          {hasActiveFilters && (
            <Button 
              size="small" 
              onClick={clearFilters} 
              color="secondary"
              variant="outlined"
              sx={{ 
                minWidth: { xs: 'auto', sm: 'auto' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                height: { xs: 40, sm: 32 }
              }}
            >
              Reset to Current Month
            </Button>
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Default view shows current month's expenses. Use filters below to customize your view.
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          flexWrap: 'wrap', 
          gap: { xs: 1.5, sm: 2 }, 
          alignItems: { xs: 'stretch', sm: 'center' } 
        }}>
          {/* Category Filter */}
          <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
            <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Filter by Categories</InputLabel>
            <Select
              multiple
              value={selectedFilterCategories}
              onChange={(e) => setSelectedFilterCategories(e.target.value)}
              label="Filter by Categories"
              size="small"
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
            InputLabelProps={{ 
              shrink: true,
              sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
            }}
            size="small"
            sx={{ 
              minWidth: { xs: '100%', sm: 'auto' },
              '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
            }}
          />
          <TextField
            type="date"
            label="To Date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            InputLabelProps={{ 
              shrink: true,
              sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
            }}
            size="small"
            sx={{ 
              minWidth: { xs: '100%', sm: 'auto' },
              '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
            }}
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
            sx={{ 
              height: { xs: 40, sm: 56 }, 
              px: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              minHeight: { xs: 44, sm: 56 } // Better touch target for mobile
            }}
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
            size="small"
            sx={{ 
              width: { xs: '100%', sm: 120 },
              '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
            }}
            InputLabelProps={{ sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
          />
          <TextField
            type="number"
            label="Max Amount"
            value={filterAmountMax}
            onChange={(e) => setFilterAmountMax(e.target.value)}
            InputProps={{ startAdornment: '₹' }}
            size="small"
            sx={{ 
              width: { xs: '100%', sm: 120 },
              '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
            }}
            InputLabelProps={{ sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
          />
        </Box>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' } }}>
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
              <Chip label={`Min: ₹${formatIndianNumber(parseFloat(filterAmountMin))}`} size="small" color="primary" variant="outlined" />
            )}
            {filterAmountMax && (
              <Chip label={`Max: ₹${formatIndianNumber(parseFloat(filterAmountMax))}`} size="small" color="primary" variant="outlined" />
            )}
          </Box>
        )}
      </Paper>

      {/* Summary Section */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: { xs: 1, sm: 0 }
        }}>
          <Typography variant="h6"
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            My Expenses
            <Typography component="span" variant="body2" color="text.secondary"
              sx={{
                ml: { xs: 0, sm: 1 },
                display: { xs: 'block', sm: 'inline' },
                mt: { xs: 0.5, sm: 0 }
              }}
            >
              {hasActiveFilters 
                ? `(Filtered: ${filteredExpenses.length} of ${expenses.length})`
                : `(${expenses.length} total)`
              }
            </Typography>
          </Typography>
          <Typography variant="h6" color="primary" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            Total: ₹{formatIndianNumber(totalAmount)}
          </Typography>
        </Box>
      </Paper>

      {/* Expenses Table */}
      <TableContainer component={Paper} sx={{ 
        overflowX: 'auto',
        '& .MuiTable-root': { 
          minWidth: { xs: 300, sm: 650 },
          tableLayout: { xs: 'fixed', sm: 'auto' }
        }
      }}>
        {filteredExpenses.length === 0 ? (
          <Box sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              {hasActiveFilters 
                ? 'No expenses match the current filters. Try adjusting your filter criteria.'
                : 'No expenses found. Add your first expense above!'
              }
            </Typography>
          </Box>
        ) : (
          <Table sx={{
            '& .MuiTableCell-root': { 
              padding: { xs: '8px', sm: '16px' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }
          }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  width: { xs: '20%', sm: 'auto' }
                }}>Amount</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  width: { xs: '20%', sm: 'auto' }
                }}>Date</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  width: { xs: 130, sm: 'auto' }
                }}>Description</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  width: { xs: '20%', sm: 'auto' }
                }}>Categories</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  width: { xs: '15%', sm: 'auto' }
                }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    wordBreak: 'break-word'
                  }}>₹{formatIndianNumber(exp.amount)}</TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    wordBreak: 'break-word'
                  }}>{new Date(exp.date).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    maxWidth: { xs: 110, sm: 200 },
                    overflow: 'hidden',
                    wordBreak: 'break-word'
                  }}>
                    {exp.description || '-'}
                  </TableCell>
                  <TableCell>
                    {exp.categories && exp.categories.length > 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 0.5,
                        maxWidth: { xs: 100, sm: 'none' }
                      }}>
                        {exp.categories.map((cat, index) => (
                          <Chip 
                            key={index} 
                            label={cat} 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              fontSize: { xs: '0.625rem', sm: '0.75rem' },
                              maxWidth: { xs: 80, sm: 'none' },
                              '& .MuiChip-label': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => onEdit(exp)}
                        color="primary"
                        sx={{ 
                          padding: { xs: '8px', sm: '8px' },
                          minWidth: { xs: 44, sm: 40 },
                          minHeight: { xs: 44, sm: 40 },
                          '& .MuiSvgIcon-root': { fontSize: { xs: '1.25rem', sm: '1.25rem' } }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteClick(exp)}
                        color="error"
                        sx={{ 
                          padding: { xs: '8px', sm: '8px' },
                          minWidth: { xs: 44, sm: 40 },
                          minHeight: { xs: 44, sm: 40 },
                          '& .MuiSvgIcon-root': { fontSize: { xs: '1.25rem', sm: '1.25rem' } }
                        }}
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
      <Dialog 
        open={deleteDialogOpen} 
        onClose={cancelDelete}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { 
            m: { xs: 2, sm: 'auto' },
            width: { xs: 'calc(100% - 32px)', sm: 'auto' },
            maxWidth: { xs: 'calc(100% - 32px)', sm: '600px' }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Are you sure you want to delete the expense "{expenseToDelete?.description}" for ₹{formatIndianNumber(expenseToDelete?.amount)}?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: { xs: '0.75rem', sm: '0.75rem' } }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 1.5, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button 
            onClick={cancelDelete} 
            color="primary"
            size="small"
            fullWidth={isMobile}
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              minHeight: { xs: 44, sm: 32 }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            size="small"
            fullWidth={isMobile}
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              minHeight: { xs: 44, sm: 32 }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExpenseList;
