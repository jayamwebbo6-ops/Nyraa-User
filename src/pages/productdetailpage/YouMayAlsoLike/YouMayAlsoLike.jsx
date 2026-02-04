import { useRef, useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import IconLink from "../../../components/ui/Icons"
import { BuyNowButton } from "../../../components/ui/Buttons"
import { addToWishlist, removeFromWishlist } from "../../../store/wishlistSlice"
import { normalizeImagePath } from "../../../utils/imageUtils"
import "../../../styles/ProductSlider.css"

const YouMayAlsoLike = ({ categorySlug, brand, currentProductId, currentProductSlug }) => {
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const wishlistItems = useSelector((state) => state.wishlist.items)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visibleCards, setVisibleCards] = useState(5)
  const [hoveredProductId, setHoveredProductId] = useState(null)

const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // URLs for different preferences
      const categoryUrl = `http://localhost:5000/api/products?limit=24&status=active&cat_slug=${categorySlug || ""}`;
      const brandUrl = `http://localhost:5000/api/products?limit=24&status=active&brand=${brand || ""}`;
      const generalUrl = `http://localhost:5000/api/products?limit=20&status=active`;

      console.log("🎯 Fetching suggestions with preferences:", { categorySlug, brand });

      // Helper for safe fetching
      const safeFetch = async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return [];
          const json = await res.json();
          return Array.isArray(json.data?.products) ? json.data.products : [];
        } catch (err) {
          console.error(`Fetch failed for ${url}:`, err);
          return [];
        }
      };

      // Parallel fetch for speed
      const [catProducts, brandProducts, genProducts] = await Promise.all([
        safeFetch(categoryUrl),
        brand && brand !== "N/A" ? safeFetch(brandUrl) : Promise.resolve([]),
        safeFetch(generalUrl)
      ]);

      // Combine and tag with priority
      const combinedRaw = [
        ...catProducts.map(p => ({ ...p, suggestionPriority: 1 })),
        ...brandProducts.map(p => ({ ...p, suggestionPriority: 2 })),
        ...genProducts.map(p => ({ ...p, suggestionPriority: 3 }))
      ];

      // Remove duplicates (keep highest priority) and filter
      const uniqueProductsMap = new Map();
      combinedRaw.forEach(p => {
        const id = p.id?.toString();
        const currentId = currentProductId?.toString();
        
        if (
          id !== currentId && 
          p.status === "active" && 
          (p.variants?.length > 0 || p.qty > 0) &&
          (!uniqueProductsMap.has(id) || p.suggestionPriority < uniqueProductsMap.get(id).suggestionPriority)
        ) {
          uniqueProductsMap.set(id, p);
        }
      });

      const finalProducts = Array.from(uniqueProductsMap.values())
        .sort((a, b) => a.suggestionPriority - b.suggestionPriority)
        .map(p => {
          const variants = Array.isArray(p.variants) ? p.variants : [];
          const firstVariant = variants[0] || {};
          
          const p1 = Number(firstVariant.price || p.price || 0);
          const p2 = Number(firstVariant.originalPrice || p.originalPrice || p1 * 1.3);
          const sellingPrice = Math.min(p1, p2) || p1;
          const mrp = Math.max(p1, p2);

          return {
            id: p.id,
            slug: p.slug,
            name: p.name?.replace(/=/g, " ") || "Product",
            brand: p.brand || p.category?.category || "Shop",
            category: p.category?.category,
            categorySlug: p.category?.cat_slug,
            image: normalizeImagePath(p.image || (variants.length > 0 ? variants[0].images?.[0] : null)),
            secondaryImage: normalizeImagePath(p.secondaryImage || (variants.length > 0 ? variants[0].images?.[1] : null)),
            price: sellingPrice,
            originalPrice: mrp,
            discount: mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0
          };
        })
        .filter(p => p.id && p.price > 0)
        .slice(0, 15);

      setProducts(finalProducts);
      console.log(`✅ Loaded ${finalProducts.length} suggestions (Cat: ${catProducts.length}, Brand: ${brandProducts.length}, Gen: ${genProducts.length})`);

    } catch (err) {
      console.error("❌ Suggestion logic error:", err);
      setError("Failed to load suggested products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, brand, currentProductId])


  const handleResize = () => {
    if (!containerRef.current) return
    const width = window.innerWidth
    if (width >= 1200) setVisibleCards(5)
    else if (width >= 992) setVisibleCards(4)
    else if (width >= 768) setVisibleCards(3)
    else setVisibleCards(2)
  }

  const handleImageHover = (productId) => setHoveredProductId(productId)
  const handleImageLeave = () => setHoveredProductId(null)

  const handleWishlistToggle = (product, e) => {
    e.stopPropagation()
    const isInWishlist = wishlistItems.some(item => Number(item.productId) === Number(product.id))
    if (isInWishlist) dispatch(removeFromWishlist(product.id))
    else dispatch(addToWishlist({ product, variantIndex: 0 }))
  }

  const handleNavigation = (productId, product) => {
    window.scrollTo(0, 0)
    navigate(`/product/${productId}`, { replace: false, state: { product } })
  }

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (loading) {
    return (
      <section className="product-slider">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </section>
    )
  }

  if (error || products.length === 0) return null

  return (
    <section className="product-slider">
      <div className="products-wrapper">
        <h2 className="section-title">You May Also Like</h2>
        <p className="section-subtitle">Discover more from this collection</p>

        <div className="products-container">
          <button
            className="arrow-button left-arrow d-none d-md-flex"
            onClick={() => containerRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
          >
            <IconLink iconType="left-arrow" isArrow />
          </button>

          <div className="scroll-container" ref={containerRef}>
            {products.map((product) => (
              <div key={product.id} className="product-card" onClick={() => handleNavigation(product.id, product)}>
                <div
                  className="product-image-container"
                  onMouseEnter={() => handleImageHover(product.id)}
                  onMouseLeave={handleImageLeave}
                >
                  <img
                    src={hoveredProductId === product.id && product.secondaryImage ? product.secondaryImage : product.image}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/300x400/eeeeee/666666?text=${product.name.slice(0,12)}`
                    }}
                  />
                  <div className="wishlist-wrapper">
                    <IconLink
                      iconType="wishlist"
                      className={`wishlist-icon ${wishlistItems.some(item => Number(item.productId) === Number(product.id)) ? "filled" : ""}`}
                      onClick={(e) => handleWishlistToggle(product, e)}
                    />
                  </div>
                </div>
                <div className="product-info">
                  <div className="product-info-content">
                    <div className="content-wrapper">
                      <div className="brand-name">{product.brand}</div>
                      <h3 className="product-name">{product.name}</h3>
                      <div className="price-container">
                        {product.originalPrice > product.price && (
                          <span className="original-price">₹{Math.round(product.originalPrice).toLocaleString()}</span>
                        )}
                        <span className="discounted-price">₹{Math.round(product.price).toLocaleString()}</span>
                        {product.discount > 0 && (
                          <span className="discount">-{product.discount}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <BuyNowButton
                    className="purchase-button"
                    label="Shop Now"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNavigation(product.id, product)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            className="arrow-button right-arrow d-none d-md-flex"
            onClick={() => containerRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
          >
            <IconLink iconType="right-arrow" isArrow />
          </button>
        </div>
      </div>
    </section>
  )
}

export default YouMayAlsoLike
