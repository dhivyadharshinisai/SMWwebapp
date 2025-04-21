import React, { useState, useEffect } from 'react';
import logo from './assets/logoimg.jpeg';
import './Styles/Home.css';
import Dashboard from './Dashboard';

const features = [
  {
    title: "Real-time Harm Detection",
    description: "🚨 Monitors and detects suicidal or harmful search behaviors using advanced AI.",
    image: "https://cdn-icons-png.flaticon.com/512/564/564619.png"
  },
  {
    title: "Daily Reports to Parents",
    description: "📊 Sends easy-to-read browsing activity reports to parents every day.",
    image: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
  },
  {
    title: "Instant AI Support",
    description: "💬 Guides the child to a helpful AI chatbot when distress is detected.",
    image: "https://cdn-icons-png.flaticon.com/512/4712/4712139.png"
  },
  {
    title: "Privacy & Security",
    description: "🔐 Ensures secure handling of data with full user privacy in mind.",
    image: "https://cdn-icons-png.flaticon.com/512/942/942748.png"
  },
  {
    title: "Powered by GenAI",
    description: "🧠 Smart support powered by GenAI that understands user intent and emotion.",
    image: "https://cdn-icons-png.flaticon.com/512/3820/3820337.png"
  }
];

const Home = ({ userDetails, onLogout }) => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (showDashboard) return <Dashboard userDetails={userDetails} />;

  return (
    <div className="home-container">
      {/* Nav Bar */}
      <div className="nav-bar">
        <div className="logo-title">
          <img src={logo} alt="logo" className="logo" />
          <h2>SafeMind Watch</h2>
        </div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>

      {/* Welcome Section */}
      <div className="main-content">
        <h3>Welcome, {userDetails.name}!</h3>
        <p>Your digital safety partner is here.</p>
        <button className="dashboard-btn" onClick={() => setShowDashboard(true)}>
          Go to Dashboard
        </button>
      </div>

      {/* Feature Carousel */}
      <div className="carousel-container">
        <div className="carousel-slide">
          <img src={features[currentFeature].image} alt="Feature" className="feature-img" />
          <h4>{features[currentFeature].title}</h4>
          <p>{features[currentFeature].description}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
