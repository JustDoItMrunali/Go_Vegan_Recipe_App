import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Import the new CSS file

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [isOtpView, setIsOtpView] = useState(false);
  const navigate = useNavigate();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      alert("Please enter a phone number.");
      return;
    }
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allows the user to proceed with phone number authentication
        }
      });
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setIsOtpView(true);
      alert('OTP sent successfully!');
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };
  
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await confirmationResult.confirm(otp);
      navigate('/');
    } catch (error) {
      alert(error.message);
    }
  };

  const renderContent = () => {
    if (isOtpView) {
      return (
        <form onSubmit={handleVerifyOtp} className="auth-form">
          <input 
            type="number"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" className="login-btn">Verify OTP</button>
          <span className="back-link" onClick={() => setIsOtpView(false)}>Back</span>
        </form>
      );
    } else {
      return (
        <div className="auth-form-wrapper">
          <div className="tab-container">
            <button 
              className={`tab-btn ${isLoginView ? 'active' : ''}`} 
              onClick={() => setIsLoginView(true)}
            >
              Login
            </button>
            <button 
              className={`tab-btn ${!isLoginView ? 'active' : ''}`} 
              onClick={() => setIsLoginView(false)}
            >
              Signup
            </button>
          </div>
          <form onSubmit={handleEmailAuth} className="auth-form">
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
            <button type="submit" className="login-btn">{isLoginView ? 'Login' : 'Signup'}</button>
          </form>
          <div className="social-login-separator">OR</div>
          <button onClick={handleGoogleSignIn} className="google-btn">
            Sign in with Google
          </button>
        </div>
      );
    }
  };

  return (
    <div className="auth-container">
      <div id="recaptcha-container"></div>
      <div className="auth-card">
        <h2 className="card-title">{isOtpView ? 'OTP Verification' : 'Login / Signup'}</h2>
        {renderContent()}
      </div>
    </div>
  );
};

export default Auth;