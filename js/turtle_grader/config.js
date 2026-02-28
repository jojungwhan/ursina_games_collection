/**
 * Turtle Grader Configuration - Single Source of Truth (SSOT)
 *
 * This file contains all configuration for the turtle auto-grading system:
 * - Quiz definitions with expected shapes
 * - Scoring rubric and tolerances
 * - Feedback messages (Korean)
 * - Geometric tolerances
 *
 * DO NOT scatter these values across other files.
 */

(function() {
    'use strict';

    // ========================================================================
    // GEOMETRIC TOLERANCES
    // ========================================================================

    const TOLERANCES = {
        // Angle tolerance in degrees
        ANGLE: 3,

        // Length tolerance as percentage (0.05 = 5%)
        LENGTH_PERCENT: 0.05,

        // Closure gap tolerance in pixels
        CLOSURE_GAP: 5,

        // Collinear segment merging angle threshold (degrees)
        COLLINEAR_ANGLE: 2,

        // Minimum segment length to consider (pixels)
        MIN_SEGMENT_LENGTH: 5,

        // Position tolerance for vertex comparison (pixels)
        VERTEX_POSITION: 3
    };

    // ========================================================================
    // SCORING RUBRIC
    // ========================================================================

    const RUBRIC = {
        // Weight for each scoring component (must sum to 100)
        sideCount: {
            weight: 30,
            tolerance: 0  // Must match exactly
        },
        turnAngles: {
            weight: 25,
            tolerance: TOLERANCES.ANGLE  // Degrees per angle
        },
        sideLengths: {
            weight: 25,
            tolerance: TOLERANCES.LENGTH_PERCENT  // Percentage
        },
        isClosed: {
            weight: 20,
            tolerance: TOLERANCES.CLOSURE_GAP  // Pixels
        }
    };

    // ========================================================================
    // FEEDBACK MESSAGES (Korean)
    // ========================================================================

    const FEEDBACK = {
        // Side count feedback
        sideCount: {
            correct: '변의 개수가 정확해요!',
            wrong: (expected, got) => `${expected}개의 변이 필요한데, ${got}개를 그렸어요.`,
            zero: '아직 아무것도 그리지 않았어요. 코드를 실행해보세요!'
        },

        // Turn angle feedback
        turnAngles: {
            correct: '회전 각도가 정확해요!',
            wrong: (expected) => `각 꼭짓점에서 ${expected}도씩 회전해야 해요.`,
            inconsistent: '모든 회전 각도가 같아야 정다각형이에요.'
        },

        // Side length feedback
        sideLengths: {
            correct: '변의 길이가 균일해요!',
            wrong: (expected) => expected ?
                `한 변의 길이가 ${expected}이어야 해요.` :
                '모든 변의 길이가 같아야 정다각형이에요.',
            inconsistent: '변의 길이가 일정하지 않아요.'
        },

        // Closure feedback
        closure: {
            closed: '도형이 정확히 닫혔어요!',
            almostClosed: '도형이 거의 닫혔지만, 시작점과 끝점이 약간 떨어져 있어요.',
            notClosed: '도형이 닫히지 않았어요. 시작점으로 돌아가세요!'
        },

        // Overall feedback
        overall: {
            perfect: '완벽해요! 정확한 도형을 그렸습니다!',
            excellent: '훌륭해요! 거의 완벽한 도형이에요!',
            good: '잘했어요! 조금만 더 수정하면 완벽해질 거예요.',
            needsWork: '아직 부족해요. 힌트를 참고해서 다시 시도해보세요.',
            noShape: '도형이 감지되지 않았어요. 거북이를 움직여보세요!'
        },

        // Error messages
        errors: {
            noCode: '코드를 입력하고 실행해주세요.',
            syntaxError: '코드에 문법 오류가 있어요. 확인해보세요.',
            noTurtle: '거북이 명령어가 없어요. turtle 모듈을 사용해보세요.',
            timeout: '코드 실행 시간이 너무 길어요. 무한 반복이 있는지 확인해보세요.'
        }
    };

    // ========================================================================
    // QUIZ DEFINITIONS
    // ========================================================================

    const QUIZZES = {
        // Square quizzes
        'square-100': {
            title: '정사각형 그리기',
            description: '한 변의 길이가 100인 정사각형을 그리세요.',
            expected: {
                sideCount: 4,
                turnAngle: 90,       // Exterior angle
                sideLength: 100,     // Required side length
                mustBeClosed: true,
                mustBeRegular: true
            },
            hints: [
                '정사각형은 4개의 변을 가져요',
                '각 모서리에서 90도 회전하세요',
                'forward(100)과 right(90) 또는 left(90)을 4번 반복하세요'
            ],
            starterCode: 'import turtle\nt = turtle.Turtle()\n\n# 정사각형: 4번 반복, 90도 회전\nfor i in range(4):\n    t.forward(100)\n    t.right(90)\n'
        },

        'square-any': {
            title: '정사각형 그리기 (자유 크기)',
            description: '크기에 관계없이 정사각형을 그리세요.',
            expected: {
                sideCount: 4,
                turnAngle: 90,
                sideLength: null,    // Any length accepted
                mustBeClosed: true,
                mustBeRegular: true
            },
            hints: [
                '정사각형은 4개의 변과 4개의 직각(90도)을 가져요',
                '모든 변의 길이가 같아야 해요',
                '4번 반복하고, 매번 90도 회전하세요'
            ],
            starterCode: 'import turtle\nt = turtle.Turtle()\n\n# 여기에 정사각형 코드를 작성하세요\n'
        },

        // Triangle quizzes
        'triangle-equilateral': {
            title: '정삼각형 그리기',
            description: '정삼각형을 그리세요. (모든 변과 각이 같음)',
            expected: {
                sideCount: 3,
                turnAngle: 120,      // 360 / 3
                sideLength: null,
                mustBeClosed: true,
                mustBeRegular: true
            },
            hints: [
                '정삼각형은 3개의 변을 가져요',
                '360도를 3으로 나누면 120도예요',
                'forward와 left(120) 또는 right(120)을 3번 반복하세요'
            ],
            starterCode: 'import turtle\nt = turtle.Turtle()\n\n# 정삼각형: 3번 반복, 120도 회전\nfor i in range(3):\n    t.forward(100)\n    t.left(120)\n'
        },

        // Pentagon quiz
        'pentagon-regular': {
            title: '정오각형 그리기',
            description: '정오각형을 그리세요.',
            expected: {
                sideCount: 5,
                turnAngle: 72,       // 360 / 5
                sideLength: null,
                mustBeClosed: true,
                mustBeRegular: true
            },
            hints: [
                '정오각형은 5개의 변을 가져요',
                '360도를 5로 나누면 72도예요',
                'range(5)와 left(72) 또는 right(72)를 사용하세요'
            ],
            starterCode: 'import turtle\nt = turtle.Turtle()\n\n# 정오각형: 5번 반복, 72도 회전\nfor i in range(5):\n    t.forward(80)\n    t.left(72)\n'
        },

        // Hexagon quiz
        'hexagon-regular': {
            title: '정육각형 그리기',
            description: '정육각형을 그리세요.',
            expected: {
                sideCount: 6,
                turnAngle: 60,       // 360 / 6
                sideLength: null,
                mustBeClosed: true,
                mustBeRegular: true
            },
            hints: [
                '정육각형은 6개의 변을 가져요',
                '360도를 6으로 나누면 60도예요',
                'range(6)와 left(60) 또는 right(60)를 사용하세요'
            ],
            starterCode: 'import turtle\nt = turtle.Turtle()\n\n# 정육각형: 6번 반복, 60도 회전\nfor i in range(6):\n    t.forward(70)\n    t.left(60)\n'
        },

        // Heptagon quiz (7 sides)
        'heptagon-regular': {
            title: '정칠각형 그리기',
            description: '정칠각형을 그리세요. (7개의 변)',
            expected: {
                sideCount: 7,
                turnAngle: 51.43,    // 360 / 7 ≈ 51.43
                sideLength: null,
                mustBeClosed: true,
                mustBeRegular: true
            },
            hints: [
                '정칠각형은 7개의 변을 가져요',
                '360도를 7로 나누면 약 51.43도예요',
                '힌트: 360/7을 직접 계산식으로 사용할 수 있어요!'
            ],
            starterCode: 'import turtle\nt = turtle.Turtle()\n\n# 정칠각형: 7번 반복\n# 외각 = 360 / 7\nfor i in range(7):\n    t.forward(70)\n    t.left(360/7)\n'
        },

        // Octagon quiz (8 sides)
        'octagon-regular': {
            title: '정팔각형 그리기',
            description: '정팔각형을 그리세요. (8개의 변)',
            expected: {
                sideCount: 8,
                turnAngle: 45,       // 360 / 8
                sideLength: null,
                mustBeClosed: true,
                mustBeRegular: true
            },
            hints: [
                '정팔각형은 8개의 변을 가져요',
                '360도를 8로 나누면 45도예요',
                'range(8)와 left(45) 또는 right(45)를 사용하세요'
            ],
            starterCode: 'import turtle\nt = turtle.Turtle()\n\n# 정팔각형: 8번 반복, 45도 회전\nfor i in range(8):\n    t.forward(60)\n    t.left(45)\n'
        },

        // Five-pointed star
        'star-5point': {
            title: '오각별 그리기',
            description: '오각별(★)을 그리세요.',
            expected: {
                sideCount: 5,
                turnAngle: 144,      // 360 / 5 * 2 = 144
                sideLength: null,
                mustBeClosed: true,
                mustBeRegular: true
            },
            hints: [
                '별은 5개의 선을 그어요',
                '별의 회전 각도는 144도예요 (360÷5×2)',
                '일반 오각형(72도)과 다르게 더 많이 회전해요!'
            ],
            starterCode: 'import turtle\nt = turtle.Turtle()\n\n# 오각별: 5번 반복, 144도 회전\n# 힌트: 별은 꼭짓점을 건너뛰며 그려요\nfor i in range(5):\n    t.forward(100)\n    t.right(144)\n'
        },

        // Challenge: Any regular polygon
        'polygon-challenge': {
            title: '다각형 챌린지',
            description: '원하는 정다각형을 그리세요. (별 제외)',
            expected: {
                sideCount: null,     // Any count >= 3
                turnAngle: null,     // Will be calculated as 360/sideCount
                sideLength: null,
                mustBeClosed: true,
                mustBeRegular: true,
                minSides: 3,
                maxSides: 12
            },
            hints: [
                '정다각형의 외각 공식: 360 / 변의 개수',
                '변의 개수만큼 반복하고, 외각만큼 회전하세요',
                '3각형부터 12각형까지 가능해요'
            ],
            starterCode: 'import turtle\nt = turtle.Turtle()\n\n# 원하는 정다각형을 그려보세요!\n# 힌트: 외각 = 360 / 변의 개수\n'
        }
    };

    // ========================================================================
    // SCORE THRESHOLDS
    // ========================================================================

    const SCORE_THRESHOLDS = {
        perfect: 100,
        excellent: 90,
        good: 70,
        passing: 50
    };

    // ========================================================================
    // STORAGE KEYS
    // ========================================================================

    const STORAGE_KEYS = {
        prefix: 'turtle_quiz_',
        progress: 'turtle_quiz_progress_',
        score: 'turtle_quiz_score_',
        attempts: 'turtle_quiz_attempts_'
    };

    // ========================================================================
    // MODULE EXPORT
    // ========================================================================

    const TurtleGraderConfig = {
        TOLERANCES,
        RUBRIC,
        FEEDBACK,
        QUIZZES,
        SCORE_THRESHOLDS,
        STORAGE_KEYS,

        // Helper function to get quiz by ID
        getQuiz: function(quizId) {
            return QUIZZES[quizId] || null;
        },

        // Helper function to get all quiz IDs
        getQuizIds: function() {
            return Object.keys(QUIZZES);
        },

        // Helper function to calculate expected turn angle for regular polygon
        calculateTurnAngle: function(sideCount) {
            return 360 / sideCount;
        },

        // Helper to get feedback based on score
        getOverallFeedback: function(score) {
            if (score >= SCORE_THRESHOLDS.perfect) return FEEDBACK.overall.perfect;
            if (score >= SCORE_THRESHOLDS.excellent) return FEEDBACK.overall.excellent;
            if (score >= SCORE_THRESHOLDS.good) return FEEDBACK.overall.good;
            if (score >= SCORE_THRESHOLDS.passing) return FEEDBACK.overall.needsWork;
            return FEEDBACK.overall.noShape;
        }
    };

    // Freeze configuration to prevent tampering
    Object.freeze(TurtleGraderConfig);
    Object.freeze(TOLERANCES);
    Object.freeze(RUBRIC);
    Object.freeze(FEEDBACK);
    Object.freeze(QUIZZES);
    Object.freeze(SCORE_THRESHOLDS);
    Object.freeze(STORAGE_KEYS);

    // Export to global scope
    if (typeof window !== 'undefined') {
        window.TurtleGraderConfig = TurtleGraderConfig;
    }

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TurtleGraderConfig;
    }

})();
