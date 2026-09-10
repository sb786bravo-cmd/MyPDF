import React, { useState } from 'react';
import { Upload, Key, Download, Check, AlertCircle, RefreshCw, File, Unlock } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function UnlockPdf() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.type !== 'application/pdf' && !selected.name.endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }
    setErrorMsg('');
    setFile(selected);
    setSuccess(false);

    try {
      const arrayBuffer = await selected.arrayBuffer();
      // Try loading with ignoreEncryption to get info
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      setPageCount(pdfDoc.getPageCount());
    } catch (err) {
      console.log('File requires password or is encrypted:', err);
    }
  };

  const handleUnlock = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Load and save without password/restrictions
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });

      const newPdf = await PDFDocument.create();
      const pageIndices = pdfDoc.getPageIndices();
      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach(p => newPdf.addPage(p));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = `${file.name.replace(/\.pdf$/i, '')}_unlocked.pdf`;

      setDownloadUrl(url);
      setSuccess(true);

      const a = document.createElement('a');
      a.href = url;
      a.download = outName;
      a.click();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to unlock PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setPassword('');
    setSuccess(false);
    setDownloadUrl(null);
    setErrorMsg('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Unlock PDF file</h1>
        <p style={styles.subtitle}>Remove PDF password security and permissions so you can use and edit your document freely.</p>
      </div>

      {errorMsg && (
        <div style={styles.errorBanner}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {!file ? (
        <div style={styles.uploadArea}>
          <div style={styles.uploadContent}>
            <Key size={64} color="var(--tool-edit, #AB6993)" style={{ marginBottom: '20px' }} />
            <label style={styles.uploadBtn}>
              Select PDF file
              <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
            <p style={{ marginTop: '16px', color: '#666' }}>or drop PDF here</p>
          </div>
        </div>
      ) : !success ? (
        <div style={styles.editorArea}>
          <div style={styles.fileInfoCard}>
            <div style={styles.fileIconBox}>
              <File size={40} color="var(--tool-edit, #AB6993)" />
            </div>
            <div style={styles.fileDetails}>
              <h4 style={styles.fileName}>{file.name}</h4>
              <p style={styles.fileMeta}>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button style={styles.changeBtn} onClick={reset}>Change File</button>
          </div>

          <div style={styles.optionsCard}>
            <h3 style={styles.optionsTitle}>Decrypt Document</h3>
            <p style={styles.optionsDesc}>Click below to strip security restrictions and export a completely unlocked PDF.</p>

            <div style={styles.formGroup}>
              <label style={styles.inputLabel}>Current PDF Password (if required to open):</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank if standard permission restrictions..."
                style={styles.textInput}
              />
            </div>

            <button style={styles.processBtn} onClick={handleUnlock} disabled={isProcessing}>
              <Unlock size={20} style={{ marginRight: '8px' }} />
              {isProcessing ? 'Removing Security...' : 'Unlock PDF Document'}
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <Check size={48} color="#fff" />
          </div>
          <h2 style={styles.successTitle}>PDF Unlocked Successfully!</h2>
          <p style={styles.successSub}>Your document is free of security and restrictions.</p>
          {downloadUrl && (
            <a href={downloadUrl} download={`${file.name.replace(/\.pdf$/i, '')}_unlocked.pdf`} style={styles.downloadBtn}>
              <Download size={20} /> Download Unlocked PDF
            </a>
          )}
          <button style={styles.resetBtn} onClick={reset}>
            <RefreshCw size={18} /> Unlock Another PDF
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '100px 24px 60px',
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'center',
  },
  header: { marginBottom: '32px' },
  title: { fontSize: '36px', fontWeight: '800', color: '#1f2937', marginBottom: '12px' },
  subtitle: { fontSize: '18px', color: '#6b7280' },
  errorBanner: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '12px 20px',
    borderRadius: '8px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'center',
    fontSize: '14px',
  },
  uploadArea: {
    backgroundColor: 'var(--tool-edit, #AB6993)',
    borderRadius: '16px',
    padding: '4px',
    boxShadow: '0 8px 30px rgba(171, 105, 147, 0.2)',
  },
  uploadContent: {
    backgroundColor: '#fff',
    border: '2px dashed rgba(171, 105, 147, 0.4)',
    borderRadius: '12px',
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '380px',
  },
  uploadBtn: {
    backgroundColor: 'var(--tool-edit, #AB6993)',
    color: 'white',
    padding: '16px 36px',
    borderRadius: '10px',
    fontSize: '20px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(171, 105, 147, 0.4)',
    transition: 'all 0.2s',
  },
  editorArea: { display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' },
  fileInfoCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  fileIconBox: {
    width: '60px',
    height: '60px',
    borderRadius: '10px',
    background: 'rgba(171, 105, 147, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileDetails: { flex: 1 },
  fileName: { fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' },
  fileMeta: { fontSize: '13px', color: '#6b7280' },
  changeBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#374151',
  },
  optionsCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
  },
  optionsTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' },
  optionsDesc: { fontSize: '14px', color: '#6b7280', marginBottom: '20px' },
  formGroup: { marginBottom: '20px' },
  inputLabel: { fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' },
  textInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '15px',
    outline: 'none',
  },
  processBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '10px',
    background: 'var(--tool-edit, #AB6993)',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(171, 105, 147, 0.4)',
    transition: 'all 0.2s',
  },
  successCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '48px 24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
  },
  successTitle: { fontSize: '26px', fontWeight: '800', color: '#111827' },
  successSub: { fontSize: '16px', color: '#6b7280' },
  downloadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 32px',
    borderRadius: '10px',
    background: 'var(--tool-edit, #AB6993)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(171, 105, 147, 0.4)',
  },
  resetBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '8px',
    background: 'transparent',
    border: '1px solid #d1d5db',
    color: '#4b5563',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
};
