/**
 * Text Grader Comparator
 *
 * Output comparison strategies for comparing student output
 * against expected output.
 */

(function() {
    'use strict';

    // Dependencies
    const Utils = window.TextGraderUtils;

    const TextGraderComparator = {

        /**
         * Compare student output to expected output
         * @param {string} actual - Student's output
         * @param {string} expected - Expected output
         * @param {string} mode - Comparison mode (exact, normalized, structural, numeric, contains)
         * @param {Object} options - Additional options (tolerance for numeric)
         * @returns {Object} - { match: boolean, details: string }
         */
        compare: function(actual, expected, mode, options) {
            mode = mode || 'exact';
            options = options || {};

            switch (mode) {
                case 'exact':
                    return this._exactMatch(actual, expected);
                case 'normalized':
                    return this._normalizedMatch(actual, expected);
                case 'structural':
                    return this._structuralMatch(actual, expected);
                case 'numeric':
                    return this._numericMatch(actual, expected, options.tolerance);
                case 'contains':
                    return this._containsMatch(actual, expected);
                default:
                    return this._exactMatch(actual, expected);
            }
        },

        /**
         * Exact string match (after trimming)
         * @private
         */
        _exactMatch: function(actual, expected) {
            const actualTrimmed = (actual || '').trim();
            const expectedTrimmed = (expected || '').trim();

            const match = actualTrimmed === expectedTrimmed;

            return {
                match: match,
                details: match ? '정확히 일치합니다!' : '출력이 다릅니다.',
                actual: actualTrimmed,
                expected: expectedTrimmed
            };
        },

        /**
         * Normalized match - ignore extra whitespace, case-insensitive optional
         * @private
         */
        _normalizedMatch: function(actual, expected, options) {
            options = options || {};
            const caseSensitive = options.caseSensitive !== false; // Default: case-sensitive

            const normalize = function(s) {
                let normalized = (s || '').trim()
                    .replace(/\s+/g, ' ')
                    .replace(/\[\s+/g, '[')
                    .replace(/\s+\]/g, ']')
                    .replace(/\(\s+/g, '(')
                    .replace(/\s+\)/g, ')')
                    .replace(/{\s+/g, '{')
                    .replace(/\s+}/g, '}')
                    .replace(/,\s+/g, ', ')
                    .replace(/:\s+/g, ': ');

                if (!caseSensitive) {
                    normalized = normalized.toLowerCase();
                }
                return normalized;
            };

            const actualNorm = normalize(actual);
            const expectedNorm = normalize(expected);
            const match = actualNorm === expectedNorm;

            return {
                match: match,
                details: match ? '정답입니다!' : '출력 형식을 확인하세요.',
                actual: actualNorm,
                expected: expectedNorm
            };
        },

        /**
         * Structural match - parse as Python literals and compare
         * @private
         */
        _structuralMatch: function(actual, expected) {
            try {
                // Compare line by line
                const actualLines = Utils.splitLines(actual);
                const expectedLines = Utils.splitLines(expected);

                if (actualLines.length !== expectedLines.length) {
                    return {
                        match: false,
                        details: `출력 줄 수가 다릅니다 (예상: ${expectedLines.length}줄, 실제: ${actualLines.length}줄)`,
                        actual: actual,
                        expected: expected
                    };
                }

                for (let i = 0; i < actualLines.length; i++) {
                    const actualParsed = Utils.tryParsePythonLiteral(actualLines[i].trim());
                    const expectedParsed = Utils.tryParsePythonLiteral(expectedLines[i].trim());

                    if (!Utils.deepEqual(actualParsed, expectedParsed)) {
                        return {
                            match: false,
                            details: `${i + 1}번째 줄이 다릅니다.`,
                            actual: actualLines[i].trim(),
                            expected: expectedLines[i].trim(),
                            lineNumber: i + 1
                        };
                    }
                }

                return {
                    match: true,
                    details: '구조가 일치합니다!',
                    actual: actual,
                    expected: expected
                };

            } catch (e) {
                Utils.warn('Structural match failed, falling back to normalized:', e);
                // Fall back to normalized match
                return this._normalizedMatch(actual, expected);
            }
        },

        /**
         * Numeric match - allow floating point tolerance
         * @private
         */
        _numericMatch: function(actual, expected, tolerance) {
            tolerance = tolerance || 0.01;

            const actualTrimmed = (actual || '').trim();
            const expectedTrimmed = (expected || '').trim();

            // Try to parse as numbers
            const actualNum = parseFloat(actualTrimmed);
            const expectedNum = parseFloat(expectedTrimmed);

            // If both are valid numbers, compare with tolerance
            if (!isNaN(actualNum) && !isNaN(expectedNum)) {
                const diff = Math.abs(actualNum - expectedNum);
                const match = diff <= tolerance;

                return {
                    match: match,
                    details: match
                        ? '정답입니다!'
                        : `숫자가 다릅니다 (예상: ${expectedNum}, 실제: ${actualNum}, 차이: ${diff.toFixed(4)})`,
                    actual: actualNum,
                    expected: expectedNum,
                    difference: diff
                };
            }

            // Fall back to exact match if not numeric
            return this._exactMatch(actual, expected);
        },

        /**
         * Contains match - check if expected appears in actual
         * @private
         */
        _containsMatch: function(actual, expected) {
            const actualTrimmed = (actual || '').trim();
            const expectedTrimmed = (expected || '').trim();

            const match = actualTrimmed.includes(expectedTrimmed);

            return {
                match: match,
                details: match ? '포함되어 있습니다!' : '필요한 내용이 없습니다.',
                actual: actualTrimmed,
                expected: expectedTrimmed
            };
        },

        /**
         * Compare multiple outputs against multiple expected values
         * Used for function/class tests with multiple test cases
         * @param {string[]} actuals - Array of actual outputs
         * @param {string[]} expecteds - Array of expected outputs
         * @param {string} mode - Comparison mode
         * @returns {Object[]} - Array of comparison results
         */
        compareMultiple: function(actuals, expecteds, mode) {
            const results = [];
            const maxLen = Math.max(actuals.length, expecteds.length);

            for (let i = 0; i < maxLen; i++) {
                const actual = actuals[i] || '';
                const expected = expecteds[i] || '';

                results.push({
                    index: i,
                    ...this.compare(actual, expected, mode)
                });
            }

            return results;
        },

        /**
         * Compare line by line with detailed results
         * @param {string} actual - Actual output
         * @param {string} expected - Expected output
         * @returns {Object} - Detailed line-by-line comparison
         */
        compareLines: function(actual, expected) {
            const actualLines = Utils.splitLines(actual);
            const expectedLines = Utils.splitLines(expected);

            const lineResults = [];
            const maxLen = Math.max(actualLines.length, expectedLines.length);

            let matchCount = 0;

            for (let i = 0; i < maxLen; i++) {
                const actualLine = actualLines[i] || '';
                const expectedLine = expectedLines[i] || '';
                const match = actualLine.trim() === expectedLine.trim();

                if (match) matchCount++;

                lineResults.push({
                    lineNumber: i + 1,
                    match: match,
                    actual: actualLine,
                    expected: expectedLine
                });
            }

            return {
                allMatch: matchCount === maxLen && maxLen > 0,
                matchCount: matchCount,
                totalLines: maxLen,
                lines: lineResults
            };
        }
    };

    // Export
    if (typeof window !== 'undefined') {
        window.TextGraderComparator = TextGraderComparator;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TextGraderComparator;
    }

})();
