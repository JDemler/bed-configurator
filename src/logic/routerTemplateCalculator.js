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
            sidePlateHeight: 60, // New param
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
            .cut { fill: none; stroke: black; stroke-width: 0.1; vector-effect: non-scaling-stroke; }
            .ref { fill: none; stroke: red; stroke-width: 0.1; vector-effect: non-scaling-stroke; stroke-dasharray: 2,2; }
            .engrave { fill: none; stroke: blue; stroke-width: 0.1; vector-effect: non-scaling-stroke; }
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

            // Index Hole
            const indexX = firstSlotX - slotPitch;
            const indexY = offsetY + topOverhang + slotStartY + templateSlotLength / 2;
            const indexHoleR = 2.5;

            svg += `<circle class="engrave" cx="${indexX}" cy="${indexY}" r="${indexHoleR}" />`;
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

            // Cutout Logic
            // Cutout needed if slot intersects.
            // Slot Cut starts at `InnerFace - radiusDiff`.
            // Inner Face corresponds to `shoulderY`?
            // Yes, the Side Plate sits under the Top Plate.
            // The Top Plate holes are at `edgeMargin`.
            // The Side Plate fingers go through them.
            // The Side Plate Inner Face (main body) starts at `edgeMargin + materialThickness` relative to Top Edge?
            // No.
            // Side Plate Body is vertical.
            // Top Plate sits on top of Side Plate Shoulder.
            // Top Plate Edge is at `edgeMargin` distance from Side Plate Face?
            // Yes, we set `edgeMargin` as distance from Top Edge to Hole.
            // Hole is where Finger is.
            // Finger is flush with Side Plate Face (usually).
            // So Top Plate Edge overhangs Side Plate Face by `edgeMargin`.
            // So Side Plate Face is at `edgeMargin` from Top Plate Edge.
            // Slot starts at `realSlotStartY = edgeMargin + materialThickness - radiusDiff`.
            // Distance from Side Plate Face (at `edgeMargin + materialThickness`? No).
            // Let's trace Y coords on Top Plate.
            // 0 = Edge.
            // `edgeMargin` = Hole Start.
            // `edgeMargin + materialThickness` = Hole End (Side Plate Inner Face).
            // So Side Plate Inner Face is at `edgeMargin + materialThickness`.
            // Slot starts at `InnerFace - radiusDiff`.
            // So Slot cuts into the space *before* the Inner Face.
            // i.e. It cuts into the Top Plate material that is sitting on top of the Side Plate?
            // No, Top Plate sits on Shoulder.
            // Fingers go through Top Plate.
            // If Slot cuts into Top Plate at `InnerFace - radiusDiff`.
            // Does it hit the Side Plate Fingers?
            // Yes! Fingers are at `InnerFace` (flush).
            // So we need to cut the Fingers.
            // Does it hit the Side Plate Body (Shoulder)?
            // Slot depth is `radiusDiff`.
            // It cuts `radiusDiff` *away* from the Inner Face (towards the Edge).
            // So it cuts into the "Overhang" area.
            // It does NOT cut into the Side Plate Body (which starts at Inner Face and goes deeper).
            // BUT it DOES cut into the Fingers (which are at Inner Face).
            // So we need to interrupt the Fingers.
            // Do we need to cut into the Shoulder?
            // Only if `radiusDiff` was negative (cutting into the body).
            // But `radiusDiff` is positive (hole > target).
            // Wait.
            // `offset = CopyRing - Bit`.
            // `radiusDiff = offset / 2`.
            // Template Hole is LARGER than Target.
            // Target starts at Inner Face.
            // Template Hole starts at `InnerFace - radiusDiff`.
            // So it extends *towards* the Edge.
            // So it hits the Fingers.
            // It does NOT hit the Shoulder (Body).
            // So we only need to cut the Fingers down.
            // How deep?
            // We need to clear the Copy Ring.
            // Copy Ring is at `radiusDiff` from Inner Face.
            // So we need to remove the Finger material in that zone.
            // Actually, we need to remove *all* Finger material in the slot zone?
            // Yes, otherwise the Copy Ring hits the Finger.
            // So: If slot intersects, `segmentY` (Finger Tip) must be lowered.
            // Lowered to what?
            // To `shoulderY`? (Flush with Top Plate bottom).
            // Or deeper?
            // The slot in Top Plate goes through.
            // The Copy Ring rides on Top Plate?
            // Yes.
            // But the Router Bit goes *through* the Top Plate.
            // And the Copy Ring Guide Bushing sticks down?
            // Usually Guide Bushing is short.
            // But if we have 2 Top Plates (10mm), maybe it's fine.
            // However, the user said "sidewall needs to be interrupted... otherwise we will route into it".
            // If we route *slots*, we might route into the fingers.
            // So let's cut the fingers down to `shoulderY` (remove them) where slots are.
            // Do we need to cut into the Shoulder?
            // If the Copy Ring sticks down more than 2xThickness? Unlikely.
            // But maybe the user wants clearance.
            // Let's cut down to `shoulderY + radiusDiff`?
            // No, `radiusDiff` is horizontal.
            // Let's just remove the fingers (set to `shoulderY`).
            // AND maybe cut a bit into the shoulder if needed?
            // User said "sidewall needs to be interrupted".
            // Let's assume cutting to `shoulderY` (removing finger) is enough to clear the path.
            // But wait, if the slot starts at `InnerFace - radiusDiff`.
            // And goes to `InnerFace + Length + radiusDiff`.
            // It crosses the Inner Face line.
            // So it cuts into the Body too?
            // `InnerFace` is the plane of the Side Plate.
            // Slot goes from `InnerFace - radiusDiff` to `InnerFace + ...`.
            // So it crosses the plane!
            // So it cuts into the Side Plate Body!
            // YES.
            // So we need to cut into the Shoulder.
            // Depth into Shoulder = `radiusDiff`?
            // No.
            // Slot starts at `InnerFace - radiusDiff`.
            // It goes *away* from the edge, *into* the board.
            // So it goes deeper into the Side Plate Body.
            // Wait.
            // "Target Slot Length" is across the runner.
            // Runner is clamped against Side Plate.
            // So Slot goes from Side Plate *outwards*?
            // Or from Side Plate *inwards*?
            // Usually Runner is clamped to the Side Plate.
            // Slot starts at Runner Edge (touching Side Plate).
            // And goes into the Runner.
            // So Template Slot must cover that.
            // Template Slot starts at `InnerFace - radiusDiff`.
            // And goes to `InnerFace + Length + radiusDiff`.
            // So it overlaps the Inner Face by `radiusDiff` (on the "negative" side) and `Length + radiusDiff` (on the "positive" side).
            // Wait.
            // Coordinate system:
            // Y=0 (Edge). Y=Margin (Hole). Y=Margin+Thick (Inner Face).
            // Slot Y range: `[InnerFace - radiusDiff, InnerFace + Length + radiusDiff]`.
            // Side Plate Body is at `Y > InnerFace`.
            // So Slot overlaps Side Plate Body from `InnerFace` to `InnerFace + Length + radiusDiff`.
            // This implies we are routing *through* the Side Plate Body?
            // That makes no sense. The Side Plate is the fence.
            // Unless... the Runner is *on top* of the Side Plate? No.
            // Unless the Slot is *parallel* to the Side Plate?
            // "route the slits of the runners".
            // Runners are long. Slits are across them.
            // If Side Plate is the fence along the length.
            // Then Slits are perpendicular to Side Plate.
            // So Slits go *away* from Side Plate.
            // So Slot starts at Inner Face and goes +Y.
            // So Template Slot starts at `InnerFace - radiusDiff`.
            // So it cuts into the "Air" (or Top Plate overhang) before the Inner Face.
            // It does NOT cut into the Side Plate Body (which is "behind" the Inner Face? No).
            // Side Plate is the Fence.
            // Everything "behind" the fence is the Side Plate structure.
            // Everything "in front" is the Runner.
            // So Side Plate occupies `Y < InnerFace`?
            // If Top Plate Edge is Y=0.
            // And Side Plate is set back by `edgeMargin`.
            // Then Side Plate occupies `Y in [edgeMargin, edgeMargin + Thick]`.
            // And the rest of the Side Plate (Height) extends down in Z.
            // But in Y-dimension (thickness)?
            // It's a plate. It has thickness.
            // So it occupies `[edgeMargin, edgeMargin + Thick]`.
            // The Runner is pressed against `Y = edgeMargin + Thick`.
            // The Slot is in the Runner (`Y > edgeMargin + Thick`).
            // The Template Slot starts at `(edgeMargin + Thick) - radiusDiff`.
            // So it starts at `Y < InnerFace`.
            // So it overlaps the Side Plate region `[InnerFace - radiusDiff, InnerFace]`.
            // Since Side Plate is at `[edgeMargin, InnerFace]`.
            // And `radiusDiff` is usually ~4.5mm. `Thick` is 5mm.
            // So the Slot Cut overlaps the Side Plate thickness almost entirely.
            // So YES, we need to cut the Side Plate.
            // We need to cut the Fingers (which are in that region).
            // AND we need to cut the Shoulder?
            // The Shoulder is below the Fingers.
            // If the Router Bit depth is set to cut the Runner.
            // Does it hit the Shoulder?
            // The Runner is clamped *below* the Top Plate.
            // The Side Plate Shoulder is also *below* the Top Plate.
            // Side Plate acts as a spacer/fence.
            // If the Runner is flush with Side Plate top?
            // Then we route into both.
            // But usually Runner is clamped against Side Plate face.
            // If we route the Runner, we don't want to route the Side Plate.
            // But the Copy Ring (larger than bit) travels in the Template Slot.
            // The Template Slot overlaps the Side Plate.
            // So the Copy Ring *will* be over the Side Plate.
            // So the Side Plate Fingers (which stick up into the Template) MUST be removed in that area.
            // So `isCutout` -> Remove Finger (Height = Shoulder).
            // Do we need to go deeper than Shoulder?
            // Only if the Copy Ring Nut/Base hits the Shoulder.
            // Usually Shoulder is 10mm below Template surface (2x5mm plates).
            // That's plenty of clearance.
            // So just removing the fingers is enough.
            // BUT, user said "sidewall needs to be interrupted".
            // Maybe they mean the Shoulder too?
            // "otherwise we will route into it".
            // If we route into it, it means the *Bit* hits it.
            // The Bit is inside the Copy Ring.
            // The Bit cuts the Runner.
            // The Bit is at `Center`.
            // `Center` starts at `InnerFace`.
            // `BitRadius` extends to `InnerFace - BitRadius`.
            // Side Plate is at `InnerFace - Thickness` to `InnerFace`.
            // So `Bit` overlaps Side Plate by `BitRadius`.
            // So YES, the Bit cuts the Side Plate.
            // Unless the Slot starts further out?
            // "Target Slot Length" is slat width.
            // "Target Slot Width" is slat thickness.
            // If we want the slat to fit flush.
            // We cut to the edge.
            // So we cut the Side Plate.
            // UNLESS the Side Plate has a cutout!
            // So we MUST cut the Shoulder too!
            // How deep?
            // At least `BitRadius`.
            // Let's use `radiusDiff` + `BitRadius` = `CopyRingRadius`?
            // Or just `CopyRingRadius`.
            // Let's cut the Shoulder down by `CopyRingRadius` (approx 8.5mm).
            // So `cutoutY = shoulderY + CopyRingRadius/2`?
            // No, `shoulderY` is Y-coord in SVG.
            // We want to increase Y (go down).
            // `cutoutY = shoulderY + copyRingDiameter/2`.

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

            const cutoutDepth = this.params.copyRingDiameter / 2;
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
