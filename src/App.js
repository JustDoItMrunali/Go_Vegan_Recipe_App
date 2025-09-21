import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import UploadRecipe from './pages/UploadRecipe';
import Auth from './pages/Auth';
import PrivateRoute from './components/PrivateRoute';
import Contact from './pages/Contact';
import Review from './pages/Review';
import './App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recipes/:id" element={<RecipeDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/review" element={<Review />} />
              <Route 
                path="/upload-recipe" 
                element={
                  <PrivateRoute>
                    <UploadRecipe />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;