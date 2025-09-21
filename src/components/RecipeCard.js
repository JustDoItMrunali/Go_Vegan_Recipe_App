import React from 'react';
import { Link } from 'react-router-dom';

const RecipeCard = ({ recipe }) => {
  const formatTitle = (title) => {
    const parts = title.split(/ (vegan) /i);
    return parts.map((part, index) => {
      if (part.toLowerCase() === 'vegan') {
        return <span key={index} className="styled-vegan">{part}</span>;
      }
      return part;
    });
  };

  return (
    <Link to={`/recipes/${recipe.id}`} className="recipe-card-link">
      <div className="recipe-card">
        <img src={recipe.image_url} alt={recipe.name} />
        <div className="recipe-card-content">
          <h3>{formatTitle(recipe.name)}</h3>
          <p>by {recipe.author || 'User'}</p>
          <span className="category-tag">{recipe.category}</span>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;