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
        
        # [수정] 텍스트 추가 (값: i)
        self._add_text(str(i), e.position, scale=4)

    def _create_2d(self, x, y):
        # 2차원: 바닥에 타일 깔기 (x, z축 사용)
        e = Entity(model='cube', color=color.hsv(0.3, 0.6, 0.8), scale=0.9)
        e.position = (x, 0, y)  # y인자를 z축(깊이)에 사용
        e.animate_scale(0.9, duration=0.3, curve=curve.out_back)
        
        # [수정] 텍스트 추가 (값: x,y) / 위치를 큐브보다 살짝 위(y+0.6)로
        self._add_text(f"{x},{y}", (x, 0.6, y), scale=2)

    def _create_3d(self, x, y, z):
        # 3차원: 공중에 쌓기
        e = Entity(model='cube', color=color.hsv(0.1, 0.7, 0.8), scale=0.9)
        e.position = (x, y, z)
        e.animate_scale(0.9, duration=0.3, curve=curve.out_back)
        
        # [수정] 기존 코드에서 빠져있던 3D 텍스트 추가
        # 텍스트가 너무 크면 겹치므로 scale을 1.5로 줄임
        self._add_text(f"{x},{y},{z}", (x, y, z), scale=1.5)

    def _add_text(self, text_str, pos, scale=4):
        # [수정] 텍스트가 큐브 안에 파묻히지 않게 항상 카메라를 보게 설정
        t = Text(text=text_str, position=pos, scale=scale, 
             color=color.black, billboard=True)
        
        # 텍스트의 중심점을 가운데로 맞춰서 정확한 위치에 뜨게 함
        t.origin = (0, 0)
