import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/RecipeCard';
import './RecipeDetail.css';

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const formatTitle = (title) => {
    if (!title) return '';
    const parts = title.split(/ (vegan) /i);
    return parts.map((part, index) => {
      if (part.toLowerCase() === 'vegan') {
        return <span key={index} className="styled-vegan">{part}</span>;
      }
      return part;
    });
  };

  const fetchRecipeData = async () => {
    try {
      const recipeRef = doc(db, 'recipes', id);
      const recipeSnap = await getDoc(recipeRef);
      if (recipeSnap.exists()) {
        const recipeData = recipeSnap.data();
        
        const ingredients = Array.isArray(recipeData.ingredients) 
          ? recipeData.ingredients 
          : (recipeData.ingredients || '').split('\n').filter(item => item.trim() !== '');

        const steps = Array.isArray(recipeData.steps) 
          ? recipeData.steps 
          : (recipeData.steps || '').split('\n').filter(item => item.trim() !== '');
        
        setRecipe({
          ...recipeData,
          ingredients: ingredients,
          steps: steps
        });

        const commentsRef = collection(db, `recipes/${id}/comments`);
        const commentsSnap = await getDocs(commentsRef);
        setComments(commentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        const q = query(collection(db, 'recipes'), where('category', '==', recipeData.category));
        const recommendationsSnap = await getDocs(q);
        const recommendedList = recommendationsSnap.docs
          .filter(doc => doc.id !== id) 
          .map(doc => ({ id: doc.id, ...doc.data() }));
        setRecommendations(recommendedList);
      } else {
        console.log("No such recipe!");
        navigate('/');
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipeData();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in to comment.");
      return;
    }
    if (newComment.trim() === '') return;

    try {
      await addDoc(collection(db, `recipes/${id}/comments`), {
        text: newComment,
        author: currentUser.email,
        createdAt: new Date(),
      });
      setNewComment('');
      fetchRecipeData();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleViewDetails = () => {
    if (!currentUser) {
      alert("You must log in to view the full recipe details, ingredients, and steps.");
      navigate('/auth');
    }
  };

  if (loading) return <div>Loading recipe...</div>;
  if (!recipe) return null;

  const isVideo = recipe.image_url && (recipe.image_url.includes('.mp4') || recipe.image_url.includes('.mov'));
  const halfIngredients = Math.ceil(recipe.ingredients.length / 2);

  return (
    <div className="recipe-detail-container">
      <div className="recipe-main-content">
        <h1 className="recipe-title">{formatTitle(recipe.name)}</h1>
        <div className="recipe-media-container">
          {isVideo ? (
            <video controls src={recipe.image_url} className="recipe-media"></video>
          ) : (
            <img src={recipe.image_url} alt={recipe.name} className="recipe-media" />
          )}
        </div>
        
        {!currentUser ? (
          <div className="login-prompt">
            <p>Please log in to view the full recipe details, ingredients, and steps.</p>
            <button onClick={handleViewDetails}>Log In to View</button>
          </div>
        ) : (
          <div className="recipe-details-content">
            <div className="recipe-stats-grid">
              <div className="stat-card">
                <span className="stat-label">Servings</span>
                <span className="stat-value">{recipe.servings || 'N/A'}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Prep & Cook Time</span>
                <span className="stat-value">{recipe.prepTime || 'N/A'}</span>
              </div>
            </div>

            <div className="nutrition-and-share-container">
              <div className="nutrition-panel">
                <h3 className="panel-heading">Nutrition Facts</h3>
                <div className="nutrition-grid">
                  <span className="nutri-label">Calories</span>
                  <span className="nutri-value">{recipe.calories || 'N/A'}</span>
                  <span className="nutri-label">Fat</span>
                  <span className="nutri-value">{recipe.fat || 'N/A'}g</span>
                  <span className="nutri-label">Carbs</span>
                  <span className="nutri-value">{recipe.carbs || 'N/A'}g</span>
                  <span className="nutri-label">Protein</span>
                  <span className="nutri-value">{recipe.protein || 'N/A'}g</span>
                </div>
              </div>
              <div className="share-panel">
                <h3 className="panel-heading">Share this Recipe:</h3>
                <button className="get-recipes-btn">Get Recipes Delivered</button>
              </div>
            </div>
            
            <h3 className="section-heading">Description</h3>
            <p>{recipe.description}</p>
            
            <h3 className="section-heading">Ingredients</h3>
            <div className="ingredients-columns">
              <ul className="recipe-list">
                {recipe.ingredients.slice(0, halfIngredients).map((item, index) => (
                  <li key={index}>{item.trim()}</li>
                ))}
              </ul>
              <ul className="recipe-list">
                {recipe.ingredients.slice(halfIngredients).map((item, index) => (
                  <li key={index}>{item.trim()}</li>
                ))}
              </ul>
            </div>
            
            <h3 className="section-heading">Steps</h3>
            <ol className="recipe-list">
              {recipe.steps.map((item, index) => (
                <li key={index}>{item.trim()}</li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <div className="comments-section">
        <h3 className="section-heading">Comments</h3>
        <form onSubmit={handleCommentSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows="3"
            disabled={!currentUser}
          ></textarea>
          <button type="submit" disabled={!currentUser}>Submit Comment</button>
        </form>
        <div className="comment-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <p><strong>{comment.author}:</strong> {comment.text}</p>
            </div>
          ))}
        </div>
      </div>
      
      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3 className="section-heading">Similar Recipes You Might Like</h3>
          <div className="recipes-grid">
            {recommendations.map(rec => (
              <RecipeCard key={rec.id} recipe={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;