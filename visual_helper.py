from ursina import *

class VisualLoop:
    def __init__(self, speed=0.1):
        self.speed = speed
        self.counter = 0  # 실행 순서를 세기 위한 카운터

    def show_step(self, x, y=None, z=None):
        """
        학생이 호출하는 함수.
        인자의 개수에 따라 1D, 2D, 3D를 자동으로 구분합니다.
        """
        self.counter += 1
        
        # 순차적으로 실행되도록 delay를 카운터 기반으로 설정
        delay_time = self.counter * self.speed

        if y is None and z is None:
            # 인자가 1개일 때 (1D: 선형/원형)
            invoke(self._create_1d, x, delay=delay_time)
        elif z is None:
            # 인자가 2개일 때 (2D: 평면)
            invoke(self._create_2d, x, y, delay=delay_time)
        else:
            # 인자가 3개일 때 (3D: 입체)
            invoke(self._create_3d, x, y, z, delay=delay_time)

    # --- 내부 로직 (학생들은 몰라도 됨) ---

    def _create_1d(self, i):
        # 1차원: 옆으로 길게 늘어선 큐브
        e = Entity(model='cube', color=color.hsv(0.6, 0.5, 0.8), scale=0.8)
        e.position = (i, 0, 0)
        e.animate_scale(0.8, duration=0.5, curve=curve.out_bounce)
        self._add_text(i, e.position)

    def _create_2d(self, x, y):
        # 2차원: 바닥에 타일 깔기 (x, z축 사용)
        e = Entity(model='cube', color=color.hsv(0.3, 0.6, 0.8), scale=0.9)
        e.position = (x, 0, y)  # y인자를 z축(깊이)에 사용
        e.animate_scale(0.9, duration=0.3, curve=curve.out_back)
        # 좌표 표시 텍스트 (예: "1, 3")
        self._add_text(f"{x},{y}", (x, 0.6, y), scale=2)

    def _create_3d(self, x, y, z):
        # 3차원: 공중에 쌓기
        e = Entity(model='cube', color=color.hsv(0.1, 0.7, 0.8), scale=0.9)
        e.position = (x, y, z)
        e.animate_scale(0.9, duration=0.3, curve=curve.out_back)
        # 3D는 텍스트가 너무 많으면 지저분하므로 생략하거나 작게 표시

    def _add_text(self, text, pos, scale=4):
        Text(text=str(text), position=pos, scale=scale, 
             color=color.black, billboard=True, origin=(0,0))
