export class RouterTemplateCalculator {
    constructor(params) {
        this.params = {
            routerBitDiameter: 8,
            copyRingDiameter: 17,
            materialThickness: 5,
            runnerWidth: 40,
            runnerCount: 3,
            targetSlotWidth: 20,
            slotCount: 1,
            slotPitch: 100,
            padding: 20,
            sidePlateHeight: 60,
            cutoutDepth: 40, // Default 40mm
            ...params
        };
    }

    calculate() {
        const {
            routerBitDiameter,
            copyRingDiameter,
            runnerWidth,
            runnerCount,
            targetSlotWidth,
            slotCount,
            slotPitch,
            padding,
            materialThickness,
            sidePlateHeight
        } = this.params;

        const offset = (copyRingDiameter - routerBitDiameter);
        const radiusDiff = offset / 2;

        const targetSlotLength = runnerWidth * runnerCount;

        const templateSlotLength = targetSlotLength + offset;
        const templateSlotWidth = targetSlotWidth + offset;

        const totalSlotsLengthX = (slotCount - 1) * slotPitch;

        const firstSlotX = Math.max(padding, slotPitch + padding);
        const lastSlotX = firstSlotX + totalSlotsLengthX;
        // Make symmetric: Right margin = Left margin (firstSlotX)
        const topPlateWidthX = lastSlotX + firstSlotX;

        // Top Plate Height Y
        // Slot starts at `materialThickness - radiusDiff` (relative to Inner Face).
        // Inner Face is at `Y = topPlateHeightY - materialThickness`?
        // No, let's redefine Y=0 as the "Joint Edge" (where Side Plate attaches).
        // So Side Plate is at Y=0.
        // Inner Face is at Y = materialThickness.
        const edgeMargin = materialThickness;
        const slotStartY = edgeMargin + materialThickness - radiusDiff;
        const slotEndY = slotStartY + templateSlotLength;
        // Top Plate extends to Y = SlotEnd + Padding.

        // Wait, if Y=0 is Joint Edge.
        // Top Plate goes from Y=0 to Y=Height.
        // Slot starts near Y=0.

        // Balance Top/Bottom Padding
        // We want Dist(TopEdge, SlotStart) = Dist(BottomEdge, SlotEnd) = padding.
        // Dist(TopEdge, SlotStart) = topOverhang + slotStartY.
        // So topOverhang = padding - slotStartY.
        const topOverhang = Math.max(0, padding - slotStartY);

        const topPlateHeightY = topOverhang + slotStartY + templateSlotLength + padding;

        return {
            templateSlotLength,
            templateSlotWidth,
            topPlateWidthX,
            topPlateHeightY,
            sidePlateHeightZ: sidePlateHeight,
            offset,
            radiusDiff,
            firstSlotX,
            slotStartY,
            topOverhang
        };
    }

    generateSVG() {
        const dims = this.calculate();
        const {
            templateSlotLength,
            templateSlotWidth,
            topPlateWidthX,
            topPlateHeightY,
            sidePlateHeightZ,
            radiusDiff,
            firstSlotX,
            slotStartY,
            topOverhang
        } = dims;

        const {
            slotCount,
            slotPitch,
            materialThickness,
            padding
        } = this.params;



        const gap = 10;
        // Total Height: 2 Top Plates + Gap + Side Plate (Height + Fingers)
        // Side Plate Fingers stick up by 2*materialThickness.
        // So Side Plate bounding box height is sidePlateHeightZ + 2*materialThickness.
        const totalHeight = topPlateHeightY * 2 + gap * 2 + sidePlateHeightZ + materialThickness * 2;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 ${topPlateWidthX + 20} ${totalHeight + 20}" width="${topPlateWidthX}mm" height="${totalHeight}mm">`;
        svg += `<style>
            .cut { fill: none; stroke: black; stroke-width: 0.1mm; vector-effect: non-scaling-stroke; }
            .ref { fill: none; stroke: red; stroke-width: 0.1mm; vector-effect: non-scaling-stroke; stroke-dasharray: 2,2; }
            .engrave { fill: none; stroke: blue; stroke-width: 0.1mm; vector-effect: non-scaling-stroke; }
            .text { font-family: sans-serif; font-size: 5px; fill: red; }
        </style>`;

        const drawTopPlate = (offsetY, label) => {
            // Outline (Rectangle)
            let path = `M 0,${offsetY} L ${topPlateWidthX},${offsetY} L ${topPlateWidthX},${offsetY + topPlateHeightY} L 0,${offsetY + topPlateHeightY} Z`;
            svg += `<path class="cut" d="${path}" />`;

            // Mortise Holes
            // Row of holes at Y = offsetY + topOverhang + edgeMargin
            const edgeMargin = materialThickness;
            const holeY = offsetY + topOverhang + edgeMargin;

            const fingerCount = Math.floor(topPlateWidthX / 20);
            const fingerSize = topPlateWidthX / (fingerCount * 2 + 1);

            for (let i = 0; i < fingerCount * 2 + 1; i++) {
                if (i % 2 !== 0) {
                    const x = topPlateWidthX - (i + 1) * fingerSize;
                    svg += `<rect class="cut" x="${x}" y="${holeY}" width="${fingerSize}" height="${materialThickness}" />`;
                }
            }

            // Slots
            for (let i = 0; i < slotCount; i++) {
                const cx = firstSlotX + i * slotPitch;
                // Slot Y relative to Top Edge: topOverhang + slotStartY + Length/2
                const cy = offsetY + topOverhang + slotStartY + templateSlotLength / 2;

                const x = cx - templateSlotWidth / 2;
                const y = cy - templateSlotLength / 2;
                const r = this.params.copyRingDiameter / 2;

                svg += `<rect class="cut" x="${x}" y="${y}" width="${templateSlotWidth}" height="${templateSlotLength}" rx="${r}" />`;
                svg += `<line class="ref" x1="${cx}" y1="${offsetY + topOverhang + slotStartY}" x2="${cx}" y2="${offsetY + topOverhang + slotStartY + templateSlotLength}" />`;
            }

            // Index Holes
            const indexX = firstSlotX - slotPitch;
            const indexY = offsetY + topOverhang + slotStartY + templateSlotLength / 2;
            const indexHoleR = 2.5;

            // Hole 1 (Center)
            svg += `<circle class="engrave" cx="${indexX}" cy="${indexY - 25}" r="${indexHoleR}" />`;
            // Hole 2 (Offset by 25mm)
            svg += `<circle class="engrave" cx="${indexX}" cy="${indexY + 25}" r="${indexHoleR}" />`;

            svg += `<text x="${indexX}" y="${indexY - 4}" class="text" text-anchor="middle">Index</text>`;

            svg += `<text x="5" y="${offsetY + topPlateHeightY - 5}" class="text">${label}</text>`;
        };

        drawTopPlate(0, "Top Plate 1");
        drawTopPlate(topPlateHeightY + gap, "Top Plate 2");

        // --- Side Plate ---
        const sideOffsetY = (topPlateHeightY + gap) * 2;



        const fingerHeight = materialThickness * 2;
        const shoulderY = sideOffsetY + fingerHeight;
        const bottomY = shoulderY + sidePlateHeightZ;

        let sidePath = `M 0,${shoulderY}`; // Start at shoulder left

        const fingerCount = Math.floor(topPlateWidthX / 20);
        const fingerSize = topPlateWidthX / (fingerCount * 2 + 1);

        // Top Edge (Fingers)
        // Iterate Left to Right (j=0..N)
        // Matches Top Plate Right-to-Left logic.
        // Top Plate: Odd i (from Right) = Hole.
        // Side Plate: Odd j (from Left) = Finger.
        // (Assuming symmetry/count logic holds as before).

        for (let j = 0; j < fingerCount * 2 + 1; j++) {
            const xStart = j * fingerSize;
            const xEnd = (j + 1) * fingerSize;

            let segmentY;

            // Base Pattern
            if (j % 2 === 0) {
                // Even -> Shoulder (Low)
                segmentY = shoulderY;
            } else {
                // Odd -> Finger (High)
                segmentY = sideOffsetY;
            }


            // Check Cutout
            let isCutout = false;
            for (let k = 0; k < slotCount; k++) {
                const cx = firstSlotX + k * slotPitch;
                const slotHalfWidth = templateSlotWidth / 2;
                if (xStart < cx + slotHalfWidth && xEnd > cx - slotHalfWidth) {
                    isCutout = true;
                    break;
                }
            }

            const cutoutDepth = this.params.cutoutDepth;
            const cutoutY = shoulderY + cutoutDepth;

            if (isCutout) {
                segmentY = cutoutY;
            }

            // Draw
            sidePath += ` L ${xStart},${segmentY}`;
            sidePath += ` L ${xEnd},${segmentY}`;
        }

        sidePath += ` L ${topPlateWidthX},${bottomY}`;
        sidePath += ` L 0,${bottomY}`;
        sidePath += ` Z`;

        svg += `<path class="cut" d="${sidePath}" />`;
        svg += `<text x="5" y="${bottomY - 5}" class="text">Side Plate</text>`;

        svg += `</svg>`;

        return svg;
    }
}
