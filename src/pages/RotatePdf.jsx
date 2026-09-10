import React, { useState } from 'react';
import { Upload, RotateCw, Download, Check, AlertCircle, RefreshCw, File } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';

export default function RotatePdf() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(90); // 90, 180, 270
  const [targetScope, setTargetScope] = useState('all'); // 'all', 'odd', 'even'
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
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      setPageCount(pdfDoc.getPageCount());
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not read PDF. It may be encrypted or corrupted.');
    }
  };

  const handleRotate = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      pages.forEach((page, idx) => {
        let shouldRotate = false;
        if (targetScope === 'all') shouldRotate = true;
        else if (targetScope === 'odd' && (idx + 1) % 2 !== 0) shouldRotate = true;
        else if (targetScope === 'even' && (idx + 1) % 2 === 0) shouldRotate = true;

        if (shouldRotate) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees((currentRotation + rotationAngle) % 360));
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = `${file.name.replace(/\.pdf$/i, '')}_rotated_${rotationAngle}deg.pdf`;

      setDownloadUrl(url);
      setSuccess(true);

      const a = document.createElement('a');
      a.href = url;
      a.download = outName;
      a.click();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error rotating PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setRotationAngle(90);
    setSuccess(false);
    setDownloadUrl(null);
    setErrorMsg('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Rotate PDF</h1>
        <p style={styles.subtitle}>Rotate your PDF pages permanently clockwise with 90°, 180°, or 270° precision.</p>
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
            <RotateCw size={64} color="var(--tool-edit, #AB6993)" style={{ marginBottom: '20px' }} />
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
              <p style={styles.fileMeta}>{pageCount} pages • {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button style={styles.changeBtn} onClick={reset}>Change File</button>
          </div>

          <div style={styles.optionsCard}>
            <h3 style={styles.optionsTitle}>Rotation Settings</h3>

            <div style={styles.optionGroup}>
              <label style={styles.inputLabel}>Rotation Angle:</label>
              <div style={styles.angleGrid}>
                {[90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    style={{ ...styles.angleBtn, ...(rotationAngle === deg ? styles.angleBtnActive : {}) }}
                    onClick={() => setRotationAngle(deg)}
                  >
                    <RotateCw size={20} style={{ transform: `rotate(${deg}deg)` }} />
                    <span>+{deg}° Clockwise</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.optionGroup}>
              <label style={styles.inputLabel}>Apply to:</label>
              <div style={styles.scopeGrid}>
                {[
                  { id: 'all', label: `All Pages (${pageCount})` },
                  { id: 'odd', label: 'Odd Pages Only (1, 3, 5...)' },
                  { id: 'even', label: 'Even Pages Only (2, 4, 6...)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    style={{ ...styles.scopeBtn, ...(targetScope === s.id ? styles.scopeBtnActive : {}) }}
                    onClick={() => setTargetScope(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button style={styles.processBtn} onClick={handleRotate} disabled={isProcessing}>
              {isProcessing ? 'Rotating Pages...' : `Rotate PDF (+${rotationAngle}°)`}
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <Check size={48} color="#fff" />
          </div>
          <h2 style={styles.successTitle}>PDF successfully rotated!</h2>
          <p style={styles.successSub}>Your rotated document has been downloaded.</p>
          {downloadUrl && (
            <a href={downloadUrl} download={`${file.name.replace(/\.pdf$/i, '')}_rotated.pdf`} style={styles.downloadBtn}>
              <Download size={20} /> Download Rotated PDF
            </a>
          )}
          <button style={styles.resetBtn} onClick={reset}>
            <RefreshCw size={18} /> Rotate Another PDF
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
  editorArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    textAlign: 'left',
  },
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
  optionsTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '20px' },
  optionGroup: { marginBottom: '24px' },
  inputLabel: { fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '10px', display: 'block' },
  angleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  angleBtn: {
    padding: '16px',
    borderRadius: '10px',
    border: '2px solid #e5e7eb',
    background: '#f9fafb',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    color: '#4b5563',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  angleBtnActive: {
    borderColor: 'var(--tool-edit, #AB6993)',
    background: 'rgba(171, 105, 147, 0.08)',
    color: 'var(--tool-edit, #AB6993)',
  },
  scopeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  scopeBtn: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    background: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#4b5563',
    transition: 'all 0.2s',
  },
  scopeBtnActive: {
    borderColor: 'var(--tool-edit, #AB6993)',
    background: 'rgba(171, 105, 147, 0.1)',
    color: 'var(--tool-edit, #AB6993)',
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
    boxShadow: '0 4px 14px rgba(171, 105, 147, 0.4)',
    transition: 'all 0.2s',
    marginTop: '10px',
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
