# D. goto(i*50, 0)

**예상 시간**: 7분 | **이전**: [C. i를 계산에 사용](chunk_c_calculate.md)

---

## 학습 목표

- `goto(x, y)` 함수로 특정 위치로 이동할 수 있다
- `goto(i*50, 0)`으로 일정 간격 배치할 수 있다
- x, y 좌표 개념을 이해한다

---

## 핵심 개념

### goto() 함수

```python
goto(100, 50)  # x=100, y=50 위치로 이동
```

### 좌표 시스템

```
        y축 (위쪽 +)
          |
          |
    ------+------ x축 (오른쪽 +)
          |
          |
     (0,0) = 중앙
```

### goto(i*50, 0)으로 일정 간격

| i 값 | i*50 | 위치 |
|:---:|:---:|:---:|
| 0 | 0 | (0, 0) 중앙 |
| 1 | 50 | (50, 0) 오른쪽 |
| 2 | 100 | (100, 0) 더 오른쪽 |
| 3 | 150 | (150, 0) 더더 오른쪽 |

---

## Blockly 활동

<div class="blockly-container">
    <div id="blocklyDiv" style="height: 450px; width: 55%;"></div>

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
    <block type="turtle_shape"></block>
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
          <field name="NUM">4</field>
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
    <block type="turtle_goto">
      <value name="X">
        <shadow type="math_number">
          <field name="NUM">0</field>
        </shadow>
      </value>
      <value name="Y">
        <shadow type="math_number">
          <field name="NUM">0</field>
        </shadow>
      </value>
    </block>
  </category>
  <category name="펜" colour="290">
    <block type="turtle_penup"></block>
    <block type="turtle_stamp"></block>
  </category>
  <category name="변수" colour="%{BKY_VARIABLES_HUE}" custom="VARIABLE"></category>
  <category name="수학" colour="%{BKY_MATH_HUE}">
    <block type="math_number">
      <field name="NUM">50</field>
    </block>
    <block type="math_arithmetic"></block>
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

**미션**: `goto(i*50, 0)`와 `stamp()`로 일정 간격으로 도장을 찍어보세요!

---

## 최소 예제 코드

```python
from turtle import *

shape('turtle')
penup()

for i in range(5):
    goto(i * 50, 0)  # 0, 50, 100, 150, 200
    stamp()

done()
```

**결과**: 거북이 5마리가 일정 간격으로 배치됩니다!

---

## 퀴즈

<div class="quiz-choice-type" data-answer="B">
    <div class="quiz-title">퀴즈: 위치 계산</div>
    <div class="quiz-question">
        `i = 2`일 때 `goto(i*50, 0)`의 위치는?
    </div>
    <div class="quiz-choices">
        <button class="quiz-choice-btn" data-value="A">A) (50, 0)</button>
        <button class="quiz-choice-btn" data-value="B">B) (100, 0)</button>
        <button class="quiz-choice-btn" data-value="C">C) (150, 0)</button>
    </div>
    <div class="result-msg"></div>
</div>

---

## 디버그 클리닉

**문제**: 도장이 선으로 연결돼요!

**원인**: `penup()`을 안 했어요 (기본은 펜이 내려가 있음)

**해결**: `penup()` 먼저 호출

```python
# ❌ 선이 그려짐
for i in range(5):
    goto(i * 50, 0)  # 선으로 연결됨!
    stamp()

# ✅ 선 없이 이동
penup()  # 먼저 펜 올리기!
for i in range(5):
    goto(i * 50, 0)
    stamp()
```

---

## 축하합니다!

모든 Chunk를 완료했습니다! 이제 할 수 있는 것들:

- 반복 변수 i의 값 변화 이해
- circle(i)로 점점 커지는 원 그리기
- i를 계산에 사용 (i * 10, i + 1)
- goto(i*50, 0)으로 일정 간격 배치

---

## 타이핑 연습

블록으로 배운 내용을 직접 타이핑해보세요!

<a href="https://colab.research.google.com/github/jojungwhan/ursina_games_collection/blob/main/docs/notebooks/05_진화하는_반복.ipynb" target="_blank"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"></a>

---

**다음 레슨**: [파이널 프로젝트: 나선형](../06_spiral/chunk_a_setup.md)에서 모든 것을 합쳐봅시다!
