import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

const Header = () => {
  const { currentUser } = useAuth();
  const { toggleTheme, theme } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const userDisplayName = currentUser?.displayName || currentUser?.email;

  return (
    <header>
      <Link to="/" className="logo">RecipeHub</Link>
      <div className="nav-buttons">
        {currentUser ? (
          <>
            <span className="user-greeting">{userDisplayName}</span>
            <span onClick={toggleTheme} className="theme-toggle-icon">
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
            <Link to="/contact">
              <button className="contact-btn">Contact Us</button>
            </Link>
            <Link to="/upload-recipe">
              <button className="add-recipe-btn">Add Recipe</button>
            </Link>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <span onClick={toggleTheme} className="theme-toggle-icon">
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
            <Link to="/auth">
              <button className="add-recipe-btn">Log In</button>
            </Link>
            <Link to="/auth">
              <button className="signup-btn">Sign Up</button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;