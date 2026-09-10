import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MergePdf from './pages/MergePdf';
import SplitPdf from './pages/SplitPdf';
import RotatePdf from './pages/RotatePdf';
import WatermarkPdf from './pages/WatermarkPdf';
import PageNumbersPdf from './pages/PageNumbersPdf';
import JpgToPdf from './pages/JpgToPdf';
import ProtectPdf from './pages/ProtectPdf';
import UnlockPdf from './pages/UnlockPdf';
import OrganizePdf from './pages/OrganizePdf';
import CompressPdf from './pages/CompressPdf';
import SignPdf from './pages/SignPdf';
import MockTool from './components/MockTool';

export default function App() {
  const secondaryRoutes = [
    { path: "/pdf_to_word", title: "PDF to Word", desc: "Easily convert your PDF files into easy to edit DOC and DOCX documents.", action: "Convert to Word", color: "var(--tool-convert)" },
    { path: "/pdf_to_powerpoint", title: "PDF to PowerPoint", desc: "Turn your PDF files into easy to edit PPT and PPTX slideshows.", action: "Convert to PPT", color: "var(--tool-convert)" },
    { path: "/pdf_to_excel", title: "PDF to Excel", desc: "Pull data straight from PDFs into Excel spreadsheets.", action: "Convert to Excel", color: "var(--tool-convert)" },
    { path: "/word_to_pdf", title: "Word to PDF", desc: "Make DOC and DOCX files easy to read by converting them to PDF.", action: "Convert to PDF", color: "var(--tool-convert)" },
    { path: "/powerpoint_to_pdf", title: "PowerPoint to PDF", desc: "Make PPT and PPTX slideshows easy to view by converting them to PDF.", action: "Convert to PDF", color: "var(--tool-convert)" },
    { path: "/excel_to_pdf", title: "Excel to PDF", desc: "Make EXCEL spreadsheets easy to read by converting them to PDF.", action: "Convert to PDF", color: "var(--tool-convert)" },
    { path: "/edit-pdf", title: "Edit PDF", desc: "Add text, images, shapes or freehand annotations to a PDF document.", action: "Edit PDF", color: "var(--tool-edit)" },
    { path: "/pdf_to_jpg", title: "PDF to JPG", desc: "Convert each PDF page into a JPG or extract all images contained in a PDF.", action: "Convert to JPG", color: "var(--tool-convert)" },
    { path: "/html_to_pdf", title: "HTML to PDF", desc: "Convert webpages in HTML to PDF.", action: "Convert to PDF", color: "var(--tool-convert)" },
    { path: "/pdf_to_pdfa", title: "PDF to PDF/A", desc: "Transform your PDF to PDF/A for archiving.", action: "Convert to PDF/A", color: "var(--tool-convert)" },
    { path: "/repair_pdf", title: "Repair PDF", desc: "Repair a damaged PDF and recover data.", action: "Repair PDF", color: "var(--tool-edit)" },
    { path: "/scan_to_pdf", title: "Scan to PDF", desc: "Capture document scans from your mobile device.", action: "Scan Document", color: "var(--tool-edit)" },
    { path: "/ocr_pdf", title: "OCR PDF", desc: "Convert non-selectable PDF text into a searchable PDF.", action: "OCR PDF", color: "var(--tool-edit)" }
  ];

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/merge_pdf" element={<MergePdf />} />
            <Route path="/split_pdf" element={<SplitPdf />} />
            <Route path="/rotate_pdf" element={<RotatePdf />} />
            <Route path="/watermark" element={<WatermarkPdf />} />
            <Route path="/page_numbers" element={<PageNumbersPdf />} />
            <Route path="/jpg_to_pdf" element={<JpgToPdf />} />
            <Route path="/protect-pdf" element={<ProtectPdf />} />
            <Route path="/unlock_pdf" element={<UnlockPdf />} />
            <Route path="/organize_pdf" element={<OrganizePdf />} />
            <Route path="/compress_pdf" element={<CompressPdf />} />
            <Route path="/sign-pdf" element={<SignPdf />} />
            
            {secondaryRoutes.map(route => (
              <Route 
                key={route.path} 
                path={route.path} 
                element={
                  <MockTool 
                    title={route.title} 
                    description={route.desc} 
                    color={route.color} 
                    actionName={route.action} 
                  />
                } 
              />
            ))}

            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
