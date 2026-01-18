# D. range(시작, 끝, 간격)

**예상 시간**: 7분 | **이전**: [C. range(시작, 끝)](chunk_c_start_end.md)

---

## 학습 목표

- `range(시작, 끝, 간격)` 형태로 건너뛰기를 할 수 있다
- 짝수, 홀수 등의 패턴을 만들 수 있다
- 세 가지 range() 형태를 모두 사용할 수 있다

---

## 핵심 개념

### range(시작, 끝, 간격) 형태

```python
range(0, 10, 2)  # 0부터 9까지, 2씩 건너뛰기
```

**설명:**
- `0`: 시작 숫자
- `10`: 끝 숫자 (포함 안 됨!)
- `2`: 간격 (2씩 증가)
- 결과: 0, 2, 4, 6, 8

### 세 가지 range() 형태 요약

| 형태 | 예시 | 결과 |
|:---:|:---:|:---:|
| `range(끝)` | `range(5)` | 0, 1, 2, 3, 4 |
| `range(시작, 끝)` | `range(1, 6)` | 1, 2, 3, 4, 5 |
| `range(시작, 끝, 간격)` | `range(0, 10, 2)` | 0, 2, 4, 6, 8 |

---

## Blockly 활동

<div class="blockly-container">
    <div id="blocklyDiv" style="height: 420px; width: 55%;"></div>

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
          <field name="NUM">10</field>
        </shadow>
      </value>
      <value name="BY">
        <shadow type="math_number">
          <field name="NUM">2</field>
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
      <field name="NUM">0</field>
    </block>
    <block type="math_number">
      <field name="NUM">10</field>
    </block>
    <block type="math_number">
      <field name="NUM">2</field>
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

**미션**: 0부터 10까지 짝수만 출력해보세요! (0, 2, 4, 6, 8, 10)

---

## 최소 예제 코드

```python
from turtle import *

# 짝수 출력 (0, 2, 4, 6, 8)
for i in range(0, 10, 2):
    print(i)

done()
```

**결과:**
```
0
2
4
6
8
```

---

## 퀴즈

<div class="quiz-choice-type" data-answer="B">
    <div class="quiz-title">퀴즈: 간격 사용</div>
    <div class="quiz-question">
        0부터 20까지 5씩 건너뛰려면?
    </div>
    <div class="quiz-choices">
        <button class="quiz-choice-btn" data-value="A">A) range(0, 20, 5)</button>
        <button class="quiz-choice-btn" data-value="B">B) range(0, 21, 5)</button>
        <button class="quiz-choice-btn" data-value="C">C) range(5, 20)</button>
    </div>
    <div class="result-msg"></div>
</div>

---

## 디버그 클리닉

**문제**: `range(0, 10, 2)`로 10까지 포함하고 싶은데 10이 안 나와요!

**원인**: 끝 숫자는 포함되지 않습니다!

**해결**: 10을 포함하려면 끝 숫자를 11로!

```python
# ❌ 10이 안 나옴
for i in range(0, 10, 2):
    print(i)  # 0, 2, 4, 6, 8

# ✅ 10까지 포함
for i in range(0, 11, 2):  # 끝을 11로!
    print(i)  # 0, 2, 4, 6, 8, 10
```

---

## 축하합니다!

모든 Chunk를 완료했습니다! 이제 할 수 있는 것들:

- `range(n)`: 0부터 n-1까지
- `range(시작, 끝)`: 시작부터 끝-1까지
- `range(시작, 끝, 간격)`: 시작부터 끝-1까지 간격씩
- **"시작은 포함, 끝은 미포함"** 규칙 이해

---

## 타이핑 연습

블록으로 배운 내용을 직접 타이핑해보세요!

<a href="https://colab.research.google.com/github/jojungwhan/ursina_games_collection/blob/main/docs/notebooks/03_숫자_공장.ipynb" target="_blank"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"></a>

---

**다음 레슨**: [반복의 미학 (for 반복문)](../04_loop/chunk_a_for_basic.md)에서 반복문을 배워봅시다!
