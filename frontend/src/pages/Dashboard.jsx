import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Package, Layers, Calendar, Plus, ArrowRight, DollarSign, AlertTriangle, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState({
    totalProducts: 0,
    totalCategories: 0,
    productsAddedToday: 0,
    totalValue: 0,
    lowStockCount: 0,
    lowStockProducts: [],
    categoryData: [],
    recentProducts: [],
    activityLogs: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setData({
          ...response.data,
          categoryData: response.data.categoryData || [],
          recentProducts: response.data.recentProducts || [],
          lowStockProducts: response.data.lowStockProducts || [],
          activityLogs: response.data.activityLogs || []
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch dashboard stats');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="container text-center" style={{ marginTop: '4rem' }}>Loading dashboard...</div>;
  if (error) return <div className="container text-center" style={{ color: 'var(--danger-color)', marginTop: '4rem' }}>{error}</div>;

  return (
    <div className="container page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Dashboard Overview</h1>
        <Link to="/products" className="btn btn-primary flex items-center gap-4">
          <Plus size={18} /> Manage Products
        </Link>
      </div>
      
      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Card 1: Total Inventory Value */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', padding: '0.85rem', borderRadius: '12px' }}>
            <DollarSign size={26} color="var(--accent-color)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Total Value</p>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 700, margin: 0 }}>
              ${(data.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        {/* Card 2: Total Products */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', padding: '0.85rem', borderRadius: '12px' }}>
            <Package size={26} color="var(--accent-color)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Total Products</p>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 700, margin: 0 }}>{data.totalProducts}</h2>
          </div>
        </div>

        {/* Card 3: Total Categories */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '0.85rem', borderRadius: '12px' }}>
            <Layers size={26} color="var(--success-color)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Total Categories</p>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 700, margin: 0 }}>{data.totalCategories}</h2>
          </div>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div className="glass-panel" style={{ 
          padding: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.25rem',
          border: (data.lowStockCount || 0) > 0 ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid var(--glass-border)'
        }}>
          <div style={{ backgroundColor: (data.lowStockCount || 0) > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(148, 163, 184, 0.12)', padding: '0.85rem', borderRadius: '12px' }}>
            <AlertTriangle size={26} color={(data.lowStockCount || 0) > 0 ? 'var(--danger-color)' : 'var(--text-secondary)'} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Low Stock Items</p>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 700, margin: 0, color: (data.lowStockCount || 0) > 0 ? 'var(--danger-color)' : 'var(--text-primary)' }}>
              {data.lowStockCount || 0}
            </h2>
          </div>
        </div>
      </div>

      {/* Row 1: Category Chart & Recent Products */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Category Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Products by Category</h3>
          {data.categoryData.length > 0 ? (
            <div style={{ flex: 1, minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.1)" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              No category data available.
            </div>
          )}
        </div>

        {/* Recent Products Table */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Recently Added</h3>
            <Link to="/products" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          
          {data.recentProducts.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Name</th>
                    <th style={{ padding: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Category</th>
                    <th style={{ padding: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentProducts.map((product) => (
                    <tr key={product._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{product.productName}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{product.category || '-'}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>${product.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No products added yet.
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Low Stock List & Activity Audit Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Low Stock Warning Box */}
        <div className="glass-panel" style={{ padding: '1.5rem', border: data.lowStockCount > 0 ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} color="var(--danger-color)" /> Low Stock Warnings
          </h3>
          {data.lowStockProducts.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Name</th>
                    <th style={{ padding: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Stock</th>
                    <th style={{ padding: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.map((product) => (
                    <tr key={product._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 500 }}>{product.productName}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--danger-color)', fontWeight: 600 }}>{product.quantity}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{product.stockThreshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '3.5rem 0', textAlign: 'center', color: 'var(--success-color)', fontSize: '0.95rem', fontWeight: 500 }}>
              ✓ All items are sufficiently stocked!
            </div>
          )}
        </div>

        {/* Activity Logs (Audit Feed) */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--accent-color)" /> System Activity Audit
          </h3>
          {data.activityLogs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.activityLogs.map((log) => (
                <div key={log._id} style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{log.details}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>By: {log.userName} ({log.userRole})</span>
                    <span>•</span>
                    <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '3.5rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No system activity logs yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
