# H. ㄷ 모양 그리기

**예상 시간**: 7분 | **이전**: [G. ㄴ 모양](chunk_g_nieun.md)

---

## 학습 목표

- 3개의 선을 조합하여 'ㄷ' 모양을 그릴 수 있다
- 복잡한 도형도 순서대로 분해하면 쉬워진다는 것을 이해한다
- 지금까지 배운 모든 것을 활용할 수 있다

---

## 핵심 개념

### 'ㄷ' 모양 분석

'ㄷ'은 세 개의 선으로 이루어져 있습니다:

1. **윗 가로선**
2. **세로선**
3. **아랫 가로선**

### 순서

```
1. 앞으로 이동 (윗 가로선)
2. 왼쪽 90도 회전
3. 앞으로 이동 (세로선)
4. 왼쪽 90도 회전
5. 앞으로 이동 (아랫 가로선)
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
  <category name="이동" colour="120">
    <block type="turtle_forward">
      <value name="STEP">
        <shadow type="math_number">
          <field name="NUM">100</field>
        </shadow>
      </value>
    </block>
    <block type="turtle_backward">
      <value name="STEP">
        <shadow type="math_number">
          <field name="NUM">50</field>
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
    <block type="turtle_penup"></block>
    <block type="turtle_pendown"></block>
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

**미션**: 'ㄷ' 모양을 그려보세요! (이동 → 왼쪽 회전 → 이동 → 왼쪽 회전 → 이동)

---

## 최소 예제 코드

```python
import turtle
t = turtle.Turtle()
t.shape("turtle")
t.forward(100)   # 윗 가로선
t.left(90)       # 아래 방향으로
t.forward(50)    # 세로선
t.left(90)       # 오른쪽 방향으로
t.forward(100)   # 아랫 가로선
turtle.done()
```

**결과**: 'ㄷ' 모양이 완성됩니다!

---

## 퀴즈

<div class="quiz-input-type" data-answer="3">
    <div class="quiz-title">퀴즈: 선의 개수</div>
    <div class="quiz-question">
        'ㄷ' 모양을 그리려면 `forward()`를 몇 번 써야 하나요?
    </div>
    <input type="text" class="quiz-input" placeholder="숫자를 입력하세요">
    <button class="quiz-submit-btn">정답 확인</button>
    <div class="result-msg"></div>
</div>

---

## 디버그 클리닉

**문제**: 'ㄷ'이 아니라 이상한 모양이 나와요!

**원인**: 회전 방향이 일관되지 않아요

**해결**: 모두 `left(90)`으로 통일하거나, 원하는 방향 확인!

```python
# ❌ 방향이 섞여있음
t.forward(100)
t.left(90)
t.forward(50)
t.right(90)      # 방향이 달라짐!
t.forward(100)

# ✅ 방향 통일
t.forward(100)
t.left(90)       # 왼쪽
t.forward(50)
t.left(90)       # 왼쪽 (일관성!)
t.forward(100)
```

---

## 축하합니다! 🎉

모든 Chunk를 완료했습니다! 이제 할 수 있는 것들:

- ✅ 순차 실행 이해
- ✅ import로 라이브러리 불러오기
- ✅ shape()로 모양 바꾸기
- ✅ forward()로 이동하기
- ✅ right()/left()로 회전하기
- ✅ 'ㄱ', 'ㄴ', 'ㄷ' 모양 그리기

---

## 타이핑 연습

블록으로 배운 내용을 직접 타이핑해보세요!

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/jojungwhan/ursina_games_collection/blob/main/docs/notebooks/01_거북이_조련사.ipynb)

---

**다음 레슨**: [색상과 변수](../02_colors/chunk_a_variable.md)로 더 멋진 그림을 그려봅시다!
