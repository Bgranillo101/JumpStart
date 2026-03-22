import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Startup, User, AnalysisResult, TechStackRecommendation } from '../types';

interface ReportData {
  startup: Startup;
  members: User[];
  analysis: AnalysisResult | null;
  techStack: TechStackRecommendation[];
  heatmapElement: HTMLElement | null;
}

const PAGE_W = 210; // A4 width mm
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

export async function generateReport(data: ReportData) {
  const { startup, members, analysis, techStack, heatmapElement } = data;
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = MARGIN;

  // ── Helpers ──────────────────────────────────────────────────
  const addText = (text: string, size: number, weight: 'normal' | 'bold' = 'normal', color = '#e4e1dd') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', weight);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, CONTENT_W);
    doc.text(lines, MARGIN, y);
    y += lines.length * (size * 0.45) + 2;
  };

  const checkPage = (needed: number) => {
    if (y + needed > 280) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const drawLine = () => {
    doc.setDrawColor(100, 100, 100);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 4;
  };

  // ── Page background ─────────────────────────────────────────
  const addBg = () => {
    doc.setFillColor(26, 26, 29); // --bg-primary
    doc.rect(0, 0, PAGE_W, 297, 'F');
  };
  addBg();

  // We need to add background to each new page
  const origAddPage = doc.addPage.bind(doc);
  doc.addPage = (...args: Parameters<typeof doc.addPage>) => {
    const result = origAddPage(...args);
    addBg();
    return result;
  };

  // ── Title Page ──────────────────────────────────────────────
  y = 40;
  addText('JumpStart Report', 24, 'bold', '#ffdd00');
  y += 4;
  addText(startup.name, 18, 'bold');
  y += 2;
  addText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 10, 'normal', '#9a9690');
  y += 8;
  drawLine();
  y += 4;

  // Team overview
  addText('Team Overview', 14, 'bold', '#ffdd00');
  y += 2;
  addText(`Members: ${members.length}`, 10);
  if (startup.productDescription) {
    addText(`Product: ${startup.productDescription}`, 10, 'normal', '#9a9690');
  }
  if (startup.businessModel) {
    addText(`Business Model: ${startup.businessModel}`, 10, 'normal', '#9a9690');
  }

  // Readiness score
  if (analysis?.teamReadinessScore != null) {
    y += 6;
    addText('Team Readiness Score', 14, 'bold', '#ffdd00');
    y += 2;
    const score = analysis.teamReadinessScore;
    const scoreColor = score < 50 ? '#ef4444' : score < 75 ? '#eab308' : '#22c55e';
    addText(`${score} / 100`, 20, 'bold', scoreColor);
    const label = score < 50 ? 'Needs Work' : score < 75 ? 'Getting There' : 'Strong';
    addText(label, 10, 'normal', '#9a9690');
  }

  // ── Role Assignments ────────────────────────────────────────
  if (analysis && analysis.roleAssignments.length > 0) {
    checkPage(40);
    y += 6;
    drawLine();
    addText('Role Assignments', 14, 'bold', '#ffdd00');
    y += 2;

    for (const ra of analysis.roleAssignments) {
      checkPage(25);
      const name = ra.user.name ?? ra.user.username;
      addText(`${name} \u2192 ${ra.assignedRole} (${ra.confidence}% confidence)`, 10, 'bold');
      addText(ra.reasoning, 9, 'normal', '#9a9690');
      y += 2;
    }
  }

  // ── Role Gaps ───────────────────────────────────────────────
  if (analysis && analysis.roleGaps.length > 0) {
    checkPage(30);
    y += 4;
    drawLine();
    addText('Role Gaps', 14, 'bold', '#ffdd00');
    y += 2;

    for (const gap of analysis.roleGaps) {
      checkPage(20);
      addText(`${gap.roleName} \u2014 ${gap.importance.replace('_', ' ')}`, 10, 'bold');
      addText(gap.whyNeeded, 9, 'normal', '#9a9690');
      y += 2;
    }
  }

  // ── Skill Heatmap (captured as image) ───────────────────────
  if (heatmapElement) {
    checkPage(100);
    y += 4;
    drawLine();
    addText('Skill Heatmap', 14, 'bold', '#ffdd00');
    y += 4;
    try {
      const canvas = await html2canvas(heatmapElement, {
        backgroundColor: '#1a1a1d',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      const imgW = CONTENT_W;
      const imgH = (canvas.height / canvas.width) * imgW;
      if (y + imgH > 280) {
        doc.addPage();
        y = MARGIN;
      }
      doc.addImage(imgData, 'PNG', MARGIN, y, imgW, imgH);
      y += imgH + 4;
    } catch {
      addText('(Heatmap could not be captured)', 9, 'normal', '#9a9690');
    }
  }

  // ── Tech Stack ──────────────────────────────────────────────
  if (techStack.length > 0) {
    checkPage(30);
    y += 4;
    drawLine();
    addText('Tech Stack Recommendations', 14, 'bold', '#ffdd00');
    y += 2;

    for (const rec of techStack) {
      checkPage(18);
      const priorityLabel = rec.priority === 1 ? 'Must-Have' : rec.priority === 2 ? 'Recommended' : 'Nice-to-Have';
      addText(`${rec.name} [${rec.category}] \u2014 ${priorityLabel}`, 10, 'bold');
      addText(rec.reasoning, 9, 'normal', '#9a9690');
      y += 2;
    }
  }

  // ── Save ────────────────────────────────────────────────────
  doc.save(`${startup.name.replace(/\s+/g, '-')}-JumpStart-Report.pdf`);
}
