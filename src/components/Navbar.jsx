import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.left}>
          <Link to="/" style={styles.brand}>
            <div style={styles.logo}>
              <span style={{color: 'white', fontWeight: 'bold', fontSize: '18px'}}>MyPDF</span>
            </div>
          </Link>
          <nav style={styles.nav}>
            <Link to="/merge_pdf" style={styles.navItem}>Merge PDF</Link>
            <Link to="/split_pdf" style={styles.navItem}>Split PDF</Link>
            <Link to="/compress_pdf" style={styles.navItem}>Compress PDF</Link>
            
            <div 
              style={styles.navDropdownContainer}
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <div style={styles.navDropdown}>
                Convert PDF <ChevronDown size={16} />
              </div>
              {showDropdown && (
                <div style={styles.dropdownMenu}>
                  <Link to="/pdf_to_word" style={styles.dropdownItem}>PDF to Word</Link>
                  <Link to="/pdf_to_jpg" style={styles.dropdownItem}>PDF to JPG</Link>
                  <Link to="/word_to_pdf" style={styles.dropdownItem}>Word to PDF</Link>
                </div>
              )}
            </div>

            <Link to="/edit-pdf" style={styles.navItem}>Edit PDF</Link>
            <Link to="/protect-pdf" style={styles.navItem}>Protect PDF</Link>
            <Link to="/rotate_pdf" style={styles.navItem}>Rotate PDF</Link>
          </nav>
        </div>
        
        <div style={styles.right}>
          <Link to="/login" style={styles.loginBtn}>Login</Link>
          <Link to="/register" style={styles.signupBtn}>Sign up</Link>
          <button style={styles.menuBtn}>
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e4e7',
    zIndex: 1000,
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    padding: '0 24px',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  logo: {
    backgroundColor: '#e5322d',
    padding: '6px 10px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  navItem: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#333',
    textDecoration: 'none',
  },
  navDropdownContainer: {
    position: 'relative',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
  },
  navDropdown: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '60px',
    left: 0,
    backgroundColor: '#fff',
    border: '1px solid #e5e4e7',
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '200px',
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#333',
    textDecoration: 'none',
    borderBottom: '1px solid #f4f4f4',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  loginBtn: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#333',
    textDecoration: 'none',
  },
  signupBtn: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#e5322d',
    padding: '8px 16px',
    borderRadius: '6px',
    textDecoration: 'none',
  },
  menuBtn: {
    display: 'none',
  }
};
