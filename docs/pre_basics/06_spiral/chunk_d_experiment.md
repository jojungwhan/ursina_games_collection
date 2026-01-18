# D. 실험하기

**예상 시간**: 7분 | **이전**: [C. 91도의 비밀](chunk_c_91.md)

---

## 학습 목표

- 코드를 자유롭게 수정하며 실험할 수 있다
- 각도, 반복 횟수, 색상을 바꿔볼 수 있다
- 코드 실험을 두려워하지 않는다

---

## 핵심 개념

### 실험 1: 각도 바꾸기

```python
left(91)   # 나선형
left(90)   # 정사각형
left(120)  # 삼각형 패턴
left(144)  # 별 패턴
```

### 실험 2: 반복 횟수 바꾸기

```python
range(100)  # 짧은 나선형
range(300)  # 긴 나선형
range(500)  # 아주 긴 나선형
```

### 실험 3: 색상 바꾸기

```python
pencolor('yellow')  # 노란색
pencolor('red')     # 빨간색
pencolor('cyan')    # 청록색
pencolor('magenta') # 자홍색
```

---

## Blockly 활동

<div class="blockly-container">
    <div id="blocklyDiv" style="height: 480px; width: 55%;"></div>

    <div class="code-preview-container">
        <div class="preview-tabs">
            <button class="preview-tab active" data-tab="python">Python 코드</button>
            <button class="preview-tab" data-tab="flowchart">흐름도</button>
        </div>
        <div class="preview-content">
            <div id="pythonPanel" class="tab-panel active">
                <pre id="pythonCodeDisplay" class="python-code-view"># 블록을 추가하면 Python 코드가 여기에 표시됩니다...</pre>
            </div>
            <div id="flowchartPanel" class="tab-panel">
                <div id="mermaidDisplay" class="mermaid-container">
                    <div class="flowchart-placeholder">블록을 추가하면 흐름도가 여기에 표시됩니다...</div>
                </div>
            </div>
        </div>
    </div>
</div>

<div style="display: none;">
<xml id="toolbox">
  <category name="거북이 기본" colour="160">
    <block type="turtle_setup"></block>
    <block type="turtle_done"></block>
  </category>
  <category name="제어" colour="%{BKY_LOOPS_HUE}">
    <block type="controls_for">
      <value name="FROM">
        <shadow type="math_number">
          <field name="NUM">0</field>
        </shadow>
      </value>
      <value name="TO">
        <shadow type="math_number">
          <field name="NUM">200</field>
        </shadow>
      </value>
      <value name="BY">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
    </block>
  </category>
  <category name="이동" colour="120">
    <block type="turtle_forward">
      <value name="STEP">
        <shadow type="math_number">
          <field name="NUM">10</field>
        </shadow>
      </value>
    </block>
  </category>
  <category name="회전" colour="200">
    <block type="turtle_left">
      <value name="ANGLE">
        <shadow type="math_number">
          <field name="NUM">91</field>
        </shadow>
      </value>
    </block>
    <block type="turtle_right">
      <value name="ANGLE">
        <shadow type="math_number">
          <field name="NUM">144</field>
        </shadow>
      </value>
    </block>
  </category>
  <category name="펜" colour="290">
    <block type="turtle_pencolor"></block>
    <block type="turtle_bgcolor"></block>
  </category>
  <category name="효과" colour="230">
    <block type="turtle_speed"></block>
  </category>
  <category name="변수" colour="%{BKY_VARIABLES_HUE}" custom="VARIABLE"></category>
  <category name="숫자" colour="%{BKY_MATH_HUE}">
    <block type="math_number">
      <field name="NUM">91</field>
    </block>
    <block type="math_number">
      <field name="NUM">120</field>
    </block>
    <block type="math_number">
      <field name="NUM">144</field>
    </block>
  </category>
</xml>
</div>

<button onclick="runit()" style="background-color: #4db6ac; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 10px;">
  ▶ 실행하기
</button>

<div id="turtleCanvasContainer" style="margin-top: 1rem; border: 1px solid #ccc; display: inline-block;">
  <div id="mycanvas" style="width: 300px; height: 300px;"></div>
</div>

<pre id="outputCanvas" style="margin-top: 1rem;"></pre>

**미션**: 각도를 120도, 144도 등으로 바꿔보며 다양한 패턴을 만들어보세요!

---

## 최소 예제 코드

```python
from turtle import *

bgcolor('black')
pencolor('cyan')  # 청록색 실험!
speed(0)

for i in range(200):  # 200번 반복 실험!
    forward(i)
    left(120)  # 120도 실험!

done()
```

**결과**: 삼각형 패턴의 나선형이 그려집니다!

---

## 퀴즈

<div class="quiz-choice-type" data-answer="C">
    <div class="quiz-title">퀴즈: 실험 정신</div>
    <div class="quiz-question">
        코드를 실험할 때 가장 중요한 것은?
    </div>
    <div class="quiz-choices">
        <button class="quiz-choice-btn" data-value="A">A) 절대 코드를 바꾸지 않기</button>
        <button class="quiz-choice-btn" data-value="B">B) 선생님이 시킨 대로만 하기</button>
        <button class="quiz-choice-btn" data-value="C">C) 두려워하지 않고 다양하게 바꿔보기</button>
    </div>
    <div class="result-msg"></div>
</div>

---

## 축하합니다!

**파이널 프로젝트를 완성했습니다!**

이제 할 수 있는 것들:

- import로 라이브러리 불러오기
- 변수로 값 저장하기
- bgcolor, pencolor로 색상 설정하기
- range()로 숫자 묶음 만들기
- for 반복문으로 반복하기
- 변수 i를 그림에 활용하기
- 나선형 그리기
- 코드 실험하기

**축하합니다! Python 프로그래밍의 기초를 모두 배웠습니다!**

---

## 타이핑 연습

블록으로 배운 모든 내용을 직접 타이핑해보세요!

<a href="https://colab.research.google.com/github/jojungwhan/ursina_games_collection/blob/main/docs/notebooks/06_나선형_프로젝트.ipynb" target="_blank"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"></a>

---

**다음 단계**: [첫 번째 3D 앱](../../one_basics/01_hello/chunk_a_import.md)으로 Ursina 3D 게임을 만들어봅시다!
