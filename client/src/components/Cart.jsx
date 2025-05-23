import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getGuestCart, setGuestCart, clearGuestCart } from "../utils/cart";
import { Link } from "react-router-dom"; 
import AddToWishlistButton from "./AddToWishlistButton";
import { toast } from "react-toastify";


const Cart = () => {
  const navigate = useNavigate();
  const loadMoreRef = useRef(null);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [visibleGenreCount, setVisibleGenreCount] = useState(2);
  const [shuffledGenres, setShuffledGenres] = useState([]);

  const isGuest = !localStorage.getItem("token");



  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });


  const handleAddToCart = async (product) => {
    if (!product?.id) {
      console.error("Invalid product ID");
      return;
    }
  
    if (isGuest) {
      const current = getGuestCart();
      const exists = current.find((i) => i.id === product.id);
  
      if (exists) {
        const updated = current.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
        setGuestCart(updated);
        setCartItems(updated);
        toast.success("Added to bag!");
      } else {
        const updated = [...current, { ...product, quantity: 1 }];
        setGuestCart(updated);
        setCartItems(updated);
        toast.success("Added to bag!");
      }
      return;
    }
  
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),

      });
  
      if (!res.ok) {
        toast.error("Failed to add to bag.");
        throw new Error("Failed to add to cart");
      }
  
      await fetchCart();
      toast.success("Added to bag!");
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };
  
  

  

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
        const data = await res.json();
        setAllProducts(data.products || data);
      } catch (err) {
        console.error("Failed to fetch more products:", err);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (allProducts.length > 0) {
      const genreMap = {};
      allProducts.forEach((item) => {
        const genre = item.genre || "Other";
        if (!genreMap[genre]) genreMap[genre] = [];
        genreMap[genre].push(item);
      });
      const genres = Object.keys(genreMap);
      const shuffled = genres.sort(() => 0.5 - Math.random());
      setShuffledGenres(shuffled);
    }
  }, [allProducts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleGenreCount < shuffledGenres.length) {
          setVisibleGenreCount((prev) => prev + 2);
        }
      },
      { rootMargin: "200px" }
    );

    const node = loadMoreRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [visibleGenreCount, shuffledGenres.length]);

  const handleDetailsClick = (id) => {
    navigate(`/products/${id}`);
  };

  const fetchCart = async () => {
    setIsLoading(true);
    if (isGuest) {
      const guestCart = getGuestCart().map((item) => ({
        ...item,
        price: Number(item.price) || 0,
      }));
      setCartItems(guestCart);
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts`, {
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error("Cart API did not return an array:", data);
        return;
      }
      const formattedItems = data.map((item) => ({
        ...item,
        price: parseFloat(item.price) || 0,
      }));
      setCartItems(formattedItems);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId, newQuantity, item) => {
    if (isGuest) {
      const updatedCart =
        newQuantity < 1
          ? getGuestCart().filter((it) => it.id !== itemId)
          : getGuestCart().map((it) =>
              it.id === itemId ? { ...it, quantity: newQuantity } : it
            );
      setGuestCart(updatedCart);
      setCartItems(updatedCart);
      return;
    }

    if (newQuantity < 1) {
      return handleRemoveItem(itemId); 
    }
    


    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      setCartItems((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, quantity: newQuantity } : it))
      );
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (isGuest) {
      const updatedCart = getGuestCart().filter((it) => it.id !== itemId);
      setGuestCart(updatedCart);
      setCartItems(updatedCart);
      return;
    }
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/items/${itemId}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const calculateTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = () => {
    navigate("/checkout", {
      state: {
        cartItems,
        cartTotal: calculateTotal(),
        timestamp: Date.now(),
      },
    });
  };

  const genreMap = {};
  allProducts
    .filter((item) => !cartItems.some((cartItem) => cartItem.product_id === item.id))
    .forEach((item) => {
      const genre = item.genre || "Other";
      if (!genreMap[genre]) genreMap[genre] = [];
      genreMap[genre].push(item);
    });

  const genresToShow = shuffledGenres.slice(0, visibleGenreCount);

  return (
    <main className="cart-page">
      <div className="cart-container">
        <div className="cart-title"><h2>Shopping bag</h2></div>
        <div className="full-width-divider" />
        <section className="cart-items">
          {cartItems.length === 0 ? (
            <p className="cart-empty">Your cart is empty</p>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
  <Link to={`/home/${item.product_id}`} className="item-image" style={{ display: "block" }}>
    <img
      src={`${import.meta.env.VITE_BACKEND_URL}/public${item.image_url}`}
      alt="Album Art"
      className="card-image"
    />
  </Link>

                <div className="item-details">
                <Link to={`/home/${item.product_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <h3 className="item-title">{item.artist || `Album #${item.product_id}`}</h3>
                </Link>

                  <p>Format: Vinyl</p>
                  <div className="item-price">${Number(item.price).toFixed(2)}</div>
                  <p className="quantity-label">Quantity:</p>
                  <div className="quantity-controls">
                    <button className="cart_btn cart_btn--minus" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item)}>-</button>
                    <span className="cart_quantity">{item.quantity}</span>
                    <button className="cart_btn cart_btn--plus" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => handleRemoveItem(item.id)}>Remove</button>
                  <p className="item-subtotal">Subtotal: <span className="subtotal-price">${(Number(item.price) * item.quantity).toFixed(2)}</span></p>
                </div>
              </div>
            ))
          )}
        </section>

        <aside className="cart-summary">
          <div className="summary-box">
            <div className="summary-header">
              <h3 className="summary-title">Order summary</h3>
              <span className="summary-items">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} Item(s)</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-line"><span>Item(s) Subtotal</span><span>${calculateTotal().toFixed(2)}</span></div>
            <div className="summary-line muted"><span>Shipping</span><span>TBD</span></div>
            <div className="summary-line"><span>Subtotal</span><span>${calculateTotal().toFixed(2)}</span></div>
            <div className="summary-line muted"><span>Tax</span><span>TBD</span></div>
            <div className="summary-total"><span>Order total</span><strong>${calculateTotal().toFixed(2)}</strong></div>
          </div>
          <div className="summary-side">
          {isGuest ? (
            <>
              <button
                className="checkout-btn"
                onClick={() =>
                  navigate("/register", {
                    state: { fromCheckout: true },
                  })
                }
              >
                Sign Up & Checkout
              </button>

              <button
                className="checkout-btn"
                style={{ marginTop: "0.5rem" }}
                onClick={() =>
                  navigate("/checkout", {
                    state: {
                      cartItems,
                      cartTotal: calculateTotal(),
                      timestamp: Date.now(),
                    },
                  })
                }
              >
                Continue As Guest
              </button>
            </>
          ) : (
            <button className="checkout-btn" onClick={handleCheckout}>
              Checkout
            </button>
          )}

          </div>
          </aside>

<div className="also-like"><h2>You may also like</h2></div>
<div className="full-width-divider" />
</div>

{genresToShow.map((genre) => {
  const products = genreMap[genre];
  if (!products) return null;
  return (
    <section className="c-related-products" key={genre}>
      <div className="c-genre-header"><h2>{genre}</h2></div>
      <div className="c-products-grid">
        {products.slice(0, 10).map((item) => {
          if (!item.id) {
            console.warn("Missing product ID in item:", item);
            return null;
          }

          return (
            <div key={item.id} className="c-related-product-card">
              <Link to={`/home/${item.id}`}>
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}/public${item.image_url}`}
                  alt={item.title}
                  className="c-related-card-image"
                />
              </Link>
              <div className="c-related-card-info">
                <div className="card-title-row">
                  <div className="c-related-card-title">{item.description || "Untitled"}</div>
                  <div className="wishlist-center-wrapper">
                  <AddToWishlistButton productId={item.id} />
                  </div>
                </div>
                <div className="c-related-card-artist">{item.artist || "Unknown Artist"}</div>
                <div className="c-card-genre">{genre || "Unknown Genre"}</div>
                <div className="c-related-card-price">
                  {item.price ? `$${item.price}` : "Not available"}
                </div>
                <button
            className="add-to-cart-button"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(item);
            }}
          >
            Add to Bag
          </button>

              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
})}


      {visibleGenreCount < shuffledGenres.length && (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button className="load-more-btn" onClick={() => setVisibleGenreCount((prev) => prev + 2)}>Load More</button>
        </div>
      )}

      <div ref={loadMoreRef} style={{ height: "1px" }} />
    </main>
  );
};

export default Cart;
