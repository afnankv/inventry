import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../styles/dashboard.css';

const emptyForm = { name: '', description: '', price: '', quantity: '' };

const ProductDashboard = () => {
    const { user, logout } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    
    const [notification, setNotification] = useState(null);

    const showNotification = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
        
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/products', { params: search ? { search } : {} });
            setProducts(data);
        } catch (err) {
            showNotification('Failed to fetch products', 'error');
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => fetchProducts(), 300);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    const openAddForm = () => {
        setEditingProduct(null);
        setForm(emptyForm);
        setFormError('');
        setShowForm(true);
    };

    const openEditForm = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name,
            description: product.description || '',
            price: product.price,
            quantity: product.quantity,
        });
        setFormError('');
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingProduct(null);
        setForm(emptyForm);
        setFormError('');
    };

    const handleFormChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!form.name || form.price === '') {
            setFormError('Name and Price are required.');
            return;
        }
        if (isNaN(form.price) || Number(form.price) < 0) {
            setFormError('Price must be a valid non-negative number.');
            return;
        }
        if (isNaN(form.quantity) || Number(form.quantity) < 0) {
            setFormError('Quantity must be a valid non-negative number.');
            return;
        }

        setFormLoading(true);
        const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            price: Number(form.price),
            quantity: Number(form.quantity),
        };

        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct._id}`, payload);
                showNotification(`Product "${editingProduct.name}" updated successfully!`);
            } else {
                await api.post('/products', payload);
                showNotification(`Product "${form.name}" added successfully!`);
            }
            closeForm();    
            fetchProducts();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Something went wrong.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (product) => {
        try {
            await api.delete(`/products/${product._id}`);
           
            showNotification(`Product "${product.name}" deleted successfully!`);
            fetchProducts();
        } catch (err) {
            showNotification('Failed to delete product', 'error');
        }
    };

    const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

    return (
        <div className="dashboard">
            {/* Notification */}
            {notification && (
                <div className={`notification ${notification.type}`}>{notification.msg}</div>
            )}

            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <span className="logo-icon"></span>
                    <h1>Kinfra</h1>
                </div>
                <div className="header-right">
                    <span className="user-greeting"> {user?.name}</span>
                                                          <button
  className="btn-logout"
  onClick={() => {
    if (window.confirm(`Are you sure you want to Logout ${user.name}?`)) {
      logout();
    }
  }}
>
  Logout
</button>
                </div>
            </header>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"></div>
                    <div>
                        <p className="stat-label">Total Products</p>
                        <p className="stat-value">{products.length}</p>
                    </div>
                </div>
               
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="search-wrapper">
                    <span className="search-icon"></span>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                </div>
                <button className="btn-secondary" onClick={openAddForm}>
                    + Add Product
                </button>
            </div>

            {/* Product Table */}
            <div className="table-wrapper">
                {loading ? (
                    <div className="loading-state">
                        <div className="loader" />
                        <p>Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        
                        <p>{search ? 'No products match your search.' : 'No products yet. Add your first product!'}</p>
                    </div>
                ) : (
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, idx) => (
                                <tr key={product._id} className={product.quantity < 5 ? 'low-stock-row' : ''}>
                                    <td>{idx + 1}</td>
                                    <td className="product-name">{product.name}</td>
                                    <td className="product-desc">{product.description || '—'}</td>
                                    <td className="product-price">${Number(product.price).toFixed(2)}</td>
                                    <td>{product.quantity}</td>
                                    
                                    <td className="actions">
                                        <button className="btn-edit" onClick={() => openEditForm(product)}> Edit</button>
                                       <button
  className="btn-danger"
  onClick={() => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      handleDelete(product);
    }
  }}
>
  Delete
</button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={closeForm}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button className="modal-close" onClick={closeForm}>✕</button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="modal-form">
                            {formError && <div className="error-banner">{formError}</div>}
                            <div className="form-group">
                                <label>Product Name *</label>
                                <input name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Wireless Mouse" />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Optional description..." rows={3} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price ($) *</label>
                                    <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleFormChange} placeholder="0.00" />
                                </div>
                                <div className="form-group">
                                    <label>Quantity *</label>
                                    <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleFormChange} placeholder="0" />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-primary" onClick={closeForm}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={formLoading}>
                                    {formLoading ? <span className="spinner" /> : editingProduct ? 'Save Changes' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

\           
        </div>
    );
};

export default ProductDashboard;
