import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import RecipeCard from '../components/RecipeCard';
import { Link } from 'react-router-dom';
import './Home.css';

// Custom hook for debouncing a value
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchRecipes = useCallback(async (category, term) => {
    setLoading(true);
    try {
      let q = collection(db, 'recipes');
      
      // Correct Logic: Filter by the selected category, or fetch all if 'All' is selected
      if (category !== 'All') {
        q = query(q, where('category', '==', category.toLowerCase()));
      }

      if (term) {
        const allRecipesSnapshot = await getDocs(q); // Fetch only from the selected category
        const filteredRecipes = allRecipesSnapshot.docs.filter(doc => {
          const data = doc.data();
          const lowerCaseTerm = term.toLowerCase();
          const nameMatch = data.name.toLowerCase().includes(lowerCaseTerm);
          const descriptionMatch = data.description.toLowerCase().includes(lowerCaseTerm);
          const ingredientsMatch = data.ingredients.some(ing => ing.toLowerCase().includes(lowerCaseTerm));
          
          return nameMatch || descriptionMatch || ingredientsMatch;
        });
        setRecipes(filteredRecipes.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        const recipeSnapshot = await getDocs(q);
        const recipeList = recipeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecipes(recipeList);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes(selectedCategory, debouncedSearchTerm);
  }, [selectedCategory, debouncedSearchTerm, fetchRecipes]);

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert'];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="home-container">
      <div className="search-section">
        <input 
          type="text" 
          placeholder="Search recipes, ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="category-filters">
          {categories.map(category => (
            <button 
              key={category} 
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="recipes-grid">
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default Home;