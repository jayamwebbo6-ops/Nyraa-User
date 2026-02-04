import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ListGroup, Spinner } from "react-bootstrap";
import { normalizeImagePath } from "../../utils/imageUtils";
import "./SearchSuggestions.css";

const SearchSuggestions = ({ query, onSelect, onClose }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const suggestionsRef = useRef(null);
  const navigate = useNavigate();

  /* ---------------- FETCH ALL PRODUCTS (ALL PAGES) ---------------- */
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        let page = 1;
        let totalPages = 1;
        let products = [];
        const API_BASE_URL = "http://localhost:5000";

        while (page <= totalPages) {
          const res = await fetch(`${API_BASE_URL}/api/products?page=${page}`);
          const data = await res.json();

          if (!data.success) break;

          products.push(...(data.data.products || []));
          totalPages = data.data.pagination?.totalPages || 1;
          page++;
        }

        // normalize images
        const normalized = products.map((p) => ({
          ...p,
          image: normalizeImagePath(p.variants?.[0]?.images?.[0] || p.image),
        }));

        setAllProducts(normalized);
      } catch (err) {
        console.error("Search fetch error:", err);
      }
    };

    fetchAllProducts();
  }, []);

  /* ---------------- SEARCH ---------------- */
  useEffect(() => {
    if (!query.trim()) {
      setFilteredProducts([]);
      setHighlightedIndex(-1);
      return;
    }

    setIsLoading(true);
    const term = query.toLowerCase();

    const results = allProducts
      .map((product) => {
        let score = 0;

        if (product.name && String(product.name).toLowerCase().includes(term)) score += 50;
        if (product.category && String(product.category).toLowerCase().includes(term)) score += 30;
        if (product.brand && String(product.brand).toLowerCase().includes(term)) score += 20;
        // if (product.description && String(product.description).toLowerCase().includes(term)) score += 10;


        return { product, score };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((p) => p.product);

    setFilteredProducts(results);
    setHighlightedIndex(-1);
    setIsLoading(false);
  }, [query, allProducts]);

  /* ---------------- MATCHED CATEGORIES ---------------- */
  const categories = [
    ...new Set(
      filteredProducts
        .map((p) => p.category && String(p.category).toLowerCase())
        .filter(Boolean)
    ),
  ];

  /* ---------------- KEYBOARD ---------------- */
  useEffect(() => {
    const total = filteredProducts.length + categories.length;
    if (!total) return;

    const handler = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) => (i + 1) % total);
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => (i - 1 + total) % total);
      }

      if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        if (highlightedIndex < filteredProducts.length) {
          handleProductClick(filteredProducts[highlightedIndex]);
        } else {
          handleCategoryClick(
            categories[highlightedIndex - filteredProducts.length]
          );
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [highlightedIndex, filteredProducts, categories]);

  /* ---------------- NAVIGATION ---------------- */
  const handleProductClick = (product) => {
    navigate(`/product/${product.slug || product.id}`);
    onSelect();
    onClose();
  };

  const handleCategoryClick = (category) => {
    navigate(`/collections/${category}`);
    onSelect();
    onClose();
  };

  if (!query.trim()) return null;

  /* ---------------- UI ---------------- */
  return (
    <div className="search-suggestions" ref={suggestionsRef}>
      {isLoading ? (
        <div className="no-suggestions">
          <Spinner size="sm" /> Searching...
        </div>
      ) : filteredProducts.length ? (
        <>
          <div className="suggestion-section">
            <div className="suggestion-heading">Products</div>

            {filteredProducts.map((product, index) => (
              <ListGroup.Item
                key={product.id}
                action
                className={`suggestion-item ${
                  highlightedIndex === index ? "bg-light" : ""
                }`}
                onClick={() => handleProductClick(product)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="suggestion-image">
                  <img 
                    src={product.image || "/placeholder.svg"} 
                    alt={product.name} 
                  />
                </div>
                <div className="suggestion-content">
                  <div className="suggestion-name">{product.name}</div>
                  <div className="suggestion-price">₹{Number(product.price || 0).toFixed(0)}</div>
                </div>
              </ListGroup.Item>
            ))}
          </div>

          {categories.length > 0 && (
            <div className="suggestion-section">
              <div className="suggestion-heading">Categories</div>
              {categories.map((cat, i) => (
                <ListGroup.Item
                  key={cat}
                  action
                  className={`suggestion-category ${
                    highlightedIndex === filteredProducts.length + i
                      ? "bg-light"
                      : ""
                  }`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </ListGroup.Item>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="no-suggestions">
          No results for "{query}"
        </div>
      )}

      <div className="view-all-results">
        <Link to="/collections/dresses" onClick={() => { onSelect(); onClose(); }}>
          View all products
        </Link>
      </div>
    </div>
  );
};

export default SearchSuggestions;
