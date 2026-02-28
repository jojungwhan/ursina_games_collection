/**
 * Turtle Grader Geometry Engine
 *
 * Algorithms for analyzing turtle graphics shapes:
 * - Collinear segment merging
 * - Vertex extraction from command trace
 * - Rotation normalization
 * - Shape metrics calculation
 */

(function() {
    'use strict';

    // Get dependencies
    const Config = window.TurtleGraderConfig;
    const Utils = window.TurtleGraderUtils;

    if (!Config || !Utils) {
        console.error('[TurtleGeometry] Dependencies not loaded. Ensure config.js and utils.js are loaded first.');
        return;
    }

    const TOLERANCES = Config.TOLERANCES;

    // ========================================================================
    // SEGMENT PROCESSING
    // ========================================================================

    /**
     * Extract line segments from turtle command trace
     * Only includes segments drawn with pen down
     *
     * @param {Object} trace - Command trace from interceptor
     * @returns {Array} Array of segments {start, end, length, angle}
     */
    function extractSegments(trace) {
        if (!trace || !trace.segments) {
            return [];
        }

        return trace.segments.map(seg => ({
            start: { x: seg.start.x, y: seg.start.y },
            end: { x: seg.end.x, y: seg.end.y },
            length: Utils.distance(seg.start, seg.end),
            angle: Utils.angleBetweenPoints(seg.start, seg.end)
        })).filter(seg => seg.length >= TOLERANCES.MIN_SEGMENT_LENGTH);
    }

    /**
     * Check if two segments are collinear (same direction)
     *
     * @param {Object} seg1 - First segment
     * @param {Object} seg2 - Second segment
     * @returns {boolean} True if segments are collinear
     */
    function areCollinear(seg1, seg2) {
        // Check if angles are approximately equal
        return Utils.anglesApproxEqual(seg1.angle, seg2.angle, TOLERANCES.COLLINEAR_ANGLE);
    }

    /**
     * Check if two segments are connected (end of first = start of second)
     *
     * @param {Object} seg1 - First segment
     * @param {Object} seg2 - Second segment
     * @returns {boolean} True if segments are connected
     */
    function areConnected(seg1, seg2) {
        return Utils.distance(seg1.end, seg2.start) <= TOLERANCES.VERTEX_POSITION;
    }

    /**
     * Merge collinear connected segments
     * Handles cases like forward(25); forward(25); forward(25); forward(25) -> one 100px segment
     *
     * @param {Array} segments - Array of segments
     * @returns {Array} Array of merged segments
     */
    function mergeCollinearSegments(segments) {
        if (!segments || segments.length === 0) {
            return [];
        }

        const merged = [];
        let current = { ...segments[0] };

        for (let i = 1; i < segments.length; i++) {
            const next = segments[i];

            // If connected and collinear, merge
            if (areConnected(current, next) && areCollinear(current, next)) {
                // Extend current segment
                current.end = { ...next.end };
                current.length = Utils.distance(current.start, current.end);
            } else {
                // Push current and start new
                merged.push(current);
                current = { ...next };
            }
        }

        // Push last segment
        merged.push(current);

        return merged;
    }

    // ========================================================================
    // VERTEX EXTRACTION
    // ========================================================================

    /**
     * Extract vertices from merged segments
     * Vertices are points where the turtle changes direction
     *
     * @param {Array} segments - Array of merged segments
     * @returns {Array} Array of vertices {x, y, turnAngle}
     */
    function extractVertices(segments) {
        if (!segments || segments.length === 0) {
            return [];
        }

        const vertices = [];

        // First vertex is start of first segment
        vertices.push({
            x: segments[0].start.x,
            y: segments[0].start.y,
            turnAngle: 0
        });

        // Vertices at segment junctions (where direction changes)
        for (let i = 0; i < segments.length - 1; i++) {
            const current = segments[i];
            const next = segments[i + 1];

            // Calculate turn angle (exterior angle)
            let turnAngle = Utils.normalizeAngleSigned(next.angle - current.angle);

            vertices.push({
                x: current.end.x,
                y: current.end.y,
                turnAngle: Math.abs(turnAngle)
            });
        }

        // Last vertex is end of last segment
        const last = segments[segments.length - 1];
        vertices.push({
            x: last.end.x,
            y: last.end.y,
            turnAngle: 0
        });

        return vertices;
    }

    /**
     * Calculate turn angles at each vertex (excluding first and last)
     *
     * @param {Array} segments - Array of segments
     * @returns {Array} Array of turn angles in degrees
     */
    function calculateTurnAngles(segments) {
        if (!segments || segments.length < 2) {
            return [];
        }

        const angles = [];

        for (let i = 0; i < segments.length - 1; i++) {
            const current = segments[i];
            const next = segments[i + 1];

            // Calculate turn angle (exterior angle)
            let turnAngle = Utils.normalizeAngleSigned(next.angle - current.angle);
            angles.push(Math.abs(turnAngle));
        }

        return angles;
    }

    // ========================================================================
    // SHAPE ANALYSIS
    // ========================================================================

    /**
     * Check if shape is closed (start point = end point)
     *
     * @param {Array} segments - Array of segments
     * @returns {Object} {isClosed, gap}
     */
    function checkClosure(segments) {
        if (!segments || segments.length === 0) {
            return { isClosed: false, gap: Infinity };
        }

        const first = segments[0];
        const last = segments[segments.length - 1];

        const gap = Utils.distance(first.start, last.end);

        return {
            isClosed: gap <= TOLERANCES.CLOSURE_GAP,
            gap: gap
        };
    }

    /**
     * Calculate shape metrics from trace
     *
     * @param {Object} trace - Command trace from interceptor
     * @returns {Object} Shape metrics
     */
    function analyzeShape(trace) {
        // Extract and merge segments
        const rawSegments = extractSegments(trace);
        const segments = mergeCollinearSegments(rawSegments);

        // Check if we have any segments
        if (segments.length === 0) {
            return {
                valid: false,
                sideCount: 0,
                sideLengths: [],
                turnAngles: [],
                perimeter: 0,
                isClosed: false,
                closureGap: Infinity,
                isRegular: false,
                vertices: []
            };
        }

        // Extract measurements
        const sideLengths = segments.map(s => s.length);
        const turnAngles = calculateTurnAngles(segments);
        const vertices = extractVertices(segments);
        const closure = checkClosure(segments);

        // Calculate perimeter
        const perimeter = sideLengths.reduce((sum, len) => sum + len, 0);

        // Check if regular (equal sides and angles)
        const isRegular = checkRegularity(sideLengths, turnAngles);

        return {
            valid: true,
            sideCount: segments.length,
            sideLengths: sideLengths,
            turnAngles: turnAngles,
            perimeter: perimeter,
            isClosed: closure.isClosed,
            closureGap: closure.gap,
            isRegular: isRegular,
            vertices: vertices,
            segments: segments
        };
    }

    /**
     * Check if shape is regular (equal sides and angles)
     *
     * @param {Array} sideLengths - Array of side lengths
     * @param {Array} turnAngles - Array of turn angles
     * @returns {boolean} True if regular
     */
    function checkRegularity(sideLengths, turnAngles) {
        if (!sideLengths || sideLengths.length < 3) {
            return false;
        }

        // Check if all side lengths are approximately equal
        const avgLength = Utils.mean(sideLengths);
        const lengthTolerance = avgLength * TOLERANCES.LENGTH_PERCENT;
        const equalSides = Utils.allApproxEqual(sideLengths, lengthTolerance);

        // Check if all turn angles are approximately equal
        if (!turnAngles || turnAngles.length < 2) {
            return equalSides;
        }

        const equalAngles = Utils.allApproxEqual(turnAngles, TOLERANCES.ANGLE);

        return equalSides && equalAngles;
    }

    // ========================================================================
    // NORMALIZATION (for comparison regardless of position/rotation)
    // ========================================================================

    /**
     * Translate vertices so centroid is at origin
     *
     * @param {Array} vertices - Array of vertices
     * @returns {Array} Translated vertices
     */
    function translateToOrigin(vertices) {
        if (!vertices || vertices.length === 0) {
            return [];
        }

        const points = vertices.map(v => ({ x: v.x, y: v.y }));
        const center = Utils.centroid(points);

        return vertices.map(v => ({
            ...v,
            x: v.x - center.x,
            y: v.y - center.y
        }));
    }

    /**
     * Rotate vertices so first vertex is at angle 0 from center
     *
     * @param {Array} vertices - Array of vertices (centered at origin)
     * @returns {Array} Rotated vertices
     */
    function normalizeRotation(vertices) {
        if (!vertices || vertices.length === 0) {
            return [];
        }

        // Get angle to first vertex
        const first = vertices[0];
        const angleToFirst = Math.atan2(first.y, first.x);

        // Rotate all vertices by -angleToFirst
        return vertices.map(v => {
            const dist = Math.sqrt(v.x * v.x + v.y * v.y);
            const angle = Math.atan2(v.y, v.x) - angleToFirst;

            return {
                ...v,
                x: dist * Math.cos(angle),
                y: dist * Math.sin(angle)
            };
        });
    }

    /**
     * Normalize shape for comparison (position and rotation independent)
     *
     * @param {Object} shapeMetrics - Shape metrics from analyzeShape
     * @returns {Object} Normalized shape metrics
     */
    function normalizeShape(shapeMetrics) {
        if (!shapeMetrics || !shapeMetrics.valid) {
            return shapeMetrics;
        }

        const normalizedVertices = normalizeRotation(
            translateToOrigin(shapeMetrics.vertices)
        );

        return {
            ...shapeMetrics,
            normalizedVertices: normalizedVertices
        };
    }

    // ========================================================================
    // SHAPE IDENTIFICATION
    // ========================================================================

    /**
     * Identify shape type based on metrics
     *
     * @param {Object} metrics - Shape metrics
     * @returns {string} Shape type name
     */
    function identifyShape(metrics) {
        if (!metrics || !metrics.valid) {
            return 'unknown';
        }

        const n = metrics.sideCount;

        if (!metrics.isClosed) {
            return 'open-path';
        }

        if (!metrics.isRegular) {
            return `irregular-${n}-gon`;
        }

        // Regular polygon names
        const names = {
            3: 'triangle',
            4: 'square',
            5: 'pentagon',
            6: 'hexagon',
            7: 'heptagon',
            8: 'octagon',
            9: 'nonagon',
            10: 'decagon',
            11: 'hendecagon',
            12: 'dodecagon'
        };

        return names[n] || `regular-${n}-gon`;
    }

    /**
     * Get expected turn angle for regular n-gon
     *
     * @param {number} n - Number of sides
     * @returns {number} Turn angle in degrees
     */
    function expectedTurnAngle(n) {
        return 360 / n;
    }

    // ========================================================================
    // MODULE EXPORT
    // ========================================================================

    const TurtleGeometry = {
        // Segment processing
        extractSegments,
        areCollinear,
        areConnected,
        mergeCollinearSegments,

        // Vertex extraction
        extractVertices,
        calculateTurnAngles,

        // Shape analysis
        checkClosure,
        analyzeShape,
        checkRegularity,

        // Normalization
        translateToOrigin,
        normalizeRotation,
        normalizeShape,

        // Identification
        identifyShape,
        expectedTurnAngle
    };

    // Export to global scope
    if (typeof window !== 'undefined') {
        window.TurtleGeometry = TurtleGeometry;
    }

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TurtleGeometry;
    }

})();
