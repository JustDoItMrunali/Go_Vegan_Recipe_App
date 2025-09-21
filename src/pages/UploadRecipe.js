import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './UploadRecipe.css';

const CLOUD_NAME = "dojyoic3g";
const UPLOAD_PRESET = "go_vegan_recipe_preset";

const UploadRecipe = () => {
  const { currentUser } = useAuth();
  const [recipe, setRecipe] = useState({
    name: '',
    category: 'breakfast',
    description: '',
    servings: '', // New field
    prepTime: '', // New field
    calories: '', // New field
    fat: '',      // New field
    carbs: '',    // New field
    protein: ''   // New field
  });
  const [ingredients, setIngredients] = useState(['']); 
  const [steps, setSteps] = useState(['']); 
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: value });
  };

  const handleDynamicChange = (type, index, value) => {
    if (type === 'ingredients') {
      const newIngredients = [...ingredients];
      newIngredients[index] = value;
      setIngredients(newIngredients);
    } else {
      const newSteps = [...steps];
      newSteps[index] = value;
      setSteps(newSteps);
    }
  };

  const addDynamicField = (type) => {
    if (type === 'ingredients') {
      setIngredients([...ingredients, '']);
    } else {
      setSteps([...steps, '']);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    if (!file) {
      alert("Please upload an image or video.");
      setUploading(false);
      return;
    }
    
    if (!currentUser) {
        alert("You must be logged in to upload a recipe.");
        setUploading(false);
        return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        formData
      );
      const fileURL = response.data.secure_url;

      await addDoc(collection(db, 'recipes'), {
        ...recipe,
        ingredients: ingredients.filter(item => item.trim() !== ''),
        steps: steps.filter(item => item.trim() !== ''),
        image_url: fileURL,
        author: currentUser.email,
        createdAt: new Date(),
      });

      alert("Recipe uploaded successfully!");
      navigate('/');
    } catch (error) {
      console.error("Error uploading recipe:", error.response || error);
      alert("Failed to upload recipe.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="form-card">
        <h2 className="form-heading">Upload a New Recipe</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group-vertical">
            <label className="input-label">Recipe Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter Recipe Name"
              value={recipe.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group-vertical">
            <label className="input-label">Recipe Type</label>
            <select 
              name="category" 
              value={recipe.category} 
              onChange={handleChange} 
              className="form-input"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>
          
          <div className="form-group-vertical">
            <label className="input-label">Servings</label>
            <input
              type="text"
              name="servings"
              placeholder="e.g., 2 or 4"
              value={recipe.servings}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group-vertical">
            <label className="input-label">Prep & Cook Time</label>
            <input
              type="text"
              name="prepTime"
              placeholder="e.g., 35 min"
              value={recipe.prepTime}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group-vertical">
            <label className="input-label">Description</label>
            <textarea
              name="description"
              placeholder="Description"
              value={recipe.description}
              onChange={handleChange}
              className="form-textarea"
              required
            ></textarea>
          </div>
          
          <div className="form-group-vertical">
            <label className="input-label">Nutritional Information (per serving)</label>
            <input type="text" name="calories" placeholder="Calories" value={recipe.calories} onChange={handleChange} className="form-input" />
            <input type="text" name="fat" placeholder="Fat (g)" value={recipe.fat} onChange={handleChange} className="form-input" />
            <input type="text" name="carbs" placeholder="Carbohydrates (g)" value={recipe.carbs} onChange={handleChange} className="form-input" />
            <input type="text" name="protein" placeholder="Protein (g)" value={recipe.protein} onChange={handleChange} className="form-input" />
          </div>

          <div className="dynamic-input-group">
            <label className="input-label">Ingredients</label>
            {ingredients.map((ing, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Ingredient ${index + 1}`}
                value={ing}
                onChange={(e) => handleDynamicChange('ingredients', index, e.target.value)}
                className="form-input"
              />
            ))}
            <button type="button" onClick={() => addDynamicField('ingredients')} className="add-btn">+ Add Ingredient</button>
          </div>

          <div className="dynamic-input-group">
            <label className="input-label">Steps</label>
            {steps.map((step, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Step ${index + 1}`}
                value={step}
                onChange={(e) => handleDynamicChange('steps', index, e.target.value)}
                className="form-input"
              />
            ))}
            <button type="button" onClick={() => addDynamicField('steps')} className="add-btn">+ Add Step</button>
          </div>

          <div className="form-group-vertical">
            <label className="input-label">Upload Image/Video</label>
            <div className="file-group">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                id="file-input"
                required
              />
              <label htmlFor="file-input" className="file-label">Choose file</label>
              <span className="file-name">{file ? file.name : 'No file chosen'}</span>
            </div>
          </div>

          <button type="submit" disabled={uploading} className="submit-btn">
            {uploading ? 'Uploading...' : 'Submit Recipe'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadRecipe;