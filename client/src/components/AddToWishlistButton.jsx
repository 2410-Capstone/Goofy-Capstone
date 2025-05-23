import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AddToWishlistButton = ({ productId }) => {
  const { user } = useAuth();
  const [wishlists, setWishlists] = useState([]);
  const [selectedWishlist, setSelectedWishlist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const wrapperRef = useRef(null);
  const timeoutRef = useRef(null);

  const fetchWishlists = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/wishlists/user/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWishlists(res.data);
      setIsDropdownOpen(true);
    } catch (err) {
      console.error("Failed to fetch wishlists:", err);
    }
  };

  useEffect(() => {
    setIsAdded(false);
    setSelectedWishlist(null);
    setWishlists([]);
    setError(null);
    setSuccess(false);

    if (!user || !user.id) return;

    const checkIfAlreadyAdded = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/wishlists/user/${user.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        const allWishlists = res.data;

        for (let wishlist of allWishlists) {
          const itemsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/wishlists/${wishlist.id}/items`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });

          const items = itemsRes.data;

          if (items.some(item => item.id === productId)) {
            setIsAdded(true);
            setSelectedWishlist(wishlist);
            break;
          }
        }
      } catch (err) {
        console.error("Failed to fetch wishlists:", err);
      }
    };

    checkIfAlreadyAdded();
  }, [productId, user]);

  const handleAddToWishlist = async () => {
    if (!selectedWishlist) return;

    setLoading(true);
    setError(null);

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlists/${selectedWishlist.id}/items`,
        { productId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setSuccess(true);
      setIsAdded(true);
      setWishlists([]);
      setIsDropdownOpen(false);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add to wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async () => {
    if (!selectedWishlist) return;

    try {
      setLoading(true);
      setError(null);

      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlists/${selectedWishlist.id}/items/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setIsAdded(false);
      setSelectedWishlist(null);
      setWishlists([]);
      setIsDropdownOpen(false);
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      setError(err.response?.data?.error || 'Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const delayedClose = () => {
    timeoutRef.current = setTimeout(() => setIsDropdownOpen(false), 500);
  };

  const cancelClose = () => {
    clearTimeout(timeoutRef.current);
  };

  return (
    <div
      className="add-to-wishlist"
      ref={wrapperRef}
      onMouseEnter={cancelClose}
      onMouseLeave={delayedClose}
    >
      <div className="wishlist-status-row" onClick={(e) => e.stopPropagation()}>
        {!user ? (
          <div className="wishlist-tooltip-wrapper">
            <button className="wishlist-icon-button disabled" disabled>
              <span className="music-note-icon">♫</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (isAdded) {
                handleRemoveFromWishlist();
              } else {
                if (isDropdownOpen) {
                  setIsDropdownOpen(false);
                } else {
                  fetchWishlists();
                }
              }
            }}
            className={`wishlist-icon-button ${isAdded ? 'added' : ''}`}
            aria-label={isAdded ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <span className="music-note-icon">♫</span>
          </button>
        )}

        {isAdded && selectedWishlist && (
          <Link to="/wishlists" className="my-list-link" />
        )}
      </div>

      {!isAdded && isDropdownOpen && wishlists.length > 0 && (
        <div className="wishlist-dropdown" onClick={(e) => e.stopPropagation()}>
          <select
            value={selectedWishlist?.id || ''}
            onChange={(e) => {
              const selected = wishlists.find(w => w.id === parseInt(e.target.value));
              setSelectedWishlist(selected);
            }}
          >
            <option value="">Select list</option>
            {wishlists.map(wishlist => (
              <option key={wishlist.id} value={wishlist.id}>
                {wishlist.name}
              </option>
            ))}
          </select>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToWishlist();
            }}
            disabled={!selectedWishlist || loading}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AddToWishlistButton;
