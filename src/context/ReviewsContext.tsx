import React, { createContext, useContext, useState, useEffect } from 'react';
import { Review } from '../types';

interface ReviewsContextType {
  getReviewsForProduct: (productId: string) => Review[];
  getProductStats: (productId: string) => { rating: number; reviewsCount: number };
  addReview: (
    productId: string,
    data: { author: string; rating: number; comment: string; city?: string }
  ) => Review;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

const REVIEWS_STORAGE_KEY = 'glowistic_customer_reviews';

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load reviews from localStorage', e);
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviewsMap));
    } catch (e) {
      console.error('Failed to save reviews to localStorage', e);
    }
  }, [reviewsMap]);

  const getReviewsForProduct = (productId: string): Review[] => {
    return reviewsMap[productId] || [];
  };

  const getProductStats = (productId: string): { rating: number; reviewsCount: number } => {
    const reviews = reviewsMap[productId] || [];
    if (reviews.length === 0) {
      return { rating: 0, reviewsCount: 0 };
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((sum / reviews.length).toFixed(1));
    return { rating: avg, reviewsCount: reviews.length };
  };

  const addReview = (
    productId: string,
    data: { author: string; rating: number; comment: string; city?: string }
  ): Review => {
    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      author: data.author.trim(),
      rating: Math.max(1, Math.min(5, data.rating)),
      comment: data.comment.trim(),
      city: data.city?.trim() || undefined,
      date: new Date().toISOString().split('T')[0],
    };

    setReviewsMap((prev) => {
      const current = prev[productId] || [];
      return {
        ...prev,
        [productId]: [newReview, ...current],
      };
    });

    return newReview;
  };

  return (
    <ReviewsContext.Provider value={{ getReviewsForProduct, getProductStats, addReview }}>
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = (): ReviewsContextType => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};
