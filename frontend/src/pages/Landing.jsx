import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Wallet, Bell, ShieldCheck, BarChart3, Target, 
  ArrowUpRight, ArrowDownRight, PieChart, Send,
  Facebook, Twitter, Instagram, Linkedin, Plus,
  TrendingUp, CreditCard
} from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  const goLogin = (e) => {
    e?.preventDefault()
    navigate('/login')
  }

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-logo" onClick={goLogin}>
          <Wallet size={24} color="#16a34a" />
          <span>SplitMoney</span>
        </div>
        <div className="landing-nav-links">
          {['Dashboard', 'Expenses', 'Categories', 'Reports', 'Budgets', 'Goals'].map(link => (
            <a href="#" key={link} onClick={goLogin} className={link === 'Dashboard' ? 'active' : ''}>{link}</a>
          ))}
        </div>
        <div className="landing-nav-right">
          <button className="icon-btn" onClick={goLogin}><Bell size={20} /></button>
          <button className="btn btn-primary" onClick={goLogin} style={{ padding: '8px 20px', borderRadius: '8px' }}>
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Track Expenses.<br />
            <span className="text-green">Save Better.</span> Live Smarter.
          </h1>
          <p className="hero-subtitle">
            Take control of your money. Track your expenses, set budgets and achieve your financial goals.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={goLogin}>
              Add Expense <Plus size={18} />
            </button>
            <button className="btn btn-outline-green btn-lg" onClick={goLogin}>
              View Reports <BarChart3 size={18} />
            </button>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <img src="/hero-wallet.png" alt="Wallet and coins" className="hero-image" />
        </div>
      </section>

      {/* Green Curve Background */}
      <div className="landing-curve">
        <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
          <path fill="#16a34a" fillOpacity="1" d="M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,192C672,213,768,235,864,240C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* Stats Cards */}
      <section className="landing-stats">
        <div className="stat-box">
          <div className="stat-icon-wrap"><CreditCard size={24} /></div>
          <div className="stat-info">
            <div className="stat-label">Total Expenses</div>
            <div className="stat-value">₹45,680</div>
            <div className="stat-trend trend-up"><ArrowUpRight size={14} /> 12% vs last month</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon-wrap"><Wallet size={24} /></div>
          <div className="stat-info">
            <div className="stat-label">Total Income</div>
            <div className="stat-value">₹85,000</div>
            <div className="stat-trend trend-up"><ArrowUpRight size={14} /> 8% vs last month</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon-wrap"><PieChart size={24} /></div>
          <div className="stat-info">
            <div className="stat-label">Total Savings</div>
            <div className="stat-value">₹39,320</div>
            <div className="stat-trend trend-up"><ArrowUpRight size={14} /> 15% vs last month</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon-wrap"><Target size={24} /></div>
          <div className="stat-info">
            <div className="stat-label">Monthly Budget</div>
            <div className="stat-value">₹60,000</div>
            <div className="stat-trend trend-down"><ArrowDownRight size={14} /> 5% left</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="feature-card">
          <div className="feature-icon"><ShieldCheck size={28} /></div>
          <h3 className="feature-title">Secure & Private</h3>
          <p className="feature-desc">Your data is safe with us.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><BarChart3 size={28} /></div>
          <h3 className="feature-title">Insightful Reports</h3>
          <p className="feature-desc">Understand your spending with detailed reports.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><Bell size={28} /></div>
          <h3 className="feature-title">Smart Alerts</h3>
          <p className="feature-desc">Get notified and never overspend.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><Target size={28} /></div>
          <h3 className="feature-title">Achieve Goals</h3>
          <p className="feature-desc">Stay focused and reach your goals faster.</p>
        </div>
      </section>

      {/* Savings Section */}
      <section className="landing-save-section">
        <div className="save-image-col">
          <img src="/savings-piggy.png" alt="Piggy Bank" className="save-image" />
        </div>
        <div className="save-content">
          <h2 className="save-title">Save today for a<br />better tomorrow!</h2>
          <p className="save-desc">Set your savings goals and let us help you achieve them.</p>
          <button className="btn btn-primary btn-lg" onClick={goLogin}>
            Create Goal <Target size={18} />
          </button>
        </div>
        <div className="save-chart-wrapper">
           <div className="floating-badge">
             <div className="badge-text">You saved</div>
             <div className="badge-amount">₹12,750</div>
             <div className="badge-text">this month</div>
           </div>
           {/* Simple SVG Chart approximation */}
           <svg className="save-chart" viewBox="0 0 400 150">
             <path d="M0,140 L50,120 L100,130 L150,80 L200,85 L250,30 L300,50 L350,10 L380,20 L400,0" fill="none" stroke="#16a34a" strokeWidth="4" />
             <circle cx="400" cy="0" r="4" fill="#16a34a" />
           </svg>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-wave">
          <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
            <path fill="#15803d" fillOpacity="1" d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
        <div className="footer-content">
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <Wallet size={24} color="#fff" />
              <span>SmartExpense</span>
            </div>
            <p>Your personal finance partner to track expenses, save more and live better.</p>
            <div className="social-links">
              <a href="#" onClick={goLogin}><Facebook size={18} /></a>
              <a href="#" onClick={goLogin}><Twitter size={18} /></a>
              <a href="#" onClick={goLogin}><Instagram size={18} /></a>
              <a href="#" onClick={goLogin}><Linkedin size={18} /></a>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#" onClick={goLogin}>Dashboard</a>
            <a href="#" onClick={goLogin}>Expenses</a>
            <a href="#" onClick={goLogin}>Budgets</a>
            <a href="#" onClick={goLogin}>Reports</a>
            <a href="#" onClick={goLogin}>Goals</a>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <a href="#" onClick={goLogin}>About Us</a>
            <a href="#" onClick={goLogin}>Blog</a>
            <a href="#" onClick={goLogin}>Careers</a>
            <a href="#" onClick={goLogin}>Privacy Policy</a>
            <a href="#" onClick={goLogin}>Terms & Conditions</a>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <a href="#" onClick={goLogin}>Help Center</a>
            <a href="#" onClick={goLogin}>Contact Us</a>
            <a href="#" onClick={goLogin}>FAQs</a>
            <a href="#" onClick={goLogin}>Feedback</a>
          </div>

          <div className="footer-col newsletter-col">
            <h4>Stay Updated</h4>
            <p>Subscribe to our newsletter for tips and updates.</p>
            <form className="newsletter-form" onSubmit={goLogin}>
              <input type="email" placeholder="Enter your email" required />
              <button type="submit"><Send size={16} /></button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2024 SmartExpense. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
