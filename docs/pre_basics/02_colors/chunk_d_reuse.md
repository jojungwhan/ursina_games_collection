# D. 변수 재사용

**예상 시간**: 7분 | **이전**: [C. pencolor() 펜 색상](chunk_c_pencolor.md)

---

## 학습 목표

- 한 번 만든 변수를 여러 번 사용할 수 있다
- 변수를 사용하면 한 곳만 바꿔도 전체가 바뀐다는 것을 이해한다
- 변수를 사용하여 사각형을 그릴 수 있다

---

## 핵심 개념

### 변수 재사용의 장점

```python
size = 100       # 한 번만 정의
forward(size)    # 1번째 사용
forward(size)    # 2번째 사용
forward(size)    # 3번째 사용
forward(size)    # 4번째 사용
```

**변수를 사용하면:**
- 한 번만 숫자를 바꾸면 전체 크기가 변합니다!
- 코드가 더 읽기 쉽습니다
- 실수를 줄일 수 있습니다

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
  <category name="변수" colour="%{BKY_VARIABLES_HUE}" custom="VARIABLE"></category>
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
          <field name="NUM">90</field>
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
    <block type="turtle_bgcolor"></block>
  </category>
  <category name="숫자" colour="%{BKY_MATH_HUE}">
    <block type="math_number">
      <field name="NUM">100</field>
    </block>
    <block type="math_number">
      <field name="NUM">50</field>
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

**미션**: 변수 `size`를 만들고, 그 변수를 사용해서 사각형을 그려보세요!

---

## 최소 예제 코드

```python
from turtle import *

size = 100           # 변수 만들기
bgcolor('black')
pencolor('yellow')

forward(size)        # 1번째 변 (size = 100)
left(90)
forward(size)        # 2번째 변 (size = 100)
left(90)
forward(size)        # 3번째 변 (size = 100)
left(90)
forward(size)        # 4번째 변 (size = 100)

done()
```

**결과**: 한 변이 100인 노란색 사각형이 그려집니다!

---

## 퀴즈

<div class="quiz-input-type" data-answer="1">
    <div class="quiz-title">퀴즈: 변수의 힘</div>
    <div class="quiz-question">
        사각형 크기를 100에서 200으로 바꾸려면, 변수를 사용할 때 몇 군데를 바꿔야 하나요?
    </div>
    <input type="text" class="quiz-input" placeholder="숫자를 입력하세요">
    <button class="quiz-submit-btn">정답 확인</button>
    <div class="result-msg"></div>
</div>

---

## 디버그 클리닉

**문제**: 변수 이름을 잘못 썼어요!

**원인**: 대소문자가 다르거나 철자가 틀렸어요

**해결**: 변수 이름을 정확히 맞추세요

```python
# ❌ 변수 이름이 다름
size = 100
forward(Size)   # S가 대문자! 오류!

# ✅ 변수 이름 일치
size = 100
forward(size)   # s가 소문자 (일치!)
```

---

## 축하합니다!

모든 Chunk를 완료했습니다! 이제 할 수 있는 것들:

- 변수를 만들고 사용하기
- `bgcolor()`로 배경색 설정하기
- `pencolor()`로 펜 색상 설정하기
- 변수를 여러 번 재사용하기

---

## 타이핑 연습

블록으로 배운 내용을 직접 타이핑해보세요!

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/jojungwhan/ursina_games_collection/blob/main/docs/notebooks/02_예술가_도구.ipynb)

---

**다음 레슨**: [숫자 공장 (range 함수)](../03_range/chunk_a_basic.md)로 숫자 묶음을 만들어봅시다!
