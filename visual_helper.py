from ursina import *

class VisualLoop:
    def __init__(self, speed=0.5):
        """
        초기화 함수
        speed: 단계별 등장 속도 (기본 0.5초)
        """
        self.speed = speed

    def _create_visual(self, i, total):
        """
        실제로 화면에 그림을 그리는 내부 함수 (학생들은 몰라도 됨)
        """
        # 비율 계산 (0.0 ~ 1.0)
        t = i / total
        size = 4 * i

        # 1. 그리드 생성
        grid = Entity(
            model=Grid(size, size),
            scale=size,
            color=color.hsv(0, 0, .8, lerp(.8, 0, t)),
            rotation_x=75,
            y=i/1000
        )
        grid.animate_scale(size, duration=0.5, curve=curve.out_bounce)

        # 2. 그림자(서브 그리드) 생성
        subgrid = duplicate(grid)
        subgrid.model = Grid(size*4, size*4)
        subgrid.color = color.hsv(0, 0, .4, lerp(.8, 0, t))
        subgrid.animate_scale(size, duration=0.5, curve=curve.out_bounce)

        # 3. 숫자 텍스트 생성
        Text(
            text=str(i),
            position=(size/2, 1, 0),
            scale=4,
            color=color.black,
            billboard=True
        )
        
        print(f"Step {i}: Grid created!")

    def show_step(self, i, total=10):
        """
        학생들이 호출하는 함수.
        직접 만들지 않고 invoke를 사용해 예약을 걸어줍니다.
        """
        # 자동으로 시간차(delay)를 계산해서 실행
        invoke(self._create_visual, i, total, delay=i * self.speed)
