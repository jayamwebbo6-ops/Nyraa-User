import { useState, useEffect, useRef, useCallback } from "react"
import { Navbar as BootstrapNavbar, Nav, Button, Image, Offcanvas, Dropdown } from "react-bootstrap"
import { useNavigate, useLocation, NavLink } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { fetchWishlist } from "../../store/wishlistSlice"
import { fetchCart } from "../../store/cartSlice"
import { closeBuyNow } from "../../store/buyProductSlice"
import IconLink from "../ui/Icons"
import SearchSuggestions from "../Search/SearchSuggestions"
import ConfirmationModal from "../ui/ConfirmationModal"
import "./NavbarComp.css"
import { logout } from "../../store/authSlice"

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [offcanvasShow, setOffcanvasShow] = useState(false)
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState({ more: false })
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    actionType: "logout",
    title: "Confirm Logout",
  })

  // ✅ Category states
  const [mainCategories, setMainCategories] = useState([])
  const [moreCategories, setMoreCategories] = useState([])
  const [categoryLoading, setCategoryLoading] = useState(false)

  const dispatch = useDispatch()
  const { isLoggedIn, user } = useSelector((state) => state.auth)
  const cartCount = useSelector((state) => state.cart.items.length)
  const wishlistCount = useSelector((state) => state.wishlist.items.length)
  
  const searchContainerRef = useRef(null)
  const searchInputRef = useRef(null)

  const navigate = useNavigate()
  const location = useLocation()


  console.log("isLoggedIn" + isLoggedIn);
  

  // ✅ Memoized functions
  const isProfileComplete = useCallback(() => {
    return user?.name?.trim() && user?.phone?.trim()
  }, [user])

  // ✅ FIXED: Memoized navigation handler
  const handleNavigation = useCallback((path) => {
    navigate(path, { replace: true })
    setOffcanvasShow(false)
    setUserDropdownOpen(false)
    setMobileDropdownOpen({ more: false })
  }, [navigate])

  const handleAccountClick = useCallback(() => {
    if (!isLoggedIn) {
      navigate("/login")
      return
    }
    handleNavigation("/account/profile")
  }, [isLoggedIn, navigate, handleNavigation])

  // 🔥 Categories fetch
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoryLoading(true)
        const response = await fetch("http://localhost:5000/api/categories")
        
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log("🛒 RAW CATEGORY RESPONSE =>", data)
        
        if (!data.success) {
          throw new Error(data.message || "Category API failed")
        }
        
        const list = Array.isArray(data.data?.categories) ? data.data.categories : []
        const normalizedList = list.map(cat => ({
          id: cat.id,
          name: cat.category,
          slug: cat.cat_slug,
          type: cat.id <= 3 ? "main" : "more"
        }))
        
        setMainCategories(normalizedList.filter(cat => cat.type === "main"))
        setMoreCategories(normalizedList.filter(cat => cat.type === "more"))
        
        console.log("✅ MAIN CATEGORIES:", normalizedList.filter(cat => cat.type === "main"))
        console.log("✅ MORE CATEGORIES:", normalizedList.filter(cat => cat.type === "more"))
      } catch (error) {
        console.error("❌ Category fetch failed:", error)
      } finally {
        setCategoryLoading(false)
      }
    }
    
    loadCategories()
  }, [])

  // Search focus
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus()
      }, 100)
    }
  }, [showSearch])

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target) &&
        !event.target.closest(".search-toggle") &&
        !event.target.closest(".search-suggestions")
      ) {
        setShowSearch(false)
        setShowSuggestions(false)
        setSearchQuery("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // ✅ FIXED: Protected navigation
  const handleProtectedNavigation = useCallback((path) => {
    if (!isLoggedIn) {
      navigate("/login")
      return
    }

    if (!isProfileComplete()) {
      sessionStorage.setItem("redirectAfterProfile", path)
      navigate("/account/profile?complete=true")
      return
    }

    setOffcanvasShow(false)
    setUserDropdownOpen(false)
    navigate(path)
  }, [isLoggedIn, isProfileComplete, navigate])

  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => !prev)
    if (!showSearch) {
      setSearchQuery("")
      setShowSuggestions(false)
    }
  }, [showSearch])

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setShowSuggestions(e.target.value.trim().length > 0)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
      setShowSearch(false)
      setShowSuggestions(false)
      setOffcanvasShow(false)
    }
  }

  const handleSuggestionSelect = () => {
    setShowSuggestions(false)
    setSearchQuery("")
    setShowSearch(false)
    setOffcanvasShow(false)
  }

  const closeSuggestions = () => {
    setShowSuggestions(false)
  }

  const toggleMobileDropdown = (key) => {
    setMobileDropdownOpen((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleUserDropdown = useCallback(() => {
    if (!isMobile) {
      setUserDropdownOpen((prev) => !prev)
    } else {
      handleAccountClick()
    }
  }, [isMobile, handleAccountClick])

  const handleLogoutPrompt = () => {
    setModalConfig({
      actionType: "logout",
      title: "Confirm Logout",
    })
    setShowConfirmModal(true)
    setUserDropdownOpen(false)
    if (isMobile) {
      setOffcanvasShow(false)
    }
  }

  const handleConfirmAction = () => {
    if (modalConfig.actionType === "logout") {
      dispatch(logout())
      setShowConfirmModal(false)
      navigate("/login", { replace: true })
    }
  }

  // Fetch wishlist/cart
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchWishlist())
      dispatch(fetchCart())
    }
  }, [dispatch, isLoggedIn])

  const handleCancelAction = () => {
    setShowConfirmModal(false)
  }

  return (
    <>
      <style>{`
        :root {
          --primary-pink: #D0779B;
          --primary-pink-light: #E8A5C4;
          --primary-pink-dark: #B8657F;
        }

        .premium-search-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          background-color: var(--background);
          z-index: 1050;
          padding: 1.5rem 0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transform: translateY(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
        }
        
        .premium-search-container.show {
          transform: translateY(0);
          opacity: 1;
        }
        
        .premium-search-inner {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
        }
        
        .premium-search-form {
          display: flex;
          align-items: center;
          border-bottom: 2px solid var(--border-light);
          padding-bottom: 0.5rem;
          transition: border-color 0.3s ease;
        }
        
        .premium-search-form:focus-within {
          border-color: var(--primary-pink);
        }
        
        .premium-search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 1.25rem;
          padding: 0.5rem 0;
          color: var(--primary-text);
          font-weight: 300;
        }
        
        .premium-search-input:focus {
          outline: none;
          box-shadow: none;
        }
        
        .premium-search-input::placeholder {
          color: var(--placeholder);
          font-weight: 300;
        }
        
        .premium-search-btn {
          background: transparent;
          border: none;
          color: var(--primary-pink);
          font-size: 1.25rem;
          padding: 0.5rem;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .premium-search-btn:hover {
          transform: scale(1.1);
        }
        
        .premium-search-close {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: var(--primary-text);
          font-size: 1.25rem;
          font-weight: 500;
          cursor: pointer;
          z-index: 1051;
          transition: color 0.2s ease;
          line-height: 1;
          padding: 0.25rem;
        }
        
        .premium-search-close:hover {
          color: var(--primary-pink);
        }
        
        .premium-search-clear {
          background: transparent;
          border: none;
          color: var(--secondary-text);
          font-size: 1.25rem;
          padding: 0.5rem;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        
        .premium-search-clear:hover {
          color: var(--primary-pink);
        }
        
        .search-toggle {
          transition: color 0.3s ease;
        }
        
        .search-toggle:hover {
          color: var(--primary-pink) !important;
        }
        
        .search-toggle .icon-outlined {
          transition: stroke 0.3s ease;
        }
        
        .search-toggle:hover .icon-outlined {
          stroke: var(--primary-pink) !important;
        }
        
        .search-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--overlay);
          z-index: 1040;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        
        .search-overlay.show {
          opacity: 1;
          visibility: visible;
        }
        
        .trending-searches {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
        }
        
        .trending-title {
          font-size: 0.85rem;
          color: var(--secondary-text);
          margin-bottom: 0.75rem;
          font-weight: 500;
        }
        
        .trending-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .trending-tag {
          background-color: var(--tag-background);
          color: var(--tag-text);
          padding: 0.35rem 0.75rem;
          border-radius: 50px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .trending-tag:hover {
          background-color: var(--primary-pink-light);
          color: var(--primary-pink-dark);
        }

        .nav-icon:hover {
          color: var(--primary-pink) !important;
        }

        .nav-link:hover {
          color: var(--primary-pink) !important;
        }

        .nav-link.active {
          color: var(--primary-pink) !important;
          font-weight: 600;
        }

        .dropdown-item:hover {
          background-color: var(--primary-pink-light);
          color: var(--primary-pink-dark);
        }

        .user-dropdown-toggle:hover {
          color: var(--primary-pink) !important;
        }

        .protected-nav-icon {
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .protected-nav-icon:hover {
          color: var(--primary-pink) !important;
          transform: scale(1.1);
        }

        .incomplete-profile-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #ff6b6b;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(255, 107, 107, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
          }
        }
      `}</style>

      <BootstrapNavbar bg="light" expand="lg" className="custom-navbar sticky-top w-100">
        <div className="navbar-inner-container w-100 px-3 px-md-4">
          <div className="navbar-left">
            <Button
              variant="link"
              className="d-lg-none text-dark me-2 p-0"
              onClick={() => setOffcanvasShow(true)}
              aria-label="Toggle navigation"
            >
              <IconLink iconType="bars" />
            </Button>
            <BootstrapNavbar.Brand
              as="div"
              className="d-flex align-items-center mb-0"
              onClick={() => handleNavigation("/home")}
              style={{ cursor: "pointer" }}
            >
              <Image
                src="/nyraalogo.png"
                alt="Logo"
                width={50}
                height={50}
                className="d-none d-lg-inline"
              />
              <span className="fw-bold text-dark fs-4">Nyraa</span>
            </BootstrapNavbar.Brand>
          </div>

          {/* ✅ FIXED: Desktop Nav - NO onClick on NavLinks */}
          <Nav className="d-none d-lg-flex navbar-center enable-hover align-items-center">
            <NavLink
              to="/home"
              className={({ isActive }) => `nav-link mx-3 text-uppercase ${isActive ? "active" : ""}`}
              style={{ fontSize: "0.90rem" }}
            >
              Home
            </NavLink>
            
            <NavLink
              to="/collections/dresses"
              className={({ isActive }) => `nav-link mx-3 text-uppercase ${isActive ? "active" : ""}`}
              style={{ fontSize: "0.90rem" }}
            >
              Products
            </NavLink>

            {mainCategories.map((item) => (
              <NavLink
                key={item.id}
                to={`/collections/${item.slug}`}
                className={({ isActive }) => `nav-link mx-3 text-uppercase ${isActive ? "active" : ""}`}
                style={{ fontSize: "0.90rem" }}
              >
                {item.name}
              </NavLink>
            ))}

            <div className="dropdown nav-hover mx-3">
              <span className="nav-link dropdown-toggle no-chevron text-uppercase" style={{ fontSize: "0.90rem" }}>
                More Categories ({moreCategories.length})
              </span>
              <div className="dropdown-menu shadow">
                {moreCategories.map((item) => (
                  <NavLink
                    key={item.id}
                    to={`/collections/${item.slug}`}
                    className="dropdown-item text-uppercase"
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </Nav>

          <Nav className="navbar-right align-items-center flex-row">
            <Button
              variant="link"
              className="nav-icon me-2 search-toggle p-0"
              onClick={toggleSearch}
              aria-label="Toggle search"
            >
              <IconLink iconType="search" className="icon-outlined" />
            </Button>

            <div className="user-dropdown-wrapper">
              <div
                className="user-dropdown-toggle me-2"
                onClick={toggleUserDropdown}
                role="button"
                aria-label="User menu"
              >
                <IconLink iconType="user" className="icon-outlined" />
              </div>

              {!isMobile && (
                <Dropdown show={userDropdownOpen} onToggle={toggleUserDropdown} align="end">
                  <Dropdown.Toggle as="div" className="d-none" />
                  <Dropdown.Menu className="dropdown-menu-user shadow">
                    <Dropdown.Item
                      as="div"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAccountClick()
                      }}
                    >
                      {isLoggedIn ? "My Account" : "Login"}
                    </Dropdown.Item>
                    {isLoggedIn && <Dropdown.Item onClick={handleLogoutPrompt}>Logout</Dropdown.Item>}
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>

            <div
              className="protected-nav-icon me-2 position-relative"
              onClick={() => handleProtectedNavigation("/wishlist")}
              role="button"
              aria-label="Wishlist"
            >
              <IconLink
                iconType="navbar-heart"
                badgeCount={wishlistCount}
                className={`nav-icon ${wishlistCount > 0 ? "filled" : ""}`}
              />
            </div>

            <div
              className="protected-nav-icon position-relative"
              onClick={() => {
                handleProtectedNavigation("/cart")
                dispatch(closeBuyNow())
              }}
              role="button"
              aria-label="Shopping Cart"
            >
              <IconLink iconType="cart" badgeCount={cartCount} className="nav-icon" />
            </div>
          </Nav>
        </div>
      </BootstrapNavbar>

      {/* ✅ FIXED: Search + Trending Tags */}
      <div className={`premium-search-container ${showSearch ? "show" : ""}`} ref={searchContainerRef}>
        <div className="premium-search-inner">
          <form className="premium-search-form" onSubmit={handleSearchSubmit}>
            <IconLink iconType="search" className="me-3" style={{ color: "var(--primary-pink)" }} />
            <input
              ref={searchInputRef}
              type="search"
              className="premium-search-input"
              placeholder="Search for products, brands, and more..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <Button
                variant="link"
                className="premium-search-clear p-0 ms-2"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <IconLink iconType="x" />
              </Button>
            )}
            <Button type="submit" className="premium-search-btn" aria-label="Search">
              <IconLink iconType="search" />
            </Button>
          </form>

          {showSuggestions && searchQuery.trim() ? (
            <SearchSuggestions query={searchQuery} onSelect={handleSuggestionSelect} onClose={closeSuggestions} />
          ) : (
            <div className="trending-searches">
              <div className="trending-title">Popular Searches</div>
              <div className="trending-tags">
                <div
                  className="trending-tag"
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent("summer dress")}`)
                    setShowSearch(false)
                    setShowSuggestions(false)
                  }}
                >
                  Summer Dress
                </div>
                <div
                  className="trending-tag"
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent("cotton tops")}`)
                    setShowSearch(false)
                    setShowSuggestions(false)
                  }}
                >
                  Cotton Tops
                </div>
                <div
                  className="trending-tag"
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent("denim")}`)
                    setShowSearch(false)
                    setShowSuggestions(false)
                  }}
                >
                  Denim
                </div>
                <div
                  className="trending-tag"
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent("floral")}`)
                    setShowSearch(false)
                    setShowSuggestions(false)
                  }}
                >
                  Floral
                </div>
                <div
                  className="trending-tag"
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent("casual")}`)
                    setShowSearch(false)
                    setShowSuggestions(false)
                  }}
                >
                  Casual
                </div>
              </div>
            </div>
          )}
        </div>
        <button className="premium-search-close" onClick={toggleSearch} aria-label="Close search">
          ✕
        </button>
      </div>

      <div className={`search-overlay ${showSearch ? "show" : ""}`} onClick={toggleSearch}></div>

      {/* ✅ FIXED: Mobile Offcanvas - NO onClick on NavLinks */}
      <Offcanvas
        show={offcanvasShow}
        onHide={() => setOffcanvasShow(false)}
        placement="start"
        className="mobile-offcanvas"
      >
        <Offcanvas.Header className="offcanvas-header-custom">
          <Offcanvas.Title>Nyraa</Offcanvas.Title>
          <Button
            variant="link"
            onClick={() => setOffcanvasShow(false)}
            className="btn-close-custom"
            aria-label="Close"
          >
            ✕
          </Button>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <NavLink
              to="/collections/dresses"
              className={({ isActive }) => `nav-link text-uppercase fw-bold ${isActive ? "active" : ""}`}
            >
              All
            </NavLink>

            {mainCategories.map((item) => (
              <NavLink
                key={item.id}
                to={`/collections/${item.slug}`}
                className={({ isActive }) => `nav-link text-uppercase fw-bold ${isActive ? "active" : ""}`}
              >
                {item.name}
              </NavLink>
            ))}

            <div className="mobile-dropdown mt-2">
              <div
                className="dropdown-toggle-mobile fw-bold text-uppercase d-flex justify-content-between align-items-center"
                onClick={() => toggleMobileDropdown("more")}
                role="button"
                aria-expanded={mobileDropdownOpen.more}
              >
                More Categories
                <IconLink
                  iconType="chevron-down"
                  className={`transition-transform ${mobileDropdownOpen.more ? "rotate-180" : ""}`}
                />
              </div>

              {mobileDropdownOpen.more && (
                <div className="dropdown-menu-mobile mt-2">
                  {moreCategories.map((item) => (
                    <NavLink
                      key={item.id}
                      to={`/collections/${item.slug}`}
                      className={({ isActive }) => `dropdown-item text-uppercase ${isActive ? "active" : ""}`}
                      style={{ fontSize: "0.9rem" }}
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <div
              className="nav-link text-uppercase fw-bold"
              onClick={handleAccountClick}
              style={{ cursor: "pointer" }}
            >
              {isLoggedIn ? "My Account" : "Login"}
            </div>

            {isLoggedIn && (
              <div
                className="nav-link text-uppercase fw-bold"
                onClick={() => handleProtectedNavigation("/wishlist")}
                style={{ cursor: "pointer" }}
              >
                Wishlist {!isProfileComplete() && <span style={{ color: "#ff6b6b" }}>*</span>}
              </div>
            )}

            {isLoggedIn && (
              <div
                className="nav-link text-uppercase fw-bold"
                onClick={() => handleProtectedNavigation("/cart")}
                style={{ cursor: "pointer" }}
              >
                Cart {!isProfileComplete() && <span style={{ color: "#ff6b6b" }}>*</span>}
              </div>
            )}

            {isLoggedIn && (
              <div
                className="nav-link text-uppercase fw-bold"
                onClick={handleLogoutPrompt}
                style={{ cursor: "pointer" }}
              >
                Logout
              </div>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      <ConfirmationModal
        show={showConfirmModal}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={modalConfig.title}
        actionType={modalConfig.actionType}
      />
    </>
  )
}

export default Navbar
