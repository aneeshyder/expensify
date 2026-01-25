import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, Typography, Chip,
    useTheme, useMediaQuery
} from '@mui/material';

const ExpenseFormDialog = ({
    open,
    onClose,
    onSubmit,
    initialData = null,
    existingCategories = [],
    title = "Add Expense",
    submitLabel = "Save"
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categoryInput, setCategoryInput] = useState('');

    // Reset or populate form when dialog opens or initialData changes
    useEffect(() => {
        if (open) {
            if (initialData) {
                setAmount(initialData.amount.toString());
                setDescription(initialData.description);
                setDate(initialData.date);
                setSelectedCategories(initialData.categories || []);
            } else {
                setAmount('');
                setDescription('');
                setDate('');
                setSelectedCategories([]);
            }
            setCategoryInput('');
        }
    }, [open, initialData]);

    const handleSubmit = () => {
        const data = {
            amount: parseFloat(amount),
            description,
            date,
            categories: selectedCategories
        };
        onSubmit(data);
    };

    const handleAddCategory = () => {
        if (categoryInput.trim()) {
            const newCategory = categoryInput.trim();
            if (!selectedCategories.includes(newCategory)) {
                setSelectedCategories([...selectedCategories, newCategory]);
            }
            setCategoryInput('');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    m: { xs: 2, sm: 'auto' },
                    width: { xs: 'calc(100% - 32px)', sm: 'auto' }
                }
            }}
        >
            <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>{title}</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 1 }}>
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
                            type="number"
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
                                    if (e.key === 'Enter') {
                                        handleAddCategory();
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
                                onClick={handleAddCategory}
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
                    onClick={handleSubmit}
                    variant="contained"
                    fullWidth={isMobile}
                    size="small"
                    disabled={!amount || !description || selectedCategories.length === 0}
                    sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        minHeight: { xs: 44, sm: 32 }
                    }}
                >
                    {submitLabel}
                </Button>
                <Button
                    onClick={onClose}
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
    );
};

export default ExpenseFormDialog;
