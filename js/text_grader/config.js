/**
 * Text Grader Configuration - Single Source of Truth (SSOT)
 *
 * This file contains all exercise definitions, test cases, scoring weights,
 * and feedback messages for the text exercise auto-grader.
 *
 * Based on exercises from: https://github.com/zhiwehu/Python-programming-exercises
 */

(function() {
    'use strict';

    // ============================================================================
    // EXERCISE DEFINITIONS
    // ============================================================================

    const EXERCISES = {
        // ========================================
        // LEVEL 1: BEGINNER (Q1-Q10)
        // ========================================

        'q1-divisible': {
            id: 'q1-divisible',
            type: 'output-only',
            level: 1,
            title: '7로 나누어지고 5로 나누어지지 않는 수',
            description: '2000부터 3200 사이의 숫자 중 7로 나누어지고 5로 나누어지지 않는 모든 숫자를 찾아 콤마로 구분하여 출력하세요.',
            expected: '2002,2009,2016,2023,2037,2044,2051,2058,2072,2079,2086,2093,2107,2114,2121,2128,2142,2149,2156,2163,2177,2184,2191,2198,2212,2219,2226,2233,2247,2254,2261,2268,2282,2289,2296,2303,2317,2324,2331,2338,2352,2359,2366,2373,2387,2394,2401,2408,2422,2429,2436,2443,2457,2464,2471,2478,2492,2499,2506,2513,2527,2534,2541,2548,2562,2569,2576,2583,2597,2604,2611,2618,2632,2639,2646,2653,2667,2674,2681,2688,2702,2709,2716,2723,2737,2744,2751,2758,2772,2779,2786,2793,2807,2814,2821,2828,2842,2849,2856,2863,2877,2884,2891,2898,2912,2919,2926,2933,2947,2954,2961,2968,2982,2989,2996,3003,3017,3024,3031,3038,3052,3059,3066,3073,3087,3094,3101,3108,3122,3129,3136,3143,3157,3164,3171,3178,3192,3199',
            compareMode: 'exact',
            starterCode: '# 2000부터 3200 사이의 숫자 중\n# 7로 나누어지고 5로 나누어지지 않는 수를 찾으세요\n# 결과를 콤마로 구분하여 한 줄에 출력하세요\n\nresult = []\nfor n in range(2000, 3201):\n    # 여기에 조건을 작성하세요\n    pass\n\nprint(",".join([str(x) for x in result]))\n',
            hints: [
                'range(2000, 3201)을 사용하세요 (3200 포함)',
                'n % 7 == 0 으로 7로 나누어지는지 확인',
                'n % 5 != 0 으로 5로 나누어지지 않는지 확인',
                'and 로 두 조건을 연결하세요'
            ]
        },

        'q2-factorial': {
            id: 'q2-factorial',
            type: 'function',
            level: 1,
            title: '팩토리얼 계산',
            description: '주어진 숫자의 팩토리얼을 계산하는 함수를 작성하세요. 팩토리얼은 n! = n × (n-1) × ... × 2 × 1 입니다.',
            functionName: 'factorial',
            testCases: [
                { args: [5], expected: '120' },
                { args: [0], expected: '1' },
                { args: [1], expected: '1' },
                { args: [10], expected: '3628800' }
            ],
            starterCode: 'def factorial(n):\n    """n의 팩토리얼을 계산합니다.\n    \n    예: factorial(5) = 5 * 4 * 3 * 2 * 1 = 120\n    """\n    # 여기에 코드를 작성하세요\n    pass\n',
            hints: [
                '0! = 1, 1! = 1 입니다 (기저 조건)',
                '재귀: return n * factorial(n-1)',
                '반복문: result *= i for i in range(1, n+1)'
            ]
        },

        'q3-dict-squares': {
            id: 'q3-dict-squares',
            type: 'with-input',
            level: 1,
            title: '제곱 딕셔너리',
            description: '숫자 n을 입력받아 1부터 n까지의 숫자와 그 제곱을 딕셔너리로 만들어 출력하세요.',
            mockInputs: ['8'],
            expected: '{1: 1, 2: 4, 3: 9, 4: 16, 5: 25, 6: 36, 7: 49, 8: 64}',
            compareMode: 'structural',
            starterCode: '# 숫자 n을 입력받아\n# {1: 1, 2: 4, 3: 9, ...} 형태의 딕셔너리를 출력하세요\n\nn = int(input())\n\n# 여기에 코드를 작성하세요\n',
            hints: [
                '딕셔너리 컴프리헨션: {i: i**2 for i in range(...)}',
                'range(1, n+1)로 1부터 n까지',
                '또는 반복문으로 d[i] = i**2'
            ]
        },

        'q4-parse-input': {
            id: 'q4-parse-input',
            type: 'with-input',
            level: 1,
            title: '입력 파싱하기',
            description: '콤마로 구분된 단어들을 입력받아 리스트와 튜플로 각각 출력하세요.',
            mockInputs: ['hello,world,test'],
            expected: "['hello', 'world', 'test']\n('hello', 'world', 'test')",
            compareMode: 'normalized',
            starterCode: '# 콤마로 구분된 입력을 받아\n# 리스트와 튜플로 출력하세요\n\ndata = input()\n\n# 여기에 코드를 작성하세요\n',
            hints: [
                'split(",")으로 콤마 기준 분리',
                'list()로 리스트 변환',
                'tuple()로 튜플 변환'
            ]
        },

        'q5-divisible-5-7': {
            id: 'q5-divisible-5-7',
            type: 'output-only',
            level: 1,
            title: '5와 7로 나누어지는 수',
            description: '0부터 100 사이에서 5로도 나누어지고 7로도 나누어지는 모든 숫자를 콤마로 구분하여 출력하세요.',
            expected: '0,35,70',
            compareMode: 'exact',
            starterCode: '# 0부터 100 사이에서\n# 5로도 나누어지고 7로도 나누어지는 수를 찾으세요\n\nresult = []\nfor n in range(101):\n    # 여기에 조건을 작성하세요\n    pass\n\nprint(",".join([str(x) for x in result]))\n',
            hints: [
                'range(101)로 0부터 100까지',
                'n % 5 == 0 and n % 7 == 0',
                '5와 7의 최소공배수는 35'
            ]
        },

        'q6-even-count': {
            id: 'q6-even-count',
            type: 'with-input',
            level: 1,
            title: '짝수 개수 세기',
            description: '숫자 n을 입력받아 0부터 n까지 짝수의 개수를 출력하세요.',
            mockInputs: ['10'],
            expected: '6',
            compareMode: 'exact',
            starterCode: '# 숫자 n을 입력받아\n# 0부터 n까지 짝수의 개수를 출력하세요\n\nn = int(input())\n\n# 여기에 코드를 작성하세요\n',
            hints: [
                '0도 짝수입니다',
                'n % 2 == 0 이면 짝수',
                '0부터 n까지이므로 (n // 2) + 1'
            ]
        },

        'q7-squares-sum': {
            id: 'q7-squares-sum',
            type: 'function',
            level: 1,
            title: '제곱의 합',
            description: '1부터 n까지 모든 숫자의 제곱의 합을 계산하는 함수를 작성하세요.',
            functionName: 'sum_of_squares',
            testCases: [
                { args: [5], expected: '55' },
                { args: [1], expected: '1' },
                { args: [10], expected: '385' },
                { args: [3], expected: '14' }
            ],
            starterCode: 'def sum_of_squares(n):\n    """1부터 n까지 제곱의 합을 계산합니다.\n    \n    예: sum_of_squares(3) = 1 + 4 + 9 = 14\n    """\n    # 여기에 코드를 작성하세요\n    pass\n',
            hints: [
                'sum() 함수 사용 가능',
                'sum(i**2 for i in range(1, n+1))',
                '공식: n(n+1)(2n+1)/6'
            ]
        },

        'q8-palindrome': {
            id: 'q8-palindrome',
            type: 'function',
            level: 1,
            title: '회문 판별',
            description: '주어진 문자열이 회문(앞뒤가 같은 문자열)인지 판별하는 함수를 작성하세요.',
            functionName: 'is_palindrome',
            testCases: [
                { args: ['radar'], expected: 'True' },
                { args: ['hello'], expected: 'False' },
                { args: ['level'], expected: 'True' },
                { args: ['a'], expected: 'True' }
            ],
            starterCode: 'def is_palindrome(s):\n    """문자열이 회문인지 판별합니다.\n    \n    회문: 앞에서 읽으나 뒤에서 읽으나 같은 문자열\n    예: "radar", "level"\n    """\n    # 여기에 코드를 작성하세요\n    pass\n',
            hints: [
                '문자열 뒤집기: s[::-1]',
                's == s[::-1] 이면 회문',
                '대소문자 무시: s.lower()'
            ]
        },

        'q9-fizzbuzz': {
            id: 'q9-fizzbuzz',
            type: 'output-only',
            level: 1,
            title: 'FizzBuzz',
            description: '1부터 15까지 숫자를 출력하되, 3의 배수이면 "Fizz", 5의 배수이면 "Buzz", 15의 배수이면 "FizzBuzz"를 출력하세요.',
            expected: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
            compareMode: 'exact',
            starterCode: '# FizzBuzz 게임\n# 1부터 15까지 출력하되:\n# - 3의 배수: "Fizz"\n# - 5의 배수: "Buzz"\n# - 15의 배수: "FizzBuzz"\n# - 그 외: 숫자 그대로\n\nfor i in range(1, 16):\n    # 여기에 코드를 작성하세요\n    pass\n',
            hints: [
                '15의 배수를 먼저 확인 (3과 5 모두의 배수)',
                'elif 순서가 중요합니다',
                'i % 15 == 0, i % 3 == 0, i % 5 == 0'
            ]
        },

        'q10-reverse-string': {
            id: 'q10-reverse-string',
            type: 'function',
            level: 1,
            title: '문자열 뒤집기',
            description: '주어진 문자열을 뒤집어서 반환하는 함수를 작성하세요.',
            functionName: 'reverse_string',
            testCases: [
                { args: ['hello'], expected: 'olleh' },
                { args: ['Python'], expected: 'nohtyP' },
                { args: ['a'], expected: 'a' },
                { args: [''], expected: '' }
            ],
            starterCode: 'def reverse_string(s):\n    """문자열을 뒤집어서 반환합니다.\n    \n    예: reverse_string("hello") -> "olleh"\n    """\n    # 여기에 코드를 작성하세요\n    pass\n',
            hints: [
                '슬라이싱: s[::-1]',
                '또는 reversed()와 join() 사용',
                '"".join(reversed(s))'
            ]
        },

        // ========================================
        // LEVEL 2: INTERMEDIATE (Q11-Q20)
        // ========================================

        'q11-sort-words': {
            id: 'q11-sort-words',
            type: 'with-input',
            level: 2,
            title: '단어 정렬하기',
            description: '공백으로 구분된 단어들을 입력받아 알파벳 순으로 정렬하여 출력하세요.',
            mockInputs: ['banana apple cherry date'],
            expected: 'apple banana cherry date',
            compareMode: 'exact',
            starterCode: '# 공백으로 구분된 단어들을 입력받아\n# 알파벳 순으로 정렬하여 출력하세요\n\nwords = input()\n\n# 여기에 코드를 작성하세요\n',
            hints: [
                'split()으로 단어 분리',
                'sorted()로 정렬',
                '" ".join()으로 다시 합치기'
            ]
        },

        'q12-even-digits': {
            id: 'q12-even-digits',
            type: 'output-only',
            level: 2,
            title: '모든 자릿수가 짝수인 숫자',
            description: '1000부터 3000 사이에서 모든 자릿수가 짝수인 숫자를 찾아 콤마로 구분하여 출력하세요.',
            expected: '2000,2002,2004,2006,2008,2020,2022,2024,2026,2028,2040,2042,2044,2046,2048,2060,2062,2064,2066,2068,2080,2082,2084,2086,2088,2200,2202,2204,2206,2208,2220,2222,2224,2226,2228,2240,2242,2244,2246,2248,2260,2262,2264,2266,2268,2280,2282,2284,2286,2288,2400,2402,2404,2406,2408,2420,2422,2424,2426,2428,2440,2442,2444,2446,2448,2460,2462,2464,2466,2468,2480,2482,2484,2486,2488,2600,2602,2604,2606,2608,2620,2622,2624,2626,2628,2640,2642,2644,2646,2648,2660,2662,2664,2666,2668,2680,2682,2684,2686,2688,2800,2802,2804,2806,2808,2820,2822,2824,2826,2828,2840,2842,2844,2846,2848,2860,2862,2864,2866,2868,2880,2882,2884,2886,2888',
            compareMode: 'exact',
            starterCode: '# 1000부터 3000 사이에서\n# 모든 자릿수가 짝수인 숫자를 찾으세요\n\nresult = []\nfor n in range(1000, 3001):\n    # 여기에 코드를 작성하세요\n    pass\n\nprint(",".join([str(x) for x in result]))\n',
            hints: [
                'str(n)으로 문자열로 변환',
                'all()과 제너레이터 표현식 사용',
                'int(digit) % 2 == 0 으로 짝수 확인'
            ]
        },

        'q13-count-letters': {
            id: 'q13-count-letters',
            type: 'with-input',
            level: 2,
            title: '문자 개수 세기',
            description: '문장을 입력받아 대문자와 소문자의 개수를 각각 출력하세요.',
            mockInputs: ['Hello World!'],
            expected: 'UPPER: 2\nLOWER: 8',
            compareMode: 'exact',
            starterCode: '# 문장을 입력받아\n# 대문자와 소문자의 개수를 각각 출력하세요\n\nsentence = input()\n\n# 여기에 코드를 작성하세요\n',
            hints: [
                'isupper()로 대문자 확인',
                'islower()로 소문자 확인',
                'sum()과 제너레이터 사용 가능'
            ]
        },

        'q14-fibonacci': {
            id: 'q14-fibonacci',
            type: 'function',
            level: 2,
            title: '피보나치 수열',
            description: 'n번째 피보나치 수를 반환하는 함수를 작성하세요. (0번째=0, 1번째=1)',
            functionName: 'fibonacci',
            testCases: [
                { args: [0], expected: '0' },
                { args: [1], expected: '1' },
                { args: [10], expected: '55' },
                { args: [15], expected: '610' }
            ],
            starterCode: 'def fibonacci(n):\n    """n번째 피보나치 수를 반환합니다.\n    \n    피보나치: 0, 1, 1, 2, 3, 5, 8, 13, ...\n    fib(0)=0, fib(1)=1, fib(n)=fib(n-1)+fib(n-2)\n    """\n    # 여기에 코드를 작성하세요\n    pass\n',
            hints: [
                '기저 조건: n이 0이면 0, 1이면 1',
                '재귀: fibonacci(n-1) + fibonacci(n-2)',
                '반복문이 더 효율적'
            ]
        },

        'q15-prime-check': {
            id: 'q15-prime-check',
            type: 'function',
            level: 2,
            title: '소수 판별',
            description: '주어진 숫자가 소수인지 판별하는 함수를 작성하세요.',
            functionName: 'is_prime',
            testCases: [
                { args: [2], expected: 'True' },
                { args: [17], expected: 'True' },
                { args: [1], expected: 'False' },
                { args: [15], expected: 'False' }
            ],
            starterCode: 'def is_prime(n):\n    """숫자가 소수인지 판별합니다.\n    \n    소수: 1과 자기 자신만으로 나누어지는 수\n    예: 2, 3, 5, 7, 11, 13, ...\n    """\n    # 여기에 코드를 작성하세요\n    pass\n',
            hints: [
                '1은 소수가 아닙니다',
                '2부터 sqrt(n)까지만 확인하면 됨',
                '나누어 떨어지면 소수가 아님'
            ]
        },

        'q16-word-frequency': {
            id: 'q16-word-frequency',
            type: 'with-input',
            level: 2,
            title: '단어 빈도수',
            description: '문장을 입력받아 각 단어의 빈도수를 딕셔너리로 출력하세요.',
            mockInputs: ['hello world hello'],
            expected: "{'hello': 2, 'world': 1}",
            compareMode: 'structural',
            starterCode: '# 문장을 입력받아\n# 각 단어의 빈도수를 딕셔너리로 출력하세요\n\nsentence = input()\n\n# 여기에 코드를 작성하세요\n',
            hints: [
                'split()으로 단어 분리',
                'dict.get(word, 0) + 1 로 카운트',
                'collections.Counter 사용 가능'
            ]
        },

        'q17-list-unique': {
            id: 'q17-list-unique',
            type: 'function',
            level: 2,
            title: '중복 제거',
            description: '리스트에서 중복을 제거한 새 리스트를 반환하는 함수를 작성하세요. (순서 유지)',
            functionName: 'remove_duplicates',
            testCases: [
                { args: [[1, 2, 2, 3, 3, 3]], expected: '[1, 2, 3]' },
                { args: [['a', 'b', 'a', 'c']], expected: "['a', 'b', 'c']" },
                { args: [[1]], expected: '[1]' },
                { args: [[]], expected: '[]' }
            ],
            starterCode: 'def remove_duplicates(lst):\n    """리스트에서 중복을 제거합니다. (순서 유지)\n    \n    예: [1, 2, 2, 3] -> [1, 2, 3]\n    """\n    # 여기에 코드를 작성하세요\n    pass\n',
            hints: [
                '빈 리스트와 set() 사용',
                'if item not in seen: 추가',
                'dict.fromkeys(lst) 트릭 사용 가능'
            ]
        },

        'q18-binary-search': {
            id: 'q18-binary-search',
            type: 'function',
            level: 2,
            title: '이진 탐색',
            description: '정렬된 리스트에서 값의 인덱스를 찾는 이진 탐색 함수를 작성하세요. 없으면 -1 반환.',
            functionName: 'binary_search',
            testCases: [
                { args: [[1, 2, 3, 4, 5], 3], expected: '2' },
                { args: [[1, 2, 3, 4, 5], 6], expected: '-1' },
                { args: [[1, 3, 5, 7, 9], 7], expected: '3' },
                { args: [[], 1], expected: '-1' }
            ],
            starterCode: 'def binary_search(lst, target):\n    """정렬된 리스트에서 target의 인덱스를 찾습니다.\n    \n    없으면 -1을 반환합니다.\n    시간 복잡도: O(log n)\n    """\n    # 여기에 코드를 작성하세요\n    pass\n',
            hints: [
                'left, right 포인터 사용',
                'mid = (left + right) // 2',
                'target과 비교하여 범위 조정'
            ]
        },

        'q19-max-in-list': {
            id: 'q19-max-in-list',
            type: 'function',
            level: 2,
            title: '최댓값 찾기 (내장함수 없이)',
            description: 'max() 내장 함수를 사용하지 않고 리스트에서 최댓값을 찾는 함수를 작성하세요.',
            functionName: 'find_max',
            testCases: [
                { args: [[3, 1, 4, 1, 5, 9, 2, 6]], expected: '9' },
                { args: [[-5, -2, -8, -1]], expected: '-1' },
                { args: [[42]], expected: '42' },
                { args: [[1, 1, 1]], expected: '1' }
            ],
            starterCode: 'def find_max(lst):\n    """리스트에서 최댓값을 찾습니다. (max() 사용 금지)\n    \n    예: [3, 1, 4, 1, 5] -> 5\n    """\n    # 여기에 코드를 작성하세요\n    # max() 함수를 사용하지 마세요!\n    pass\n',
            hints: [
                '첫 번째 요소를 최댓값으로 초기화',
                '반복하면서 더 큰 값 발견시 갱신',
                'if num > max_val: max_val = num'
            ]
        },

        'q20-gcd': {
            id: 'q20-gcd',
            type: 'function',
            level: 2,
            title: '최대공약수 (GCD)',
            description: '두 숫자의 최대공약수를 구하는 함수를 작성하세요.',
            functionName: 'gcd',
            testCases: [
                { args: [12, 18], expected: '6' },
                { args: [17, 13], expected: '1' },
                { args: [100, 25], expected: '25' },
                { args: [7, 7], expected: '7' }
            ],
            starterCode: 'def gcd(a, b):\n    """두 숫자의 최대공약수를 구합니다.\n    \n    유클리드 호제법 사용\n    예: gcd(12, 18) = 6\n    """\n    # 여기에 코드를 작성하세요\n    pass\n',
            hints: [
                '유클리드 호제법: gcd(a, b) = gcd(b, a % b)',
                'b가 0이 되면 a가 GCD',
                'while b != 0: a, b = b, a % b'
            ]
        },

        // ========================================
        // LEVEL 3: ADVANCED (Q21+)
        // ========================================

        'q21-merge-sort': {
            id: 'q21-merge-sort',
            type: 'function',
            level: 3,
            title: '병합 정렬',
            description: '병합 정렬 알고리즘을 구현하세요.',
            functionName: 'merge_sort',
            testCases: [
                { args: [[5, 2, 8, 1, 9]], expected: '[1, 2, 5, 8, 9]' },
                { args: [[1]], expected: '[1]' },
                { args: [[3, 1, 2]], expected: '[1, 2, 3]' },
                { args: [[]], expected: '[]' }
            ],
            starterCode: 'def merge_sort(lst):\n    """병합 정렬로 리스트를 정렬합니다.\n    \n    분할 정복 알고리즘\n    시간 복잡도: O(n log n)\n    """\n    # 여기에 코드를 작성하세요\n    pass\n',
            hints: [
                '길이가 1 이하면 그대로 반환',
                '반으로 나누어 재귀 호출',
                '두 정렬된 리스트를 병합'
            ]
        },

        'q22-matrix-multiply': {
            id: 'q22-matrix-multiply',
            type: 'function',
            level: 3,
            title: '행렬 곱셈',
            description: '두 행렬의 곱을 계산하는 함수를 작성하세요.',
            functionName: 'matrix_multiply',
            testCases: [
                { args: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]], expected: '[[19, 22], [43, 50]]' },
                { args: [[[1, 0], [0, 1]], [[5, 6], [7, 8]]], expected: '[[5, 6], [7, 8]]' },
                { args: [[[2]], [[3]]], expected: '[[6]]' }
            ],
            starterCode: 'def matrix_multiply(A, B):\n    """두 행렬의 곱을 계산합니다.\n    \n    A: m x n 행렬\n    B: n x p 행렬\n    결과: m x p 행렬\n    """\n    # 여기에 코드를 작성하세요\n    pass\n',
            hints: [
                '결과 행렬 크기: len(A) x len(B[0])',
                'C[i][j] = sum(A[i][k] * B[k][j])',
                '3중 for 루프 필요'
            ]
        },

        'q52-circle-class': {
            id: 'q52-circle-class',
            type: 'class',
            level: 3,
            title: 'Circle 클래스',
            description: '반지름을 받아 면적과 둘레를 계산하는 Circle 클래스를 작성하세요.',
            className: 'Circle',
            testCases: [
                { setup: 'c = Circle(5)', call: 'print(round(c.area(), 2))', expected: '78.54' },
                { setup: 'c = Circle(10)', call: 'print(round(c.area(), 2))', expected: '314.16' },
                { setup: 'c = Circle(1)', call: 'print(round(c.area(), 2))', expected: '3.14' }
            ],
            starterCode: 'import math\n\nclass Circle:\n    def __init__(self, r):\n        """반지름 r로 Circle을 초기화합니다."""\n        # 여기에 코드를 작성하세요\n        pass\n    \n    def area(self):\n        """원의 면적을 반환합니다. (π × r²)"""\n        # 여기에 코드를 작성하세요\n        pass\n',
            hints: [
                'self.radius = r 로 저장',
                'math.pi * self.radius ** 2',
                '__init__에서 속성 초기화'
            ]
        },

        'q53-rectangle-class': {
            id: 'q53-rectangle-class',
            type: 'class',
            level: 3,
            title: 'Rectangle 클래스',
            description: '가로와 세로를 받아 면적과 둘레를 계산하는 Rectangle 클래스를 작성하세요.',
            className: 'Rectangle',
            testCases: [
                { setup: 'r = Rectangle(5, 10)', call: 'print(r.area())', expected: '50' },
                { setup: 'r = Rectangle(5, 10)', call: 'print(r.perimeter())', expected: '30' },
                { setup: 'r = Rectangle(3, 4)', call: 'print(r.area())', expected: '12' }
            ],
            starterCode: 'class Rectangle:\n    def __init__(self, width, height):\n        """가로 width, 세로 height로 Rectangle을 초기화합니다."""\n        # 여기에 코드를 작성하세요\n        pass\n    \n    def area(self):\n        """사각형의 면적을 반환합니다."""\n        # 여기에 코드를 작성하세요\n        pass\n    \n    def perimeter(self):\n        """사각형의 둘레를 반환합니다."""\n        # 여기에 코드를 작성하세요\n        pass\n',
            hints: [
                'self.width, self.height 저장',
                '면적 = 가로 × 세로',
                '둘레 = 2 × (가로 + 세로)'
            ]
        },

        'q54-stack-class': {
            id: 'q54-stack-class',
            type: 'class',
            level: 3,
            title: 'Stack 클래스',
            description: 'push, pop, peek, is_empty 메서드를 가진 Stack 클래스를 구현하세요.',
            className: 'Stack',
            testCases: [
                { setup: 's = Stack()\ns.push(1)\ns.push(2)', call: 'print(s.peek())', expected: '2' },
                { setup: 's = Stack()\ns.push(1)\ns.push(2)', call: 'print(s.pop())', expected: '2' },
                { setup: 's = Stack()', call: 'print(s.is_empty())', expected: 'True' }
            ],
            starterCode: 'class Stack:\n    def __init__(self):\n        """빈 스택을 초기화합니다."""\n        # 여기에 코드를 작성하세요\n        pass\n    \n    def push(self, item):\n        """스택에 아이템을 추가합니다."""\n        # 여기에 코드를 작성하세요\n        pass\n    \n    def pop(self):\n        """스택에서 아이템을 제거하고 반환합니다."""\n        # 여기에 코드를 작성하세요\n        pass\n    \n    def peek(self):\n        """스택의 맨 위 아이템을 반환합니다. (제거하지 않음)"""\n        # 여기에 코드를 작성하세요\n        pass\n    \n    def is_empty(self):\n        """스택이 비어있는지 확인합니다."""\n        # 여기에 코드를 작성하세요\n        pass\n',
            hints: [
                '내부적으로 리스트 사용: self.items = []',
                'push: append(), pop: pop()',
                'peek: self.items[-1]'
            ]
        }
    };

    // ============================================================================
    // FEEDBACK MESSAGES (Korean)
    // ============================================================================

    const FEEDBACK = {
        // Overall messages
        perfect: '🎉 완벽합니다! 모든 테스트를 통과했어요!',
        excellent: '👏 훌륭해요! 거의 다 맞았어요!',
        good: '👍 좋아요! 조금만 더 수정하면 됩니다.',
        partial: '일부 테스트만 통과했습니다. 다시 확인해보세요.',
        failed: '❌ 다시 시도해보세요.',
        error: '⚠️ 코드 실행 중 오류가 발생했습니다.',
        timeout: '⏰ 실행 시간이 초과되었습니다. 무한 루프가 있는지 확인하세요.',

        // Comparison feedback
        outputMatch: '✅ 출력이 정확히 일치합니다!',
        outputMismatch: '출력이 예상과 다릅니다.',
        structureMatch: '✅ 구조가 일치합니다!',
        structureMismatch: '출력 구조를 확인하세요.',
        numericMatch: '✅ 숫자 값이 정확합니다!',
        numericMismatch: '숫자 값이 다릅니다.',

        // Test case feedback
        allTestsPassed: '🎉 모든 테스트를 통과했습니다!',
        someTestsPassed: (passed, total) => `${total}개 중 ${passed}개 테스트 통과`,
        noTestsPassed: '모든 테스트를 통과하지 못했습니다.',

        // Error messages
        syntaxError: '문법 오류가 있습니다.',
        nameError: '정의되지 않은 변수나 함수를 사용했습니다.',
        typeError: '타입이 맞지 않습니다.',
        indexError: '인덱스가 범위를 벗어났습니다.',
        valueError: '값이 올바르지 않습니다.',
        runtimeError: '실행 중 오류가 발생했습니다.'
    };

    // ============================================================================
    // SCORE THRESHOLDS
    // ============================================================================

    const SCORE_THRESHOLDS = {
        perfect: 100,
        excellent: 90,
        good: 70,
        passing: 50
    };

    // ============================================================================
    // COMPARISON MODES
    // ============================================================================

    const COMPARE_MODES = {
        exact: 'exact',           // Exact string match
        normalized: 'normalized', // Ignore whitespace, case
        structural: 'structural', // Parse as data structure
        numeric: 'numeric',       // Allow float tolerance
        contains: 'contains'      // Check if expected is in actual
    };

    // ============================================================================
    // STORAGE
    // ============================================================================

    const STORAGE_PREFIX = 'text_exercise_';

    // ============================================================================
    // PUBLIC API
    // ============================================================================

    const TextGraderConfig = {
        // Exercise access
        getExercise: function(id) {
            return EXERCISES[id] || null;
        },

        getAllExercises: function() {
            return Object.values(EXERCISES);
        },

        getExercisesByLevel: function(level) {
            return Object.values(EXERCISES).filter(ex => ex.level === level);
        },

        // Feedback access
        getFeedback: function(key) {
            return FEEDBACK[key] || FEEDBACK.failed;
        },

        // Thresholds
        getScoreThreshold: function(level) {
            return SCORE_THRESHOLDS[level];
        },

        getOverallFeedback: function(score) {
            if (score >= SCORE_THRESHOLDS.perfect) return FEEDBACK.perfect;
            if (score >= SCORE_THRESHOLDS.excellent) return FEEDBACK.excellent;
            if (score >= SCORE_THRESHOLDS.good) return FEEDBACK.good;
            if (score >= SCORE_THRESHOLDS.passing) return FEEDBACK.partial;
            return FEEDBACK.failed;
        },

        // Storage
        getStorageKey: function(exerciseId) {
            return STORAGE_PREFIX + exerciseId;
        },

        // Constants
        COMPARE_MODES: COMPARE_MODES,
        EXERCISES: EXERCISES,
        FEEDBACK: FEEDBACK,
        SCORE_THRESHOLDS: SCORE_THRESHOLDS
    };

    // Export
    if (typeof window !== 'undefined') {
        window.TextGraderConfig = TextGraderConfig;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TextGraderConfig;
    }

})();
