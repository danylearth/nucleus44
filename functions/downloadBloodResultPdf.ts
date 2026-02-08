import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: resultId } = await req.json();

        if (!resultId) {
            return Response.json({ error: 'Missing result ID' }, { status: 400 });
        }

        // Fetch lab result
        const labResult = await base44.entities.LabResult.get(resultId);
        
        // Check authorization
        if (user.role !== 'admin' && labResult.user_id !== user.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Fetch parameters
        const parameters = await base44.entities.LabResultParameter.filter({
            lab_result_id: resultId
        });

        // Helper functions
        const getDisplayRange = (name, originalRange) => {
            const customRanges = {
                'ALT': '7 - 50',
                'LDL': '0.0 - 3.0',
                'eGFR': '60',
                'Progesterone': '0.0 - 0.474',
                'PSA - Non Symptomatic': '<2.0',
                'HDL Cholesterol Ratio': '>1.1'
            };
            return customRanges[name] || originalRange;
        };

        const calculateStatus = (value, range, paramName) => {
            const numValue = parseFloat(value);

            if (paramName === 'ALT') {
                if (numValue < 7) return 'low';
                if (numValue >= 7 && numValue <= 50) return 'normal';
                if (numValue > 50 && numValue <= 60) return 'high';
                if (numValue > 60) return 'critical';
            }

            if (paramName === 'LDL') {
                if (numValue <= 3.0) return 'normal';
                if (numValue > 3.0 && numValue <= 4.9) return 'high';
                if (numValue >= 5.0) return 'critical';
            }

            if (paramName === 'eGFR') {
                if (numValue >= 60) return 'normal';
                if (numValue < 60) return 'low';
            }

            if (paramName === 'Progesterone') {
                if (numValue <= 0.474) return 'normal';
                if (numValue > 0.474 && numValue <= 1.0) return 'high';
                if (numValue > 1.0) return 'critical';
            }

            if (paramName === 'PSA - Non Symptomatic') {
                if (numValue < 2.0) return 'normal';
                if (numValue >= 2.0) return 'high';
            }

            if (paramName === 'HDL Cholesterol Ratio') {
                if (numValue > 1.1) return 'normal';
                if (numValue <= 1.1) return 'low';
            }

            const rangeStr = (range || '').trim();
            if (isNaN(numValue) || !rangeStr) return 'normal';

            if (rangeStr.startsWith('<')) {
                const max = parseFloat(rangeStr.replace('<', '').trim());
                if (!isNaN(max)) {
                    if (numValue > max * 2) return 'critical';
                    if (numValue > max) return 'high';
                }
                return 'normal';
            }

            if (rangeStr.startsWith('>')) {
                const min = parseFloat(rangeStr.replace('>', '').trim());
                if (!isNaN(min)) {
                    if (numValue < min / 2) return 'critical';
                    if (numValue < min) return 'low';
                }
                return 'normal';
            }

            const [min, max] = rangeStr.split('-').map(s => parseFloat(s.trim()));
            if (isNaN(min) || isNaN(max)) return 'normal';

            const rangeSize = max - min;
            if (numValue < min - rangeSize) return 'critical';
            if (numValue > max + rangeSize) return 'critical';
            if (numValue < min) return 'low';
            if (numValue > max) return 'high';
            return 'normal';
        };

        const getProgressBarWidth = (value, range) => {
            const rangeStr = range.trim();
            const numValue = parseFloat(value);

            if (rangeStr.startsWith('<')) {
                const max = parseFloat(rangeStr.replace('<', '').trim());
                if (isNaN(max) || isNaN(numValue)) return 50;
                if (numValue <= max) {
                    const percentage = 25 + (numValue / max) * 50;
                    return Math.max(0, Math.min(100, percentage));
                } else {
                    const excess = (numValue - max) / max;
                    const percentage = 75 + excess * 25;
                    return Math.max(0, Math.min(100, percentage));
                }
            }

            if (rangeStr.startsWith('>')) {
                const min = parseFloat(rangeStr.replace('>', '').trim());
                if (isNaN(min) || isNaN(numValue)) return 50;
                if (numValue >= min) {
                    const percentage = 25 + ((numValue - min) / min) * 50;
                    return Math.max(0, Math.min(100, percentage));
                } else {
                    const percentage = (numValue / min) * 25;
                    return Math.max(0, Math.min(100, percentage));
                }
            }

            const [min, max] = rangeStr.split('-').map(s => parseFloat(s.trim()));
            if (isNaN(min) || isNaN(max) || isNaN(numValue)) return 50;

            const rangeSize = max - min;
            
            if (numValue < min) {
                const deficit = (min - numValue) / rangeSize;
                const percentage = 25 - deficit * 25;
                return Math.max(0, Math.min(100, percentage));
            } else if (numValue > max) {
                const excess = (numValue - max) / rangeSize;
                const percentage = 75 + excess * 25;
                return Math.max(0, Math.min(100, percentage));
            } else {
                const percentage = 25 + ((numValue - min) / rangeSize) * 50;
                return Math.max(0, Math.min(100, percentage));
            }
        };

        // Create PDF
        const doc = new jsPDF();
        let y = 20;

        // Header - Red gradient background effect
        doc.setFillColor(239, 68, 68);
        doc.rect(0, 0, 210, 50, 'F');
        
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text(labResult.test_name, 105, 25, { align: 'center' });
        
        doc.setFontSize(11);
        doc.text(new Date(labResult.test_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 105, 35, { align: 'center' });
        
        y = 60;

        // Overall Status Card
        const statusColors = {
            normal: { fill: [240, 253, 244], text: [22, 163, 74], border: [187, 247, 208] },
            high: { fill: [254, 252, 232], text: [217, 119, 6], border: [254, 240, 138] },
            low: { fill: [254, 252, 232], text: [217, 119, 6], border: [254, 240, 138] },
            critical: { fill: [254, 242, 242], text: [220, 38, 38], border: [254, 202, 202] }
        };
        const statusStyle = statusColors[labResult.status] || statusColors.normal;
        
        doc.setFillColor(...statusStyle.fill);
        doc.setDrawColor(...statusStyle.border);
        doc.roundedRect(15, y, 180, 28, 3, 3, 'FD');
        
        doc.setFontSize(14);
        doc.setTextColor(...statusStyle.text);
        const statusTitle = labResult.status === 'normal' ? 'All Results Normal' :
            labResult.status === 'high' || labResult.status === 'low' ? 'Review Needed' :
            'Immediate Attention Required';
        doc.text(statusTitle, 20, y + 10);
        
        if (labResult.results_summary) {
            doc.setFontSize(9);
            doc.setTextColor(75, 85, 99);
            const lines = doc.splitTextToSize(labResult.results_summary, 170);
            doc.text(lines, 20, y + 17);
        }
        
        y += 35;

        // Test Information Card
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(229, 231, 235);
        doc.roundedRect(15, y, 180, 30, 3, 3, 'FD');
        
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text('Ordered by', 20, y + 8);
        doc.setFontSize(10);
        doc.setTextColor(17, 24, 39);
        doc.text(labResult.ordered_by || 'Dr. Sarah Johnson', 20, y + 13);
        
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text('Laboratory', 20, y + 20);
        doc.setFontSize(10);
        doc.setTextColor(17, 24, 39);
        doc.text(labResult.laboratory || 'LabCorp', 20, y + 25);
        
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text('Test Date', 120, y + 8);
        doc.setFontSize(10);
        doc.setTextColor(17, 24, 39);
        doc.text(new Date(labResult.test_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 120, y + 13);
        
        y += 38;

        // Parameters Header
        doc.setFontSize(13);
        doc.setTextColor(17, 24, 39);
        doc.text(`Test Parameters (${parameters.length})`, 15, y);
        
        doc.setFontSize(9);
        doc.setFillColor(239, 246, 255);
        doc.setTextColor(29, 78, 216);
        doc.roundedRect(130, y - 4, 65, 6, 2, 2, 'F');
        doc.text('🚦 Traffic Light System', 133, y);
        
        y += 10;

        // Parameters with traffic light system
        for (const param of parameters) {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            const calculatedStatus = calculateStatus(param.value, param.reference_range, param.name);
            const paramStatusStyle = statusColors[calculatedStatus] || statusColors.normal;
            const progressWidth = getProgressBarWidth(param.value, param.reference_range);

            // Parameter Card
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(229, 231, 235);
            doc.roundedRect(15, y, 180, 35, 3, 3, 'FD');

            // Traffic light indicator
            const trafficColors = {
                normal: [34, 197, 94],
                high: [251, 191, 36],
                low: [251, 191, 36],
                critical: [239, 68, 68]
            };
            doc.setFillColor(...(trafficColors[calculatedStatus] || [156, 163, 175]));
            doc.circle(22, y + 7, 2, 'F');

            // Parameter name
            doc.setFontSize(11);
            doc.setTextColor(17, 24, 39);
            doc.text(param.name, 28, y + 8);

            // Status badge
            doc.setFillColor(...paramStatusStyle.fill);
            doc.setDrawColor(...paramStatusStyle.border);
            doc.roundedRect(155, y + 3, 35, 7, 2, 2, 'FD');
            doc.setFontSize(8);
            doc.setTextColor(...paramStatusStyle.text);
            const statusLabel = calculatedStatus === 'normal' ? '✓ Normal' :
                calculatedStatus === 'high' ? '↑ High' :
                calculatedStatus === 'low' ? '↓ Low' : '⚠ Critical';
            doc.text(statusLabel, 158, y + 7.5);

            // Value
            doc.setFontSize(16);
            doc.setTextColor(...paramStatusStyle.text);
            doc.text(`${param.value}`, 28, y + 18);
            
            doc.setFontSize(9);
            doc.setTextColor(107, 114, 128);
            doc.text(param.unit, 28 + doc.getTextWidth(param.value.toString()) + 2, y + 18);

            // Traffic light progress bar
            const barY = y + 23;
            const barX = 28;
            const barWidth = 160;
            const barHeight = 4;

            // Draw traffic light zones
            doc.setFillColor(252, 165, 165); // Red
            doc.rect(barX, barY, barWidth * 0.125, barHeight, 'F');
            doc.setFillColor(254, 240, 138); // Yellow
            doc.rect(barX + barWidth * 0.125, barY, barWidth * 0.125, barHeight, 'F');
            doc.setFillColor(187, 247, 208); // Green
            doc.rect(barX + barWidth * 0.25, barY, barWidth * 0.5, barHeight, 'F');
            doc.setFillColor(254, 240, 138); // Yellow
            doc.rect(barX + barWidth * 0.75, barY, barWidth * 0.125, barHeight, 'F');
            doc.setFillColor(252, 165, 165); // Red
            doc.rect(barX + barWidth * 0.875, barY, barWidth * 0.125, barHeight, 'F');

            // Draw green zone markers
            doc.setDrawColor(22, 163, 74);
            doc.setLineWidth(0.5);
            doc.line(barX + barWidth * 0.25, barY - 1, barX + barWidth * 0.25, barY + barHeight + 1);
            doc.line(barX + barWidth * 0.75, barY - 1, barX + barWidth * 0.75, barY + barHeight + 1);

            // Value indicator
            const indicatorX = barX + (barWidth * progressWidth / 100);
            doc.setFillColor(17, 24, 39);
            doc.circle(indicatorX, barY + barHeight / 2, 1.5, 'F');

            // Reference range label
            doc.setFontSize(7);
            doc.setTextColor(107, 114, 128);
            doc.text('Expected Range', barX, barY + barHeight + 4);
            doc.setTextColor(17, 24, 39);
            doc.text(getDisplayRange(param.name, param.reference_range), barX + barWidth - doc.getTextWidth(getDisplayRange(param.name, param.reference_range)), barY + barHeight + 4);

            y += 40;
        }

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(156, 163, 175);
            doc.text(`Page ${i} of ${pageCount}`, 20, 285);
            doc.text(`Generated on ${new Date().toLocaleDateString('en-US')}`, 150, 285);
        }

        const pdfBytes = doc.output('arraybuffer');

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="blood-test-${labResult.test_name.replace(/\s+/g, '-')}-${labResult.test_date}.pdf"`
            }
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});