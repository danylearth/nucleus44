import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const resultId = url.searchParams.get('id');

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

        // Create PDF
        const doc = new jsPDF();
        let y = 20;

        // Header
        doc.setFontSize(20);
        doc.setTextColor(17, 24, 39);
        doc.text('Blood Test Report', 20, y);
        y += 15;

        // Patient Info
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(`Patient: ${labResult.user_name || 'N/A'}`, 20, y);
        y += 6;
        doc.text(`Test Date: ${new Date(labResult.test_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, y);
        y += 6;
        doc.text(`Laboratory: ${labResult.laboratory || 'N/A'}`, 20, y);
        y += 6;
        doc.text(`Ordered by: ${labResult.ordered_by || 'N/A'}`, 20, y);
        y += 15;

        // Overall Status
        doc.setFontSize(12);
        doc.setTextColor(17, 24, 39);
        doc.text('Overall Status', 20, y);
        y += 8;
        
        doc.setFontSize(10);
        const statusColors = {
            normal: [34, 197, 94],
            high: [249, 115, 22],
            low: [59, 130, 246],
            critical: [239, 68, 68]
        };
        const statusColor = statusColors[labResult.status] || [107, 114, 128];
        doc.setTextColor(...statusColor);
        doc.text(labResult.status.charAt(0).toUpperCase() + labResult.status.slice(1), 20, y);
        y += 10;

        if (labResult.results_summary) {
            doc.setFontSize(9);
            doc.setTextColor(107, 114, 128);
            const lines = doc.splitTextToSize(labResult.results_summary, 170);
            doc.text(lines, 20, y);
            y += lines.length * 5 + 10;
        }

        // Test Parameters
        doc.setFontSize(12);
        doc.setTextColor(17, 24, 39);
        doc.text('Test Parameters', 20, y);
        y += 10;

        // Sort parameters: abnormal first, then by name
        const sortedParams = [...parameters].sort((a, b) => {
            if (a.status !== 'normal' && b.status === 'normal') return -1;
            if (a.status === 'normal' && b.status !== 'normal') return 1;
            return a.name.localeCompare(b.name);
        });

        for (const param of sortedParams) {
            // Check if we need a new page
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            // Parameter name
            doc.setFontSize(10);
            doc.setTextColor(17, 24, 39);
            doc.text(param.name, 20, y);
            
            // Status badge
            const paramStatusColor = statusColors[param.status] || [107, 114, 128];
            doc.setFillColor(...paramStatusColor);
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            const statusText = param.status.charAt(0).toUpperCase() + param.status.slice(1);
            const statusWidth = doc.getTextWidth(statusText) + 4;
            doc.roundedRect(160, y - 3, statusWidth, 5, 1, 1, 'F');
            doc.text(statusText, 162, y);
            y += 7;

            // Value and range
            doc.setFontSize(9);
            doc.setTextColor(17, 24, 39);
            doc.text(`Value: ${param.value} ${param.unit}`, 25, y);
            y += 5;
            doc.setTextColor(107, 114, 128);
            doc.text(`Reference Range: ${param.reference_range}`, 25, y);
            y += 8;

            // Description if available
            if (param.description) {
                doc.setFontSize(8);
                doc.setTextColor(107, 114, 128);
                const descLines = doc.splitTextToSize(param.description, 165);
                doc.text(descLines, 25, y);
                y += descLines.length * 4 + 5;
            }

            // Separator line
            doc.setDrawColor(229, 231, 235);
            doc.line(20, y, 190, y);
            y += 8;
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