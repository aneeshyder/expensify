import React, { useMemo, useState } from 'react';
import { Box, Typography, Paper, Grid, useTheme, useMediaQuery, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const Analysis = ({ expenses = [] }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [timeRange, setTimeRange] = useState('6M');

    // Filter expenses based on time range
    const filteredExpenses = useMemo(() => {
        const now = new Date();
        const filterDate = new Date();

        switch (timeRange) {
            case '1M':
                filterDate.setMonth(now.getMonth() - 1);
                break;
            case '3M':
                filterDate.setMonth(now.getMonth() - 3);
                break;
            case '6M':
                filterDate.setMonth(now.getMonth() - 6);
                break;
            case '1Y':
                filterDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'ALL':
                return expenses;
            default:
                filterDate.setMonth(now.getMonth() - 6);
        }

        return expenses.filter(expense => new Date(expense.date) >= filterDate);
    }, [expenses, timeRange]);

    // Calculate total expenses by category
    const categoryData = useMemo(() => {
        const data = {};
        filteredExpenses.forEach(expense => {
            if (expense.categories && expense.categories.length > 0) {
                // Split amount equally among categories if multiple
                const amountPerCategory = expense.amount / expense.categories.length;
                expense.categories.forEach(cat => {
                    data[cat] = (data[cat] || 0) + amountPerCategory;
                });
            } else {
                data['Uncategorized'] = (data['Uncategorized'] || 0) + expense.amount;
            }
        });

        return Object.keys(data).map(name => ({
            name,
            value: parseFloat(data[name].toFixed(2))
        })).sort((a, b) => b.value - a.value);
    }, [filteredExpenses]);

    // Calculate monthly expenses
    const monthlyData = useMemo(() => {
        const data = {};
        const today = new Date();
        let monthsToShow = 6;

        if (timeRange === '1M') monthsToShow = 1;
        else if (timeRange === '3M') monthsToShow = 3;
        else if (timeRange === '6M') monthsToShow = 6;
        else if (timeRange === '1Y') monthsToShow = 12;
        else monthsToShow = 12; // Show last year for ALL for now, or could be dynamic

        // Initialize months
        for (let i = monthsToShow - 1; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            data[key] = 0;
        }

        filteredExpenses.forEach(expense => {
            const d = new Date(expense.date);
            const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            if (data.hasOwnProperty(key)) {
                data[key] += expense.amount;
            }
        });

        return Object.keys(data).map(name => ({
            name,
            amount: parseFloat(data[name].toFixed(2))
        }));
    }, [filteredExpenses, timeRange]);

    const totalExpense = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

    if (expenses.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="h6" color="text.secondary">
                    No expenses to analyze yet. Add some expenses to see charts!
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Expense Analysis
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Time Range</InputLabel>
                    <Select
                        value={timeRange}
                        label="Time Range"
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <MenuItem value="1M">Last Month</MenuItem>
                        <MenuItem value="3M">Last 3 Months</MenuItem>
                        <MenuItem value="6M">Last 6 Months</MenuItem>
                        <MenuItem value="1Y">Last Year</MenuItem>
                        <MenuItem value="ALL">All Time</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3} className="analysis-grid">
                {/* Category Pie Chart */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom align="center">Expenses by Category</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ cx, cy, x, y, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                                        return (
                                            <text
                                                x={x}
                                                y={y}
                                                fill={theme.palette.text.primary}
                                                textAnchor={x > cx ? 'start' : 'end'}
                                                dominantBaseline="central"
                                                style={{ fontSize: isMobile ? '10px' : '14px' }}
                                            >
                                                {`${name} ${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
                                    outerRadius={isMobile ? 80 : 120}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Monthly Bar Chart */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom align="center">Monthly Trends (Last 6 Months)</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={monthlyData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                                <Legend />
                                <Bar dataKey="amount" fill="#82ca9d" name="Amount" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Summary Cards */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', color: 'white' }}>
                        <Typography variant="h6">Total Expenses</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                            ₹{totalExpense.toLocaleString('en-IN')}
                        </Typography>
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
};

export default Analysis;
