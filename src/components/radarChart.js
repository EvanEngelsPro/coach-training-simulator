/**
 * Radar Chart Component
 * Canvas-based spider/radar chart — no external dependencies.
 */

/**
 * Renders a radar chart on the given canvas element.
 * @param {HTMLCanvasElement} canvas
 * @param {Array<{label: string, value: number, maxValue: number}>} data
 * @param {object} options
 */
export function renderRadarChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const {
        size = 320,
        padding = 60,
        gridLevels = 5,
        gridColor = 'rgba(255, 255, 255, 0.06)',
        labelColor = '#9ca3af',
        labelFont = '11px Inter, sans-serif',
        fillColor = 'rgba(99, 102, 241, 0.15)',
        strokeColor = '#6366f1',
        pointColor = '#8b5cf6',
        pointRadius = 4,
        lineWidth = 2,
    } = options;

    // Setup high-DPI canvas
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = (size - padding * 2) / 2;
    const numAxes = data.length;
    const angleStep = (Math.PI * 2) / numAxes;
    const startAngle = -Math.PI / 2; // Start from top

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Draw grid circles
    for (let lvl = 1; lvl <= gridLevels; lvl++) {
        const r = (radius * lvl) / gridLevels;
        ctx.beginPath();
        for (let i = 0; i <= numAxes; i++) {
            const angle = startAngle + angleStep * i;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Draw axis lines
    for (let i = 0; i < numAxes; i++) {
        const angle = startAngle + angleStep * i;
        const xEnd = cx + Math.cos(angle) * radius;
        const yEnd = cy + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(xEnd, yEnd);
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Draw data polygon
    ctx.beginPath();
    const points = [];
    for (let i = 0; i < numAxes; i++) {
        const angle = startAngle + angleStep * i;
        const val = data[i].value / data[i].maxValue;
        const r = radius * Math.max(0, Math.min(1, val));
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        points.push({ x, y });
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Fill
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Stroke
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Draw points
    points.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = pointColor;
        ctx.fill();
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw labels
    ctx.font = labelFont;
    ctx.fillStyle = labelColor;

    for (let i = 0; i < numAxes; i++) {
        const angle = startAngle + angleStep * i;
        const labelRadius = radius + 22;
        let x = cx + Math.cos(angle) * labelRadius;
        let y = cy + Math.sin(angle) * labelRadius;

        // Truncate long labels
        let label = data[i].label;
        if (label.length > 16) label = label.substring(0, 14) + '…';

        const metrics = ctx.measureText(label);
        const textWidth = metrics.width;

        // Align text based on position
        if (Math.abs(Math.cos(angle)) < 0.1) {
            ctx.textAlign = 'center';
        } else if (Math.cos(angle) > 0) {
            ctx.textAlign = 'left';
        } else {
            ctx.textAlign = 'right';
        }

        if (Math.sin(angle) < -0.5) {
            y -= 4;
        } else if (Math.sin(angle) > 0.5) {
            y += 12;
        } else {
            y += 4;
        }

        ctx.fillText(label, x, y);

        // Draw value
        const valText = data[i].value > 0 ? data[i].value.toFixed(1) : '—';
        ctx.save();
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillStyle = data[i].value > 0 ? '#a78bfa' : '#6b7280';
        const valY = Math.sin(angle) < -0.5 ? y - 14 : y + 14;
        ctx.fillText(valText, x, valY);
        ctx.restore();
    }
}
