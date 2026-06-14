import React from 'react';
import './StarRating.css';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
  showEmptyStars?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 24,
  readonly = false,
  showEmptyStars = true,
}) => {
  const handleClick = (selectedRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  return (
    <div className="star-rating-container">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= rating;
        const isHalf = star === Math.ceil(rating) && rating % 1 !== 0;
        
        if (!showEmptyStars && !isFilled && !isHalf) {
          return null;
        }

        return (
          <button
            key={star}
            onClick={() => handleClick(star)}
            disabled={readonly}
            className={`star-button ${readonly ? 'readonly' : ''}`}
            style={{ fontSize: `${size}px` }}
            type="button"
          >
            <span className={`material-icons ${isFilled ? 'filled' : isHalf ? 'half' : 'empty'}`}>
              {isFilled ? 'star' : isHalf ? 'star_half' : 'star_border'}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
