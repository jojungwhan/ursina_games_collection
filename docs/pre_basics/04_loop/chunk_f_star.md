# F. 별 그리기

**예상 시간**: 7분 | **이전**: [E. 사각형 그리기](chunk_e_square.md)

---

## 학습 목표

- 반복문으로 별을 그릴 수 있다
- 별의 회전 각도(144도)를 이해한다
- 다양한 다각형을 그릴 수 있다

---

## 핵심 개념

### 별 = 5번 반복 + 144도

```python
for i in range(5):   # 5번 반복
    forward(100)     # 한 변
    right(144)       # 144도 회전
```

### 왜 144도인가?

```
별의 회전 각도 = 360 ÷ 5 × 2 = 144도

일반 오각형: 360 ÷ 5 = 72도
별 (건너뛰기): 72 × 2 = 144도
```

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
    <block type="turtle_done"></block>
  </category>
  <category name="제어" colour="%{BKY_LOOPS_HUE}">
    <block type="controls_repeat_ext">
      <value name="TIMES">
        <shadow type="math_number">
          <field name="NUM">5</field>
        </shadow>
      </value>
    </block>
  </category>
  <category name="이동" colour="120">
    <block type="turtle_forward">
      <value name="STEP">
        <shadow type="math_number">
          <field name="NUM">100</field>
        </shadow>
      </value>
    </block>
  </category>
  <category name="회전" colour="200">
    <block type="turtle_right">
      <value name="ANGLE">
        <shadow type="math_number">
          <field name="NUM">144</field>
        </shadow>
      </value>
    </block>
    <block type="turtle_left">
      <value name="ANGLE">
        <shadow type="math_number">
          <field name="NUM">90</field>
        </shadow>
      </value>
    </block>
  </category>
  <category name="펜" colour="290">
    <block type="turtle_pencolor"></block>
  </category>
  <category name="숫자" colour="%{BKY_MATH_HUE}">
    <block type="math_number">
      <field name="NUM">100</field>
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

**미션**: 5번 반복으로 별을 그려보세요! (forward 100, right 144)

---

## 최소 예제 코드

```python
from turtle import *

for i in range(5):   # 5번 반복
    forward(100)     # 앞으로 100
    right(144)       # 오른쪽 144도

done()
```

**결과**: 별이 그려집니다!

---

## 퀴즈

<div class="quiz-input-type" data-answer="144">
    <div class="quiz-title">퀴즈: 별 각도</div>
    <div class="quiz-question">
        별을 그릴 때 회전 각도는 몇 도인가요?<br>
        <em>힌트: 360 ÷ 5 × 2 = ?</em>
    </div>
    <input type="text" class="quiz-input" placeholder="숫자를 입력하세요">
    <button class="quiz-submit-btn">정답 확인</button>
    <div class="result-msg"></div>
</div>

---

## 디버그 클리닉

**문제**: 별이 아니라 오각형이 그려져요!

**원인**: 회전 각도가 72도 (오각형 각도)예요

**해결**: 별은 144도로 회전해야 해요!

```python
# ❌ 오각형 (72도)
for i in range(5):
    forward(100)
    right(72)   # 오각형

# ✅ 별 (144도)
for i in range(5):
    forward(100)
    right(144)  # 별!
```

---

## 축하합니다!

모든 Chunk를 완료했습니다! 이제 할 수 있는 것들:

- for 반복문 사용하기
- 들여쓰기로 반복할 코드 지정하기
- penup/pendown으로 펜 제어하기
- stamp()로 도장 찍기
- 사각형 그리기 (4번, 90도)
- 별 그리기 (5번, 144도)

---

## 타이핑 연습

블록으로 배운 내용을 직접 타이핑해보세요!

<a href="https://colab.research.google.com/github/jojungwhan/ursina_games_collection/blob/main/docs/notebooks/04_반복의_미학.ipynb" target="_blank"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"></a>

---

**다음 레슨**: [진화하는 반복 (변수 i 활용)](../05_variable_i/chunk_a_intro.md)에서 변수 i를 그림에 활용해봅시다!
