import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import './Review.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Review = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in to leave a review.");
      navigate('/auth');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        author: currentUser.email,
        text: reviewText,
        createdAt: new Date(),
      });
      alert('Thank you for your review!');
      setReviewText('');
    } catch (error) {
      console.error("Error submitting review:", error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-container">
      <div className="review-card">
        <h2 className="review-heading">Add a Review</h2>
        <p className="review-subheading">Share your thoughts on RecipeHub!</p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows="8"
            placeholder="Write your review here..."
            required
            disabled={!currentUser}
          ></textarea>
          <button type="submit" disabled={submitting || !currentUser}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Review;