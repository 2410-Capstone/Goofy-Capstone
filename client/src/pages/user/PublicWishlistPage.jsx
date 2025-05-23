import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const PublicWishlistPage = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/wishlists/share/${shareId}`);
        
        

        if (user && user.id === res.data.user_id) {
          setIsOwner(true);
        }

        setWishlist(res.data);

        const itemsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/wishlists/${res.data.id}/items`);

        setItems(itemsRes.data);
      } catch (err) {
        console.error("Failed to load public wishlist:", err);
        setError(
          err.response?.data?.error || "Wishlist not found or not public"
        );
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [shareId, user, navigate]);

  const handleUnshare = async () => {
    try {

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/wishlists/${wishlist.id}/unshare`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate(`${import.meta.env.VITE_BACKEND_URL}/wishlists/${wishlist.id}`); 

    } catch (err) {
      setError("Failed to make private");
    }
  };

  if (loading) return <div className="loading">Loading wishlist...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!wishlist) return <div>Wishlist not found</div>;

  return (
    <div className="public-wishlist">
      <div className="wishlist-header">
        <h2>{wishlist.name}'s Wishlist</h2>
        {isOwner && (
          <button onClick={handleUnshare} className="btn-unshare">
            Make Private
          </button>
        )}
      </div>

      <div className="items-list">
        {items.length === 0 ? (
          <p className="empty">No items in this wishlist</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="price">${Number(item.price || 0).toFixed(2)}</p>

                <p className="description">{item.description}</p>
              </div>
              {!isOwner && (
                <Link to={`/products/${item.id}`} className="btn-view">
                  View Product
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PublicWishlistPage;
