import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, X, Download } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ProductList = () => {
  const { user } = useContext(AuthContext);
  const canEdit = user && (user.role === 'Admin' || user.role === 'Manager');
  const canDelete = user && user.role === 'Admin';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sortByPrice, setSortByPrice] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    status: 'Active',
    sku: '',
    stockThreshold: 10,
    supplierName: '',
    supplierEmail: ''
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page,
        search,
        category,
        status,
        sortByPrice
      }).toString();
      
      const { data } = await api.get(`/products?${query}`);
      setProducts(data.products);
      setPages(data.pages);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, category, status, sortByPrice]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({
        productName: product.productName,
        description: product.description || '',
        category: product.category || '',
        price: product.price,
        quantity: product.quantity,
        status: product.status,
        sku: product.sku || '',
        stockThreshold: product.stockThreshold || 10,
        supplierName: product.supplierName || '',
        supplierEmail: product.supplierEmail || ''
      });
    } else {
      setCurrentProduct(null);
      setFormData({
        productName: '',
        description: '',
        category: '',
        price: '',
        quantity: '',
        status: 'Active',
        sku: '',
        stockThreshold: 10,
        supplierName: '',
        supplierEmail: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentProduct) {
        await api.put(`/products/${currentProduct._id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const confirmDelete = (product) => {
    setCurrentProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${currentProduct._id}`);
      setIsDeleteModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleExportCSV = () => {
    try {
      if (products.length === 0) {
        return alert('No product data to export');
      }
      
      const headers = ['Product Name', 'SKU', 'Category', 'Price', 'Quantity', 'Status', 'Stock Threshold', 'Supplier Name', 'Supplier Email'];
      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const p of products) {
        const values = [
          `"${p.productName.replace(/"/g, '""')}"`,
          `"${(p.sku || '').replace(/"/g, '""')}"`,
          `"${(p.category || '').replace(/"/g, '""')}"`,
          p.price,
          p.quantity,
          `"${p.status}"`,
          p.stockThreshold || 10,
          `"${(p.supplierName || 'N/A').replace(/"/g, '""')}"`,
          `"${(p.supplierEmail || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(values.join(','));
      }

      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export CSV');
    }
  };

  return (
    <div className="container page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Product Management</h1>
        <div className="flex items-center gap-4">
          <button onClick={handleExportCSV} className="btn btn-outline flex items-center gap-4">
            <Download size={18} /> Export CSV
          </button>
          {canEdit && (
            <button onClick={() => openModal()} className="btn btn-primary flex items-center gap-4">
              <Plus size={18} /> Add Product
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search by name or SKU..." 
              className="form-input" 
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Food">Food</option>
            <option value="Other">Other</option>
          </select>

          <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select className="form-input" value={sortByPrice} onChange={(e) => setSortByPrice(e.target.value)}>
            <option value="">Sort By Price (Default)</option>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading products...</div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger-color)' }}>{error}</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No products found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Product Name</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SKU</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Price</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Quantity</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                {canEdit && <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem' }}>{product.productName}</td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{product.sku || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>{product.category || '-'}</td>
                  <td style={{ padding: '1rem' }}>${product.price.toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{product.quantity}</span>
                      {product.quantity <= (product.stockThreshold || 10) && (
                        <span style={{ 
                          padding: '0.15rem 0.4rem', 
                          borderRadius: '4px', 
                          fontSize: '0.65rem', 
                          fontWeight: 700, 
                          backgroundColor: 'rgba(239, 68, 68, 0.12)', 
                          color: 'var(--danger-color)',
                          border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}>
                          LOW
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      backgroundColor: product.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: product.status === 'Active' ? 'var(--success-color)' : 'var(--danger-color)'
                    }}>
                      {product.status}
                    </span>
                  </td>
                  {canEdit && (
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => openModal(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-color)', marginRight: '1rem' }}>
                        <Edit2 size={18} />
                      </button>
                      {canDelete && (
                        <button onClick={() => confirmDelete(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}>
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
            className="btn btn-outline flex items-center gap-4"
          >
            <ChevronLeft size={18} /> Prev
          </button>
          <span style={{ color: 'var(--text-secondary)' }}>Page {page} of {pages}</span>
          <button 
            onClick={() => setPage(p => Math.min(pages, p + 1))} 
            disabled={page === pages}
            className="btn btn-outline flex items-center gap-4"
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '750px', padding: '2.25rem', maxHeight: '95vh', overflowY: 'auto', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-6" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="responsive-modal-form">
              {/* Left Column: Product Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Product Name *</label>
                  <input type="text" className="form-input" name="productName" value={formData.productName} onChange={handleInputChange} required minLength={3} placeholder="e.g. Wireless Mouse" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Describe the product details..." style={{ resize: 'none' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <input type="text" className="form-input" name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. Electronics" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Product SKU</label>
                  <input type="text" className="form-input" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="Auto-generated if empty" />
                </div>
              </div>

              {/* Right Column: Inventory & Supplier */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Price ($) *</label>
                    <input type="number" step="0.01" className="form-input" name="price" value={formData.price} onChange={handleInputChange} required min="0.01" placeholder="0.00" />
                  </div>
                  <div style={{ flex: 1 }} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Quantity *</label>
                    <input type="number" className="form-input" name="quantity" value={formData.quantity} onChange={handleInputChange} required min="0" placeholder="0" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Status *</label>
                    <select className="form-input" name="status" value={formData.status} onChange={handleInputChange} required style={{ cursor: 'pointer' }}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Stock Warning Limit *</label>
                    <input type="number" className="form-input" name="stockThreshold" value={formData.stockThreshold} onChange={handleInputChange} required min="0" placeholder="10" />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Supplier Name</label>
                  <input type="text" className="form-input" name="supplierName" value={formData.supplierName} onChange={handleInputChange} placeholder="Supplier Company name" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Supplier Email</label>
                  <input type="email" className="form-input" name="supplierEmail" value={formData.supplierEmail} onChange={handleInputChange} placeholder="supplier@example.com" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between mt-4" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem', marginBottom: 0 }}>
                <button type="button" onClick={closeModal} className="btn btn-outline" style={{ padding: '0.75rem 2rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>{currentProduct ? 'Update Product' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
            <Trash2 size={48} color="var(--danger-color)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Delete Product?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Are you sure you want to delete "{currentProduct?.productName}"? This action cannot be undone.</p>
            <div className="flex gap-4" style={{ justifyContent: 'center' }}>
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn btn-outline">Cancel</button>
              <button onClick={handleDelete} className="btn btn-danger">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
