/**
 * Bed Calculator Logic
 * Calculates dimensions, cut lists, price, and sturdiness.
 */

export const WOOD_TYPES = [
    { id: 'kvh_spruce', name: 'KVH Spruce/Fir (Fichte/Tanne)', density: 460, eModulus: 11000 }, // Density kg/m3, E-Modulus N/mm2
    { id: 'bsh_spruce', name: 'BSH Spruce (Brettschichtholz)', density: 480, eModulus: 11500 },
    { id: 'oak', name: 'Oak (Eiche)', density: 700, eModulus: 13000 },
];

export const DEFAULT_CONFIG = {
    name: 'My Custom Bed',
    bedWidth: 1400, // mm
    bedLength: 2000, // mm
    bedHeight: 300, // mm (Top of slats)

    runnerWidth: 100, // mm
    runnerHeight: 160, // mm
    runnerCount: 2,
    runnerMargin: 0, // mm (Distance from edge to runner)

    slatWidth: 60, // mm
    slatHeight: 80, // mm
    slatGap: 40, // mm (Distance between slats)

    materialId: 'kvh_spruce',
    pricingUnit: 'm', // 'm', 'm3', 'piece'
    pricePerUnitRunner: 12.00, // EUR
    pricePerUnitSlat: 5.00, // EUR
    runnerMaterialLink: '', // New: URL for runner
    slatMaterialLink: '', // New: URL for slat
};

export class BedCalculator {
    constructor(config) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    calculate() {
        const {
            bedWidth, bedLength,
            runnerWidth, runnerHeight, runnerCount, runnerMargin,
            slatWidth, slatHeight, slatGap,
            pricePerUnitRunner, pricePerUnitSlat,
            pricingUnit,
            materialId
        } = this.config;

        // 1. Calculate Slat Count
        const slatCount = Math.floor((bedLength + slatGap) / (slatWidth + slatGap));
        const totalSlatArrayLength = slatCount * slatWidth + (slatCount - 1) * slatGap;
        const startOffset = (bedLength - totalSlatArrayLength) / 2;

        // 2. Parts List
        const runners = [];
        // Effective width for runners distribution
        const availableWidth = bedWidth - (2 * runnerMargin);
        const runnerSpacing = (availableWidth - runnerWidth) / Math.max(1, runnerCount - 1);

        // Calculate Slat Z positions for Runner Notches
        const slatZPositions = [];
        for (let i = 0; i < slatCount; i++) {
            slatZPositions.push(startOffset + i * (slatWidth + slatGap));
        }

        // Calculate Runner X positions for Slat Notches
        const runnerXPositions = [];
        for (let i = 0; i < runnerCount; i++) {
            runnerXPositions.push(runnerMargin + (i * runnerSpacing));
        }

        for (let i = 0; i < runnerCount; i++) {
            runners.push({
                id: `runner-${i}`,
                type: 'runner',
                length: bedLength,
                width: runnerWidth,
                height: runnerHeight,
                x: runnerXPositions[i],
                y: 0,
                z: 0,
                cuts: slatZPositions.map(z => ({
                    x: z, // Position along the length
                    width: slatWidth,
                    depth: slatHeight / 2
                }))
            });
        }

        const slats = [];
        for (let i = 0; i < slatCount; i++) {
            slats.push({
                id: `slat-${i}`,
                type: 'slat',
                length: bedWidth,
                width: slatWidth,
                height: slatHeight,
                x: 0,
                y: runnerHeight - slatHeight,
                z: slatZPositions[i],
                cuts: runnerXPositions.map(x => ({
                    x: x, // Position along the length (which is bed width for slat)
                    width: runnerWidth,
                    depth: slatHeight / 2
                }))
            });
        }

        // 3. Price Calculation
        const totalRunnerLengthM = (runners.length * bedLength) / 1000;
        const totalSlatLengthM = (slats.length * bedWidth) / 1000;

        // Volume in m^3
        const runnerVolume = totalRunnerLengthM * (runnerWidth / 1000) * (runnerHeight / 1000);
        const slatVolume = totalSlatLengthM * (slatWidth / 1000) * (slatHeight / 1000);

        let totalPrice = 0;

        if (pricingUnit === 'm') {
            totalPrice = (totalRunnerLengthM * pricePerUnitRunner) + (totalSlatLengthM * pricePerUnitSlat);
        } else if (pricingUnit === 'm3') {
            totalPrice = (runnerVolume * pricePerUnitRunner) + (slatVolume * pricePerUnitSlat);
        } else if (pricingUnit === 'piece') {
            totalPrice = (runners.length * pricePerUnitRunner) + (slats.length * pricePerUnitSlat);
        }

        // 4. Sturdiness (Deflection)
        // Span is the largest gap between runners.
        const clearSpan = runnerSpacing - runnerWidth;

        // Load Sharing Logic
        // Assume a "contact patch" of a person sitting/standing is ~300mm.
        const contactPatch = 300; // mm
        const slatsSharingLoad = Math.max(1, contactPatch / (slatWidth + slatGap));

        const totalLoad = 2000; // 200kg (~2000N)
        const loadPerSlat = totalLoad / slatsSharingLoad;

        const material = WOOD_TYPES.find(m => m.id === materialId) || WOOD_TYPES[0];
        const E = material.eModulus;

        // Moment of Inertia I = (b * h^3) / 12
        const I = (slatWidth * Math.pow(slatHeight, 3)) / 12;

        // Deflection formula
        const L = runnerSpacing;
        const deflection = (loadPerSlat * Math.pow(L, 3)) / (48 * E * I);

        const limit = L / 300;
        let score = 100;
        if (deflection > limit) {
            score = Math.max(0, 100 - ((deflection - limit) / limit) * 100);
        }

        return {
            parts: { runners, slats },
            metrics: {
                totalPrice,
                totalRunnerLengthM,
                totalSlatLengthM,
                totalVolume: runnerVolume + slatVolume,
                slatCount,
                runnerCount,
                deflectionMm: deflection,
                sturdinessScore: Math.round(score),
                isSturdy: deflection <= limit
            }
        };
    }
}
