# A. 반복 변수 i란?

**예상 시간**: 5분 | **다음**: [B. circle(i) 원 그리기](chunk_b_circle.md)

---

## 학습 목표

- 반복 변수 `i`가 매번 다른 값을 가진다는 것을 이해한다
- `i`의 값 변화를 추적할 수 있다
- `i = 0`일 때 주의할 점을 이해한다

---

## 핵심 개념

### 반복 변수 i란?

`for` 반복문의 `i`는 **매번 다른 값**을 가집니다!

```python
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4 출력
```

!!! tip "i는 특별한 이름이 아니에요!"
    `i`는 관습적으로 많이 쓰는 이름일 뿐, 다른 이름도 가능해요:

    ```python
    for num in range(5):      # num도 OK!
        print(num)

    for count in range(5):    # count도 OK!
        print(count)
    ```

    프로그래머들이 `i`를 자주 쓰는 이유: **index**(순서)의 첫 글자!

### i 값의 변화 (추적표)

| 반복 | i 값 | 실행 |
|:---:|:---:|:---:|
| 1번째 | 0 | print(0) |
| 2번째 | 1 | print(1) |
| 3번째 | 2 | print(2) |
| 4번째 | 3 | print(3) |
| 5번째 | 4 | print(4) |

---

## Blockly 활동

<div class="blockly-container">
    <div id="blocklyDiv" style="height: 400px; width: 55%;"></div>

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
  <category name="텍스트" colour="%{BKY_TEXTS_HUE}">
    <block type="text_print"></block>
  </category>
  <category name="변수" colour="%{BKY_VARIABLES_HUE}" custom="VARIABLE"></category>
  <category name="숫자" colour="%{BKY_MATH_HUE}">
    <block type="math_number">
      <field name="NUM">5</field>
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

**미션**: for 블록으로 i 값을 0부터 4까지 출력해보세요!

---

## 최소 예제 코드

```python
from turtle import *

for i in range(5):
    print(i)      # i 값 출력
    forward(i)    # i만큼 이동 (0, 1, 2, 3, 4)

done()
```

**결과**: i 값이 0, 1, 2, 3, 4로 변하면서 출력됩니다!

---

## 퀴즈

<div class="quiz-choice-type" data-answer="A">
    <div class="quiz-title">퀴즈: 첫 번째 i 값</div>
    <div class="quiz-question">
        `for i in range(5):`에서 첫 번째 반복의 i 값은?
    </div>
    <div class="quiz-choices">
        <button class="quiz-choice-btn" data-value="A">A) 0</button>
        <button class="quiz-choice-btn" data-value="B">B) 1</button>
        <button class="quiz-choice-btn" data-value="C">C) 5</button>
    </div>
    <div class="result-msg"></div>
</div>

---

## 디버그 클리닉

**문제**: `forward(i)`인데 첫 번째 반복에서 안 움직여요!

**원인**: `i = 0`이면 `forward(0)` = "0만큼 이동" = 안 움직임!

**해결**: `range(1, 6)`을 사용하거나 `forward(i + 1)` 사용

```python
# ❌ 첫 번째에서 안 움직임
for i in range(5):
    forward(i)  # i=0이면 forward(0) → 안 움직임!

# ✅ 1부터 시작
for i in range(1, 6):
    forward(i)  # i=1부터 시작!
```

---

**다음 단계**: [B. circle(i) 원 그리기](chunk_b_circle.md) →
