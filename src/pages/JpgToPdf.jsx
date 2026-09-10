import React, { useState } from 'react';
import { Upload, FileImage, Download, Check, AlertCircle, RefreshCw, X, Plus } from 'lucide-react';
import { PDFDocument, PageSizes } from 'pdf-lib';

export default function JpgToPdf() {
  const [images, setImages] = useState([]);
  const [orientation, setOrientation] = useState('portrait'); // 'portrait', 'landscape', 'auto'
  const [pageSize, setPageSize] = useState('A4'); // 'A4', 'Letter', 'Fit'
  const [margin, setMargin] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter(f => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      setErrorMsg('Please select valid JPG or PNG images.');
      return;
    }
    setErrorMsg('');

    const newImgs = validImages.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));

    setImages(prev => [...prev, ...newImgs]);
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of images) {
        const arrayBuffer = await item.file.arrayBuffer();
        let embeddedImage;

        if (item.file.type === 'image/png' || item.file.name.toLowerCase().endsWith('.png')) {
          embeddedImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
          embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
        }

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        let pageWidth = PageSizes.A4[0];
        let pageHeight = PageSizes.A4[1];

        if (pageSize === 'Letter') {
          pageWidth = PageSizes.Letter[0];
          pageHeight = PageSizes.Letter[1];
        }

        if (orientation === 'landscape' || (orientation === 'auto' && imgWidth > imgHeight)) {
          // Swap for landscape
          const temp = pageWidth;
          pageWidth = pageHeight;
          pageHeight = temp;
        }

        if (pageSize === 'Fit') {
          pageWidth = imgWidth + margin * 2;
          pageHeight = imgHeight + margin * 2;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Scale image within page margins
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;

        const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight, 1);
        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;

        // Center on page
        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;

        page.drawImage(embeddedImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = `converted_images_${Date.now()}.pdf`;

      setDownloadUrl(url);
      setSuccess(true);

      const a = document.createElement('a');
      a.href = url;
      a.download = outName;
      a.click();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error converting images to PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setImages([]);
    setSuccess(false);
    setDownloadUrl(null);
    setErrorMsg('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>JPG to PDF</h1>
        <p style={styles.subtitle}>Convert JPG & PNG images to a clean PDF in seconds. Adjust orientation and margins.</p>
      </div>

      {errorMsg && (
        <div style={styles.errorBanner}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {images.length === 0 ? (
        <div style={styles.uploadArea}>
          <div style={styles.uploadContent}>
            <FileImage size={64} color="var(--tool-convert, #5F83C6)" style={{ marginBottom: '20px' }} />
            <label style={styles.uploadBtn}>
              Select JPG / PNG images
              <input type="file" multiple accept="image/jpeg,image/png" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
            <p style={{ marginTop: '16px', color: '#666' }}>or drop images here</p>
          </div>
        </div>
      ) : !success ? (
        <div style={styles.editorArea}>
          {/* Thumbnails grid */}
          <div style={styles.thumbGrid}>
            {images.map((item, idx) => (
              <div key={idx} style={styles.thumbCard}>
                <button style={styles.removeBtn} onClick={() => removeImage(idx)} title="Remove image">
                  <X size={16} />
                </button>
                <div style={styles.imgWrapper}>
                  <img src={item.previewUrl} alt={item.name} style={styles.imgPreview} />
                </div>
                <p style={styles.thumbName}>{item.name}</p>
                <span style={styles.thumbIndex}>Page {idx + 1}</span>
              </div>
            ))}

            <label style={styles.addMoreCard}>
              <Plus size={32} color="#6b7280" />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginTop: '6px' }}>Add more</span>
              <input type="file" multiple accept="image/jpeg,image/png" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={styles.optionsCard}>
            <h3 style={styles.optionsTitle}>Page & Layout Options</h3>

            <div style={styles.grid3}>
              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Orientation:</label>
                <div style={styles.btnRow}>
                  {['portrait', 'landscape', 'auto'].map((o) => (
                    <button
                      key={o}
                      style={{ ...styles.choiceBtn, ...(orientation === o ? styles.choiceBtnActive : {}) }}
                      onClick={() => setOrientation(o)}
                    >
                      {o.charAt(0).toUpperCase() + o.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Page Size:</label>
                <div style={styles.btnRow}>
                  {['A4', 'Letter', 'Fit'].map((s) => (
                    <button
                      key={s}
                      style={{ ...styles.choiceBtn, ...(pageSize === s ? styles.choiceBtnActive : {}) }}
                      onClick={() => setPageSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Margin ({margin}px):</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                  style={styles.slider}
                />
              </div>
            </div>

            <button style={styles.processBtn} onClick={handleConvert} disabled={isProcessing}>
              {isProcessing ? 'Converting to PDF...' : `Convert ${images.length} Image${images.length > 1 ? 's' : ''} to PDF`}
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <Check size={48} color="#fff" />
          </div>
          <h2 style={styles.successTitle}>Images Converted to PDF!</h2>
          <p style={styles.successSub}>Your converted PDF has been downloaded.</p>
          {downloadUrl && (
            <a href={downloadUrl} download="images_converted.pdf" style={styles.downloadBtn}>
              <Download size={20} /> Download PDF
            </a>
          )}
          <button style={styles.resetBtn} onClick={reset}>
            <RefreshCw size={18} /> Convert More Images
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '100px 24px 60px',
    maxWidth: '1000px',
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
    backgroundColor: 'var(--tool-convert, #5F83C6)',
    borderRadius: '16px',
    padding: '4px',
    boxShadow: '0 8px 30px rgba(95, 131, 198, 0.2)',
  },
  uploadContent: {
    backgroundColor: '#fff',
    border: '2px dashed rgba(95, 131, 198, 0.4)',
    borderRadius: '12px',
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '380px',
  },
  uploadBtn: {
    backgroundColor: 'var(--tool-convert, #5F83C6)',
    color: 'white',
    padding: '16px 36px',
    borderRadius: '10px',
    fontSize: '20px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(95, 131, 198, 0.4)',
    transition: 'all 0.2s',
  },
  editorArea: { display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' },
  thumbGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '16px',
  },
  thumbCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '10px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  },
  removeBtn: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(239, 68, 68, 0.9)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
  },
  imgWrapper: {
    width: '100%',
    height: '140px',
    borderRadius: '6px',
    overflow: 'hidden',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgPreview: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
  thumbName: {
    fontSize: '11px',
    color: '#374151',
    marginTop: '8px',
    textAlign: 'center',
    maxWidth: '130px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  thumbIndex: { fontSize: '10px', color: '#9ca3af', fontWeight: '600' },
  addMoreCard: {
    height: '190px',
    border: '2px dashed #d1d5db',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    background: '#f9fafb',
  },
  optionsCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
  },
  optionsTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '20px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  inputLabel: { fontSize: '14px', fontWeight: '600', color: '#374151' },
  btnRow: { display: 'flex', gap: '8px' },
  choiceBtn: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    background: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4b5563',
    cursor: 'pointer',
  },
  choiceBtnActive: {
    borderColor: 'var(--tool-convert, #5F83C6)',
    background: 'rgba(95, 131, 198, 0.1)',
    color: 'var(--tool-convert, #5F83C6)',
  },
  slider: { width: '100%', cursor: 'pointer', marginTop: '10px' },
  processBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '10px',
    background: 'var(--tool-convert, #5F83C6)',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 4px 14px rgba(95, 131, 198, 0.4)',
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
    background: 'var(--tool-convert, #5F83C6)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(95, 131, 198, 0.4)',
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
