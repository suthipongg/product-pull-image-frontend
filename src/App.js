import { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams } from "react-router-dom";
import React from "react";

const API_BASE = process.env.REACT_APP_API_URL;

// Common styles object for reusability
const styles = {
  input: {
    padding: '4px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    width: '100%',
    fontSize: '12px',
    backgroundColor: 'white',
    height: '28px',
    boxSizing: 'border-box',
    lineHeight: '20px'
  },
  select: {
    padding: '4px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    width: '100%',
    fontSize: '12px',
    backgroundColor: 'white',
    height: '28px',
    boxSizing: 'border-box',
    lineHeight: '20px',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '16px',
    paddingRight: '32px'
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    height: '28px'
  },
  label: {
    display: 'block', 
    fontSize: '12px', 
    fontWeight: '500', 
    marginBottom: '4px',
    color: '#374151'
  },
  panel: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  panelTitle: {
    fontSize: '16px', 
    fontWeight: '600', 
    marginBottom: '16px'
  }
};

const ProductList = () => {
  const navigate = useNavigate();
  
  // Consolidated state management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // API request state
  const [apiRequest, setApiRequest] = useState({
    page: 1,
    pageSize: 25,
    sort: { product_id: -1 },
    filter: {}
  });
  
  // Form state
  const [tempFilters, setTempFilters] = useState({ 
    active: "", 
    product_name: "", 
    brand_name: "", 
    category_name: "", 
    subcategory_name: "", 
    selected: "", 
    product_id: "" 
  });
  const [tempSort, setTempSort] = useState({ 
    field: "product_id", 
    direction: "descending" 
  });

  // Memoize fetchProducts with useCallback
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiRequest),
      });
      
      const responseData = await response.json();
      
      if (responseData.status && responseData.data) {
        setProducts(responseData.data);
        
        if (responseData.meta) {
          setTotalPages(responseData.meta.totalPages || 0);
          setPage(responseData.meta.currentPage || 1);
        }
      } else {
        console.error("Unexpected API response format:", responseData);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  // Now include fetchProducts in the dependency array of useEffect
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // This is now safe because fetchProducts is memoized

  // Form handlers
  const handleFilterChange = (e) => {
    setTempFilters({ ...tempFilters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    const apiFilters = {};
    
    if (tempFilters.brand_name) apiFilters.brand_name = tempFilters.brand_name;
    if (tempFilters.category_name) apiFilters.category_name = tempFilters.category_name;
    if (tempFilters.subcategory_name) apiFilters.subcategory_name = tempFilters.subcategory_name;
    
    if (tempFilters.active === "true") apiFilters.active = true;
    if (tempFilters.active === "false") apiFilters.active = false;

    if (tempFilters.selected === "true") apiFilters.selected = true;
    if (tempFilters.selected === "false") apiFilters.selected = false;

    if (tempFilters.product_name) apiFilters.product_name = tempFilters.product_name;
    if (tempFilters.product_id) apiFilters.product_id = parseInt(tempFilters.product_id) || tempFilters.product_id;
    
    setApiRequest({
      ...apiRequest,
      page: 1,
      filter: apiFilters
    });
  };

  const handleSortChange = (e) => {
    setTempSort({ ...tempSort, [e.target.name]: e.target.value });
  };

  const applySort = () => {
    const sortField = tempSort.field;
    const sortDirection = tempSort.direction === "ascending" ? 1 : -1;
    
    const apiSort = {};
    apiSort[sortField] = sortDirection;
    
    setApiRequest({
      ...apiRequest,
      sort: apiSort
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setApiRequest({
      ...apiRequest,
      page: newPage
    });
  };

  // Helper function to render form input
  const renderFormField = (label, name, placeholder, value, onChange, type = "text") => (
    <div style={{ flex: 1 }}>
      <label style={styles.label}>{label}</label>
      {type === "select" ? (
        <select 
          name={name} 
          style={styles.select}
          onChange={onChange} 
          value={value}
        >
          {placeholder}
        </select>
      ) : (
        <input 
          type="text" 
          name={name} 
          placeholder={placeholder} 
          style={styles.input}
          onChange={onChange} 
          value={value} 
        />
      )}
    </div>
  );

  return (
    <div className="p-6 md:p-8 lg:p-10" style={{ paddingLeft: '2rem' }}>
      <h1 className="text-2xl font-bold mb-6 ml-4">Product List</h1>
      
      {/* Container for inline panels */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        marginLeft: '30px',
        marginRight: '30px'
      }}>
        {/* Filter Panel */}
        <div style={{
          width: '400px',
          ...styles.panel
        }}>
          <h2 style={styles.panelTitle}>Filter Products</h2>
          
          <div style={{ 
            display: 'flex', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            {renderFormField(
              "Product ID", 
              "product_id", 
              "Enter ID", 
              tempFilters.product_id, 
              handleFilterChange
            )}

            {renderFormField(
              "Product Name", 
              "product_name", 
              "Enter name", 
              tempFilters.product_name, 
              handleFilterChange
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            {renderFormField(
              "Brand", 
              "brand_name", 
              "Enter brand", 
              tempFilters.brand_name, 
              handleFilterChange
            )}
            
            {renderFormField(
              "Category", 
              "category_name", 
              "Enter category", 
              tempFilters.category_name, 
              handleFilterChange
            )}

            {renderFormField(
              "Subcategory", 
              "subcategory_name", 
              "Enter subcategory", 
              tempFilters.subcategory_name, 
              handleFilterChange
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Status</label>
              <select 
                name="active" 
                style={styles.select}
                onChange={handleFilterChange} 
                value={tempFilters.active}
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={styles.label}>Selected</label>
              <select 
                name="selected" 
                style={styles.select}
                onChange={handleFilterChange} 
                value={tempFilters.selected}
              >
                <option value="">All</option>
                <option value="true">Selected</option>
                <option value="false">Unselected</option>
              </select>
            </div>
          </div>

          {/* Apply button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={applyFilters}
              style={styles.button}
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Sort Panel */}
        <div style={{
          width: '400px',
          ...styles.panel
        }}>
          <h2 style={styles.panelTitle}>Sort Products</h2>
          
          <div style={{ 
            display: 'flex', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Sort By</label>
              <select 
                name="field" 
                style={styles.select}
                onChange={handleSortChange} 
                value={tempSort.field}
              >
                <option value="product_id">Product ID</option>
                <option value="product_name">Product Name</option>
                <option value="brand_name">Brand</option>
                <option value="category_name">Category</option>
                <option value="subcategory_name">Subcategory</option>
                <option value="active">Status</option>
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Order</label>
              <select 
                name="direction" 
                style={styles.select}
                onChange={handleSortChange} 
                value={tempSort.direction}
              >
                <option value="ascending">Ascending</option>
                <option value="descending">Descending</option>
              </select>
            </div>
          </div>

          {/* Apply button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={applySort}
              style={styles.button}
            >
              Apply Sort
            </button>
          </div>
        </div>
      </div>
      
      {/* Loading and empty states */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      )}
      
      {!loading && products.length === 0 && (
        <p className="text-center py-4 bg-yellow-50 rounded my-4 mx-4">
          No products found
        </p>
      )}
      
      {/* Products grid */}
      {!loading && products.length > 0 && (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1.5rem',
          padding: '1rem',
          margin: '0 16px'
        }}>
          {products.map((product, index) => (
            <ProductCard 
              key={product.product_id || index}
              product={product}
              onViewDetails={() => navigate(`/product/${product.product_id}`)}
            />
          ))}
        </div>
      )}
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      )}

      {/* Empty div to add extra space at the bottom of the page */}
      <div style={{ height: '40px' }}></div>
    </div>
  );
};

// Separated ProductCard component for better organization
const ProductCard = ({ product, onViewDetails }) => {
  return (
    <div 
      style={{ 
        flex: '0 0 calc(20% - 1.2rem)',
        boxSizing: 'border-box',
        marginBottom: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }} 
      className="border rounded transition-shadow hover:shadow-md"
    >
      {/* Product image */}
      <div style={{
        backgroundColor: '#f9fafb',
        height: '150px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {product.url_preview_image ? (
          <img 
            src={product.url_preview_image} 
            alt={product.product_name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '8px'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = `
                <div style="
                  width: 85%;
                  height: 120px;
                  display: flex;
                  align-items: center;
                  justifyContent: center;
                  background-color: #e5e7eb;
                  border-radius: 4px;
                  color: #4b5563;
                  font-weight: 500;
                  text-align: center;
                  padding: 0 8px;
                  font-size: 14px;
                ">
                  ${product.product_name || 'Product'}
                </div>
              `;
            }}
          />
        ) : (
          <div style={{
            backgroundColor: '#e5e7eb',
            width: '85%',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            color: '#4b5563',
            fontWeight: '500',
            textAlign: 'center',
            padding: '0 8px',
            fontSize: '14px'
          }}>
            {product.product_name || 'Product'}
          </div>
        )}
      </div>
      
      {/* Product details */}
      <div style={{ padding: '12px' }}>
        {/* Product ID and active status */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '10px',
          alignItems: 'center'
        }}>
          <span style={{ 
            fontSize: '12px',
            color: '#6b7280',
            backgroundColor: '#f3f4f6',
            padding: '1px 6px',
            borderRadius: '10px'
          }}>
            ID: {product.product_id}
          </span>
          
          {product.active !== undefined ? (
            product.active ? 
              <span style={{ color: '#10b981', fontWeight: '500', fontSize: '13px' }}>Active ✓</span> : 
              <span style={{ color: '#ef4444', fontWeight: '500', fontSize: '13px' }}>Inactive ✗</span>
          ) : null}
        </div>
        
        {/* Product name */}
        <div style={{ 
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '12px',
          lineHeight: '1.3',
          textAlign: 'center',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {product.product_name || 'Unknown Product'}
        </div>
        
        {/* Product metadata */}
        <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>
            Brand:
          </span>
          <span style={{ 
            fontSize: '12px', 
            textAlign: 'right', 
            maxWidth: '60%', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {product.brand_name || 'N/A'}
          </span>
        </div>
        
        <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>
            Category:
          </span>
          <span style={{ 
            fontSize: '12px', 
            textAlign: 'right', 
            maxWidth: '60%', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {product.category_name || 'N/A'}
          </span>
        </div>
        
        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>
            Subcategory:
          </span>
          <span style={{ 
            fontSize: '12px', 
            textAlign: 'right', 
            maxWidth: '60%', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {product.subcategory_name || 'N/A'}
          </span>
        </div>
        
        {/* View details button */}
        <button 
          onClick={onViewDetails}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '7px 10px',
            borderRadius: '4px',
            width: '100%',
            border: 'none',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '4px',
            textAlign: 'center',
            fontSize: '13px'
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

// Separated Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      marginTop: '2rem',
      marginBottom: '3rem',
      gap: '8px',
      padding: '0 16px'
    }}>
      {/* Previous page button */}
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '8px 16px',
          backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          color: currentPage === 1 ? '#9ca3af' : '#1f2937'
        }}
      >
        Previous
      </button>
      
      {/* Page numbers with improved ellipsis logic */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {(() => {
          const pageNumbers = [];
          const siblings = 1;
          
          // Always show first page
          pageNumbers.push(
            <button
              key={1}
              onClick={() => onPageChange(1)}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 1 ? '#3b82f6' : 'white',
                color: currentPage === 1 ? 'white' : '#1f2937',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: currentPage === 1 ? 'bold' : 'normal'
              }}
            >
              1
            </button>
          );
          
          // Calculate left ellipsis position
          const leftEllipsisPosition = Math.max(2, currentPage - siblings);
          
          // Add left ellipsis if needed
          if (leftEllipsisPosition > 2) {
            pageNumbers.push(
              <span 
                key="left-ellipsis" 
                style={{ 
                  alignSelf: 'center', 
                  padding: '0 4px',
                  color: '#6b7280'
                }}
              >
                ...
              </span>
            );
          }
          
          // Add middle pages
          for (
            let i = Math.max(2, leftEllipsisPosition);
            i <= Math.min(totalPages - 1, currentPage + siblings);
            i++
          ) {
            if (i === 1) continue;
            
            pageNumbers.push(
              <button
                key={i}
                onClick={() => onPageChange(i)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentPage === i ? '#3b82f6' : 'white',
                  color: currentPage === i ? 'white' : '#1f2937',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: currentPage === i ? 'bold' : 'normal'
                }}
              >
                {i}
              </button>
            );
          }
          
          // Add right ellipsis if needed
          if (currentPage + siblings < totalPages - 1) {
            pageNumbers.push(
              <span 
                key="right-ellipsis" 
                style={{ 
                  alignSelf: 'center', 
                  padding: '0 4px',
                  color: '#6b7280'
                }}
              >
                ...
              </span>
            );
          }
          
          // Always show last page if not first page
          if (totalPages > 1) {
            pageNumbers.push(
              <button
                key={totalPages}
                onClick={() => onPageChange(totalPages)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentPage === totalPages ? '#3b82f6' : 'white',
                  color: currentPage === totalPages ? 'white' : '#1f2937',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: currentPage === totalPages ? 'bold' : 'normal'
                }}
              >
                {totalPages}
              </button>
            );
          }
          
          return pageNumbers;
        })()}
      </div>
      
      {/* Next page button */}
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 16px',
          backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          color: currentPage === totalPages ? '#9ca3af' : '#1f2937'
        }}
      >
        Next
      </button>
    </div>
  );
};

const ProductDetails = () => {
  // Basic setup
  const { product_id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [productInfo, setProductInfo] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  
  const allSelected = items.length > 0 && selectedItems.size === items.length;

  // Fetch data on mount
  useEffect(() => {
    // Get main product
    fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filter: { product_id: parseInt(product_id) } }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.data?.[0]) setProductInfo(data.data[0]);
      });

    // Get related items
    fetch(`${API_BASE}/product/${product_id}`)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        // Pre-select items marked as selected
        const selected = new Set();
        data.forEach(item => item.selected && selected.add(item.id));
        setSelectedItems(selected);
      });
  }, [product_id]);

  // Actions
  const toggleSelectAll = () => {
    if (isSaving) return;
    setSelectedItems(allSelected ? new Set() : new Set(items.map(item => item.id)));
  };

  const toggleSelection = (id) => {
    if (isSaving) return;
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const saveSelections = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      const response = await fetch(`${API_BASE}/update-selected`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: items.map(item => ({
            id: item.id,
            selected: selectedItems.has(item.id)
          }))
        }),
      });

      if (!response.ok) throw new Error('Failed to save');
      alert('Selections saved successfully');
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate('/')}
          style={{ 
            padding: '6px 12px', 
            borderRadius: '4px', 
            border: '1px solid #d1d5db',
            backgroundColor: 'white'
          }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Product Details</h1>
      </div>

      {/* Main Product Card */}
      {productInfo && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '24px',
          marginLeft: '16px',
          width: '35%',
          overflow: 'hidden',
          border: '1px solid #f0f0f0'
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            padding: '16px',
          }}>
            {/* Product Image */}
            <div style={{
              width: '120px',
              height: '120px',
              flexShrink: 0,
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '1px solid #e5e7eb'
            }}>
              {productInfo.url_preview_image ? (
                <img 
                  src={productInfo.url_preview_image}
                  alt={productInfo.product_name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: '8px'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = `
                      <div style="
                        width: 85%;
                        height: 85%;
                        display: flex;
                        align-items: center;
                        justifyContent: center;
                        background-color: #e5e7eb;
                        border-radius: 4px;
                        color: #4b5563;
                        font-size: 13px;
                        text-align: center;
                        padding: 4px;
                      ">
                        ${productInfo.product_name || 'No Image'}
                      </div>
                    `;
                  }}
                />
              ) : (
                <div style={{
                  width: '85%',
                  height: '85%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  color: '#4b5563',
                  fontSize: '13px',
                  textAlign: 'center',
                  padding: '4px'
                }}>
                  {productInfo.product_name || 'No Image'}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div style={{ 
              flex: 1,
              minWidth: 0
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px'
              }}>
                {/* Product ID and Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: '#6b7280',
                    backgroundColor: '#f3f4f6',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb'
                  }}>
                    ID: {productInfo.product_id}
                  </span>
                  {productInfo.active !== undefined && (
                    <span style={{ 
                      fontSize: '12px',
                      fontWeight: '500',
                      color: productInfo.active ? '#10b981' : '#ef4444',
                      backgroundColor: productInfo.active ? '#ecfdf5' : '#fef2f2',
                      padding: '3px 8px',
                      borderRadius: '10px'
                    }}>
                      {productInfo.active ? '✓ Active' : '✗ Inactive'}
                    </span>
                  )}
                </div>

                {/* Product URL */}
                <div style={{ textAlign: 'right' }}>
                  {productInfo.url && (
                    <a 
                      href={productInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '12px',
                        color: '#3b82f6',
                        textDecoration: 'none',
                        padding: '4px 8px',
                        backgroundColor: '#eff6ff',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}
                    >
                      View on Website ↗
                    </a>
                  )}
                </div>

                {/* Product Name */}
                <div style={{ gridColumn: 'span 2' }}>
                  <h2 style={{ 
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '12px',
                    borderBottom: '1px solid #f3f4f6',
                    paddingBottom: '8px'
                  }}>
                    {productInfo.product_name}
                  </h2>
                </div>

                {/* Details Grid */}
                <div style={{ 
                  gridColumn: 'span 2', 
                  display: 'grid', 
                  gap: '10px',
                  fontSize: '13px'
                }}>
                  {/* Brand */}
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'baseline'
                  }}>
                    <span style={{ 
                      minWidth: '100px',
                      color: '#374151', 
                      fontWeight: '500' 
                    }}>
                      Brand:
                    </span>
                    <span style={{ 
                      color: productInfo.brand_name ? '#111827' : '#9ca3af'
                    }}>
                      {productInfo.brand_name || 'Not specified'}
                    </span>
                  </div>
                  
                  {/* Category */}
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'baseline'
                  }}>
                    <span style={{ 
                      minWidth: '100px',
                      color: '#374151', 
                      fontWeight: '500' 
                    }}>
                      Category:
                    </span>
                    <span style={{ 
                      color: productInfo.category_name ? '#111827' : '#9ca3af'
                    }}>
                      {productInfo.category_name || 'Not specified'}
                    </span>
                  </div>
                  
                  {/* Subcategory */}
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'baseline'
                  }}>
                    <span style={{ 
                      minWidth: '100px',
                      color: '#374151', 
                      fontWeight: '500' 
                    }}>
                      Subcategory:
                    </span>
                    <span style={{ 
                      color: productInfo.subcategory_name ? '#111827' : '#9ca3af'
                    }}>
                      {productInfo.subcategory_name || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div style={{
        position: 'sticky', top: '16px', zIndex: 100,
        display: 'flex', justifyContent: 'space-between',
        padding: '16px', backgroundColor: 'rgba(255,255,255,0.9)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {/* Select All Button */}
        <button
          onClick={toggleSelectAll}
          disabled={isSaving}
          style={{
            backgroundColor: allSelected ? '#f3f4f6' : '#e5e7eb',
            color: isSaving ? '#9ca3af' : (allSelected ? '#4b5563' : '#1f2937'),
            padding: '8px 16px', borderRadius: '4px', border: '1px solid #d1d5db',
            cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1
          }}
        >
          {allSelected ? 'Unselect All' : 'Select All'}
        </button>
        
        {/* Save Button */}
        <button
          onClick={saveSelections}
          disabled={isSaving}
          style={{
            backgroundColor: isSaving ? '#93c5fd' : '#3b82f6',
            color: 'white', padding: '8px 16px', borderRadius: '4px',
            border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer',
            minWidth: '160px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px'
          }}
        >
          {isSaving ? (
            <>
              <span style={{ display: 'inline-block', width: '16px', height: '16px',
                borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white', animation: 'spin 1s linear infinite' }}></span>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              Saving...
            </>
          ) : (
            `Save Selections (${selectedItems.size} selected)`
          )}
        </button>
      </div>

      {/* Related Items */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '24px 0 16px 16px' }}>
        Related Items
      </h2>

      {/* Items Grid */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '16px',
        pointerEvents: isSaving ? 'none' : 'auto', opacity: isSaving ? 0.7 : 1
      }}>
        {items.map(item => {
          const isSelected = selectedItems.has(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleSelection(item.id)}
              style={{
                width: 'calc(20% - 16px)',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                position: 'relative',
                border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              {/* Selection Indicator */}
              <div style={{
                position: 'absolute', top: '8px', right: '8px',
                backgroundColor: isSelected ? '#3b82f6' : '#e5e7eb',
                color: isSelected ? 'white' : '#6b7280',
                borderRadius: '50%', width: '24px', height: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {isSelected ? '✓' : '○'}
              </div>

              {/* Item Image */}
              <div style={{
                width: '100%', aspectRatio: '1', backgroundColor: '#f9fafb',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {item.link ? (
                  <img 
                    src={item.link}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `<div style="width:85%;height:85%;display:flex;
                      align-items:center;justify-content:center;background:#e5e7eb;border-radius:4px;
                      color:#4b5563;font-size:12px;padding:8px;text-align:center">${item.title || 'No Image'}</div>`;
                    }}
                  />
                ) : (
                  <div style={{ width: '85%', height: '85%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', backgroundColor: '#e5e7eb', borderRadius: '4px',
                    color: '#4b5563', fontSize: '12px', padding: '8px', textAlign: 'center' }}>
                    {item.title || 'No Image'}
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div style={{ padding: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', overflow: 'hidden',
                  textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', marginBottom: '4px' }}>
                  {item.title || 'Untitled Item'}
                </h3>
                
                {item.context && (
                  <a 
                    href={item.context}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none',
                      display: 'block', marginTop: '8px' }}
                  >
                    View Source ↗
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/product/:product_id" element={<ProductDetails />} />
      </Routes>
    </Router>
  );
};

export default App;
