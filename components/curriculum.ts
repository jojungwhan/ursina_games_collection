/**
 * Curriculum Data Structure
 * Organized into two tracks: Python Basics and Visual Python
 */

import { Curriculum, Track } from './types';

export const curriculum: Curriculum = {
  tracks: [
    {
      id: 'track_basics',
      title: 'Python 기초',
      shortTitle: 'Python 기초',
      chapters: [
        {
          id: 0,
          title: '0. 기초 준비 (Turtle)',
          sections: [
            {
              id: 'turtle_basics',
              title: '거북이 조련사가 되어보자',
              items: [
                { id: 'chunk_a_done', title: 'A. 순차 실행과 done()', href: '/pre_basics/01_turtle/chunk_a_done/' },
                { id: 'chunk_b_import', title: 'B. import 라이브러리', href: '/pre_basics/01_turtle/chunk_b_import/' },
                { id: 'chunk_c_shape', title: 'C. shape() 모양', href: '/pre_basics/01_turtle/chunk_c_shape/' },
                { id: 'chunk_d_forward', title: 'D. forward() 이동', href: '/pre_basics/01_turtle/chunk_d_forward/' },
                { id: 'chunk_e_turn', title: 'E. right()/left() 회전', href: '/pre_basics/01_turtle/chunk_e_turn/' },
                { id: 'chunk_f_giyeok', title: 'F. ㄱ 모양', href: '/pre_basics/01_turtle/chunk_f_giyeok/' },
                { id: 'chunk_g_nieun', title: 'G. ㄴ 모양', href: '/pre_basics/01_turtle/chunk_g_nieun/' },
                { id: 'chunk_h_digeut', title: 'H. ㄷ 모양', href: '/pre_basics/01_turtle/chunk_h_digeut/' },
              ],
            },
            {
              id: 'artist_tools',
              title: '예술가의 도구들',
              items: [
                { id: 'chunk_a_variable', title: 'A. 변수란?', href: '/pre_basics/02_colors/chunk_a_variable/' },
                { id: 'chunk_b_bgcolor', title: 'B. bgcolor() 배경색', href: '/pre_basics/02_colors/chunk_b_bgcolor/' },
                { id: 'chunk_c_pencolor', title: 'C. pencolor() 펜 색상', href: '/pre_basics/02_colors/chunk_c_pencolor/' },
                { id: 'chunk_d_reuse', title: 'D. 변수 재사용', href: '/pre_basics/02_colors/chunk_d_reuse/' },
              ],
            },
            {
              id: 'number_factory',
              title: '숫자 공장',
              items: [
                { id: 'chunk_a_basic', title: 'A. range(n) 기본', href: '/pre_basics/03_range/chunk_a_basic/' },
                { id: 'chunk_b_zero', title: 'B. 0부터 시작', href: '/pre_basics/03_range/chunk_b_zero/' },
                { id: 'chunk_c_start_end', title: 'C. range(시작, 끝)', href: '/pre_basics/03_range/chunk_c_start_end/' },
                { id: 'chunk_d_step', title: 'D. range(시작, 끝, 간격)', href: '/pre_basics/03_range/chunk_d_step/' },
              ],
            },
            {
              id: 'loop_beauty',
              title: '반복의 미학',
              items: [
                { id: 'chunk_a_for_basic', title: 'A. for 반복문 기초', href: '/pre_basics/04_loop/chunk_a_for_basic/' },
                { id: 'chunk_b_indent', title: 'B. 들여쓰기', href: '/pre_basics/04_loop/chunk_b_indent/' },
                { id: 'chunk_c_pen', title: 'C. penup/pendown', href: '/pre_basics/04_loop/chunk_c_pen/' },
                { id: 'chunk_d_stamp', title: 'D. stamp() 도장', href: '/pre_basics/04_loop/chunk_d_stamp/' },
                { id: 'chunk_e_square', title: 'E. 사각형 그리기', href: '/pre_basics/04_loop/chunk_e_square/' },
                { id: 'chunk_f_star', title: 'F. 별 그리기', href: '/pre_basics/04_loop/chunk_f_star/' },
              ],
            },
            {
              id: 'evolving_loops',
              title: '진화하는 반복',
              items: [
                { id: 'chunk_a_intro', title: 'A. 반복 변수 i란?', href: '/pre_basics/05_variable_i/chunk_a_intro/' },
                { id: 'chunk_b_circle', title: 'B. circle(i) 원 그리기', href: '/pre_basics/05_variable_i/chunk_b_circle/' },
                { id: 'chunk_c_calculate', title: 'C. i를 계산에 사용', href: '/pre_basics/05_variable_i/chunk_c_calculate/' },
                { id: 'chunk_d_goto', title: 'D. goto(i*50, 0)', href: '/pre_basics/05_variable_i/chunk_d_goto/' },
              ],
            },
            {
              id: 'spiral_project',
              title: '파이널 프로젝트: 나선형',
              items: [
                { id: 'chunk_a_setup', title: 'A. 배경과 색상 설정', href: '/pre_basics/06_spiral/chunk_a_setup/' },
                { id: 'chunk_b_spiral', title: 'B. 나선형 코드 분석', href: '/pre_basics/06_spiral/chunk_b_spiral/' },
                { id: 'chunk_c_91', title: 'C. 91도의 비밀', href: '/pre_basics/06_spiral/chunk_c_91/' },
                { id: 'chunk_d_experiment', title: 'D. 실험하기', href: '/pre_basics/06_spiral/chunk_d_experiment/' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'track_visual',
      title: 'Python 비주얼 코딩',
      shortTitle: 'Visual Coding',
      chapters: [
        {
          id: 1,
          title: '1. 시작하기',
          sections: [
            {
              id: 'first_3d_app',
              title: '첫 번째 3D 앱',
              items: [
                { id: 'chunk_a_import', title: 'A. 라이브러리 불러오기', href: '/one_basics/01_hello/chunk_a_import/' },
                { id: 'chunk_b_app', title: 'B. 게임 창 만들기', href: '/one_basics/01_hello/chunk_b_app/' },
                { id: 'chunk_c_variable', title: 'C. 변수 선언', href: '/one_basics/01_hello/chunk_c_variable/' },
                { id: 'chunk_d_entity', title: 'D. Entity로 3D 큐브 만들기', href: '/one_basics/01_hello/chunk_d_entity/' },
                { id: 'chunk_e_complete', title: 'E. 완성 코드와 실행', href: '/one_basics/01_hello/chunk_e_complete/' },
              ],
            },
            {
              id: 'variables_args',
              title: '변수와 인자',
              items: [
                { id: 'chunk_a_args', title: 'A. Entity 인자 기초', href: '/one_basics/02_cube/chunk_a_args/' },
                { id: 'chunk_b_variable', title: 'B. 변수에 Entity 저장', href: '/one_basics/02_cube/chunk_b_variable/' },
                { id: 'chunk_c_loop', title: 'C. 반복문으로 여러 Entity', href: '/one_basics/02_cube/chunk_c_loop/' },
                { id: 'chunk_d_alpha_parent', title: 'D. alpha와 parent-child', href: '/one_basics/02_cube/chunk_d_alpha_parent/' },
                { id: 'chunk_e_method', title: 'E. 메서드와 완성 코드', href: '/one_basics/02_cube/chunk_e_method/' },
              ],
            },
          ],
        },
        {
          id: 2,
          title: '2. 제어문',
          sections: [
            {
              id: 'loops',
              title: '반복문',
              items: [
                { id: 'chunk_a_for', title: 'A. 반복문이란?', href: '/two_flow/01_loops/chunk_a_for/' },
                { id: 'chunk_b_range', title: 'B. range() 숫자 공장', href: '/two_flow/01_loops/chunk_b_range/' },
                { id: 'chunk_c_variable_i', title: 'C. 변수 i 바구니', href: '/two_flow/01_loops/chunk_c_variable_i/' },
                { id: 'chunk_d_indent', title: 'D. 들여쓰기', href: '/two_flow/01_loops/chunk_d_indent/' },
                { id: 'chunk_e_formula', title: 'E. 계산식 활용', href: '/two_flow/01_loops/chunk_e_formula/' },
              ],
            },
          ],
        },
        {
          id: 3,
          title: '3. 데이터 구조',
          sections: [
            {
              id: 'lists',
              title: '리스트',
              items: [
                { id: 'chunk_a_intro', title: 'A. 리스트란?', href: '/four_data/01_lists/chunk_a_intro/' },
                { id: 'chunk_b_create', title: 'B. 리스트 만들기', href: '/four_data/01_lists/chunk_b_create/' },
                { id: 'chunk_c_append', title: 'C. append()로 추가', href: '/four_data/01_lists/chunk_c_append/' },
                { id: 'chunk_d_remove', title: 'D. remove()로 제거', href: '/four_data/01_lists/chunk_d_remove/' },
                { id: 'chunk_e_loop', title: 'E. 반복문과 리스트', href: '/four_data/01_lists/chunk_e_loop/' },
              ],
            },
          ],
        },
        {
          id: 4,
          title: '4. 중첩 반복문, 2D 3D 배열',
          sections: [
            {
              id: 'nested_arrays',
              title: '핵심 주제',
              items: [
                { id: 'slow_motion', title: '조건문과 시간 제어', href: '/three_ursina_3d_intro/slow_motion/' },
                { id: 'platformer', title: '물리와 충돌 검사', href: '/three_ursina_3d_intro/platformer/' },
                { id: 'nested_loops_visualizer', title: '중첩 반복문 시각화', href: '/three_ursina_3d_intro/nested_loops_visualizer/' },
                { id: 'world_grid', title: '2D 배열과 그리드 생성', href: '/three_ursina_3d_intro/world_grid/' },
              ],
            },
          ],
        },
        {
          id: 5,
          title: '5. 함수로 게임 만들기',
          sections: [
            {
              id: 'functions',
              title: '핵심 주제',
              items: [
                { id: 'bullet_hell', title: '함수와 이벤트 처리', href: '/five_functions/bullet_hell/' },
                { id: 'shooter', title: '입력 처리와 충돌 검사', href: '/five_functions/shooter/' },
                { id: 'maze_timer', title: '재귀 함수와 지연 호출', href: '/five_functions/maze_timer/' },
                { id: 'column_graph', title: '콜백 함수와 딕셔너리', href: '/five_functions/column_graph/' },
              ],
            },
          ],
        },
        {
          id: 6,
          title: '6. 클래스 입문',
          sections: [
            {
              id: 'classes',
              title: '핵심 주제',
              items: [
                { id: 'fps_enemy', title: '클래스와 객체 생성', href: '/six_classes_intro/fps_enemy/' },
                { id: 'digging_player', title: '클래스 메서드와 속성', href: '/six_classes_intro/digging_player/' },
                { id: 'minecraft_block', title: '클래스 상속과 다형성', href: '/six_classes_intro/minecraft_block/' },
              ],
            },
          ],
        },
        {
          id: 7,
          title: '7. 2D 배열과 그리드',
          sections: [
            {
              id: 'grids',
              title: '핵심 주제',
              items: [
                { id: 'digging_grid', title: '2D 배열 접근과 수정', href: '/seven_2d_arrays_grids/digging_grid/' },
                { id: 'inventory_grid', title: '2D 배열과 데이터 관리', href: '/seven_2d_arrays_grids/inventory_grid/' },
                { id: 'minecraft_terrain', title: '2D 배열과 지형 생성', href: '/seven_2d_arrays_grids/minecraft_terrain/' },
              ],
            },
          ],
        },
        {
          id: 8,
          title: '8. 고급 프로젝트',
          sections: [
            {
              id: 'advanced',
              title: '핵심 주제',
              items: [
                { id: 'fps_complete', title: 'FPS 완성본', href: '/eight_advanced_projects/fps_complete/' },
                { id: 'minecraft_with_items', title: '아이템이 있는 마인크래프트', href: '/eight_advanced_projects/minecraft_with_items/' },
                { id: 'inventory_complete', title: '인벤토리 완성', href: '/eight_advanced_projects/inventory_complete/' },
              ],
            },
          ],
        },
        {
          id: 9,
          title: '기타',
          sections: [
            {
              id: 'misc',
              title: '부록',
              items: [
                { id: 'setup_guide', title: '설치 가이드', href: '/SETUP_GUIDE/' },
                { id: 'lesson_template', title: '문서 템플릿(개발용)', href: '/LESSON_TEMPLATE/' },
                { id: 'boilerplate', title: '종합 예제 페이지', href: '/BOILERPLATE_EXAMPLE/' },
                { id: 'blockly_demo', title: 'Blockly 코딩 환경', href: '/blockly_demo/' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Get track by ID
 */
export function getTrackById(trackId: string): Track | undefined {
  return curriculum.tracks.find(track => track.id === trackId);
}

/**
 * Determine which track a URL belongs to
 */
export function getTrackFromUrl(pathname: string): string {
  if (pathname.includes('/pre_basics/')) {
    return 'track_basics';
  }
  return 'track_visual';
}

/**
 * Find current navigation state from URL
 */
export function getNavigationStateFromUrl(pathname: string) {
  const trackId = getTrackFromUrl(pathname);
  const track = getTrackById(trackId);

  if (!track) return null;

  for (const chapter of track.chapters) {
    for (const section of chapter.sections) {
      for (const item of section.items) {
        if (pathname.includes(item.href.replace(/\/$/, ''))) {
          return {
            trackId,
            chapterId: chapter.id,
            sectionId: section.id,
            itemId: item.id,
          };
        }
      }
    }
  }

  return { trackId, chapterId: null, sectionId: null, itemId: null };
}
