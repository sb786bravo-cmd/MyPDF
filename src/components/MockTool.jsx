import React, { useState } from 'react';
import { Upload, File } from 'lucide-react';

export default function MockTool({ title, description, color, actionName }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      
      // Simulate downloading a file
      const blob = new Blob(['Simulated converted content'], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `converted_${file.name}.txt`;
      link.click();
    }, 2000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.subtitle}>{description}</p>
      </div>
      
      <div style={{...styles.uploadArea, backgroundColor: color}}>
        {!file ? (
          <div style={styles.uploadContent}>
            <Upload size={64} color={color} style={{marginBottom: '20px'}} />
            <label style={{...styles.uploadBtn, backgroundColor: color}}>
              Select PDF file
              <input type="file" accept=".pdf" onChange={handleFileUpload} style={{display: 'none'}} />
            </label>
            <p style={{marginTop: '16px', color: '#666'}}>or drop PDF here</p>
          </div>
        ) : (
          <div style={styles.previewArea}>
            <div style={styles.fileCard}>
              <File size={48} color={color} />
              <p style={styles.fileName}>{file.name}</p>
            </div>
          </div>
        )}
      </div>

      {file && (
        <div style={styles.actionArea}>
          <button 
            style={{...styles.actionBtn, backgroundColor: color}} 
            onClick={handleProcess}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : actionName}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '100px 24px 40px', // Added extra top padding to prevent navbar overlap
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },
  header: {
    marginBottom: '40px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '20px',
    color: '#666',
  },
  uploadArea: {
    borderRadius: '12px',
    padding: '4px',
  },
  uploadContent: {
    backgroundColor: '#fbfbfb',
    border: '2px dashed rgba(0,0,0,0.1)',
    borderRadius: '8px',
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  uploadBtn: {
    color: 'white',
    padding: '16px 32px',
    borderRadius: '8px',
    fontSize: '20px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'inline-block',
  },
  previewArea: {
    backgroundColor: '#fbfbfb',
    borderRadius: '8px',
    padding: '40px',
    minHeight: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileCard: {
    width: '140px',
    height: '180px',
    backgroundColor: '#fff',
    border: '1px solid #e5e4e7',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  fileName: {
    marginTop: '12px',
    fontSize: '12px',
    color: '#333',
    wordBreak: 'break-all',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  actionArea: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: '20px',
    borderTop: '1px solid #e5e4e7',
    display: 'flex',
    justifyContent: 'center',
    boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
    zIndex: 100,
  },
  actionBtn: {
    color: 'white',
    padding: '16px 48px',
    borderRadius: '8px',
    fontSize: '20px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
  }
};
