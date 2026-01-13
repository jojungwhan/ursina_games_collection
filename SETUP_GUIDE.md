# 프로젝트 설정 가이드

이 문서는 Python Ursina Games Collection 프로젝트를 설정하고 실행하는 방법을 설명합니다.

## 목차
1. [Git 설정](#git-설정)
2. [가상 환경 설정](#가상-환경-설정)
3. [의존성 설치](#의존성-설치)
4. [Python 파일 실행](#python-파일-실행)
5. [문제 해결](#문제-해결)

---

## Git 설정

### 1. 프로젝트 클론하기

처음 프로젝트를 클론할 때:

```bash
git clone https://github.com/jojungwhan/ursina_games_collection.git
cd ursina_games_collection
```

이미 클론된 경우:

```bash
cd ursina_games_collection
```

### 2. 최신 변경사항 가져오기

프로젝트를 최신 버전으로 업데이트하려면:

```bash
git pull origin main
```

기본 브랜치가 다른 경우:

```bash
git pull
```

### 3. Git 상태 확인

현재 변경사항을 확인하려면:

```bash
git status
```

### 4. 특정 브랜치로 전환

다른 브랜치로 전환하려면:

```bash
git checkout branch_name
```

---

## 가상 환경 설정

이 프로젝트는 독립적인 가상 환경을 사용하는 것을 권장합니다.

### Windows (PowerShell/CMD)

#### 메인 프로젝트 설정

```bash
# 프로젝트 루트 디렉토리로 이동
cd ursina_games_collection

# 가상 환경 생성
python -m venv venv

# 가상 환경 활성화
venv\Scripts\activate
```

**PowerShell 사용자는 실행 정책 설정이 필요할 수 있습니다:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
venv\Scripts\Activate.ps1
```

### Linux/Mac

```bash
# 가상 환경 생성
python3 -m venv venv

# 가상 환경 활성화
source venv/bin/activate
```

### 가상 환경 비활성화

작업이 끝나면 가상 환경을 비활성화할 수 있습니다:

```bash
deactivate
```

---

## 의존성 설치

가상 환경이 활성화된 상태에서 `requirements.txt`의 의존성을 설치합니다.

### 메인 프로젝트 의존성 설치

```bash
# 프로젝트 루트에서
venv\Scripts\activate  # Windows
# 또는 source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
```

### Python 버전 확인

Ursina는 Python 3.12 이상이 필요합니다:

```bash
python --version
```

### 설치되는 패키지

설치 후 다음 패키지들이 사용 가능합니다:

- **ursina** (>=8.2.0) - 게임 엔진
- **perlin_noise** (>=1.13) - minecraft_tut 지형 생성에 필요
- **panda3d** - 3D 엔진 (의존성)
- **panda3d-gltf** - GLTF 지원
- **panda3d-simplepbr** - PBR 렌더링
- **pillow** - 이미지 처리
- **pyperclip** - 클립보드 유틸리티
- **screeninfo** - 화면 정보
- **sswg** - 웹 생성기
- **typing_extensions** - 타입 힌트

---

## Python 파일 실행

가상 환경이 활성화된 상태에서 Python 파일을 실행합니다.

### 루트 디렉토리 게임

모든 게임은 프로젝트 루트 디렉토리에서 실행할 수 있습니다:

```bash
cd ursina_games_collection
venv\Scripts\activate  # Windows
# 또는 source venv/bin/activate  # Linux/Mac
```

#### 사용 가능한 게임

| 게임 | 설명 | 명령어 |
|------|------|--------|
| **breakout.py** | 클래식 브레이크아웃/벽돌 깨기 게임 | `python breakout.py` |
| **bullet_hell.py** | 파티클 효과가 있는 탄막 슈팅 게임 | `python bullet_hell.py` |
| **column_graph.py** | 인터랙티브 3D 컬럼 그래프 시각화 | `python column_graph.py` |
| **digging_game.py** | 2D 파기/채굴 게임 | `python digging_game.py` |
| **fps.py** | 적과 사격 메커니즘이 있는 1인칭 슈터 | `python fps.py` |
| **inventory.py** | 드래그 앤 드롭 인벤토리 시스템 데모 | `python inventory.py` |
| **maze.py** | 카운트다운 타이머가 있는 3D 미로 게임 | `python maze.py` |
| **platformer.py** | 부드러운 움직임의 2D 플랫포머 | `python platformer.py` |
| **shooter.py** | 움직이는 타겟이 있는 1인칭 사격장 | `python shooter.py` |
| **slow_motion.py** | 슬로우 모션 효과가 있는 FPS 데모 (Tab 키 누르기) | `python slow_motion.py` |
| **volumetric_cube.py** | 볼륨 큐브 렌더링 데모 | `python volumetric_cube.py` |
| **world_grid.py** | 월드 그리드 시각화 | `python world_grid.py` |

### 마인크래프트 튜토리얼

`minecraft_tut/` 폴더에 있는 마인크래프트 스타일의 복셀 월드 빌더입니다.

```bash
cd ursina_games_collection
venv\Scripts\activate  # Windows
# 또는 source venv/bin/activate  # Linux/Mac

# minecraft_tut 디렉토리로 이동
cd minecraft_tut

# 기본 버전 실행
python main.py

# 아이템이 있는 버전 실행 (양귀비 꽃 등)
python main_with_items.py
```

**minecraft_tut 컨트롤:**
- **WASD**: 이동
- **마우스**: 둘러보기
- **좌클릭**: 블록 설치
- **우클릭**: 블록 제거
- **1, 2, 3**: 블록 타입 선택 (잔디, 흙, 돌)

### 일반 게임 컨트롤

대부분의 게임은 표준 컨트롤을 사용합니다:
- **WASD** 또는 **화살표 키**: 이동
- **마우스**: 둘러보기 / 조준
- **좌클릭**: 사격 / 상호작용
- **스페이스**: 점프 (플랫포머에서)
- **Tab**: 슬로우 모션 토글 (slow_motion.py에서)
- **Escape**: 게임 종료

---

## 전체 설정 프로세스 요약

### 처음부터 설정하기

**1. 클론 및 이동:**
```bash
git clone https://github.com/jojungwhan/ursina_games_collection.git
cd ursina_games_collection
```

**2. 가상 환경 생성:**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# 또는 source venv/bin/activate  # Linux/Mac
```

**3. 의존성 설치:**
```bash
pip install -r requirements.txt
```

**4. 게임 실행:**
```bash
# 예시: 브레이크아웃 게임 실행
python breakout.py

# 예시: 마인크래프트 튜토리얼 실행
cd minecraft_tut
python main.py
```

---

## 문제 해결

### 가상 환경 활성화 오류

**Windows PowerShell 실행 정책 오류:**

PowerShell에서 실행 정책 오류가 발생하는 경우:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

그런 다음 환경을 활성화합니다:

```powershell
venv\Scripts\Activate.ps1
```

**Windows CMD 대안:**

```cmd
venv\Scripts\activate.bat
```

### pip 업그레이드

```bash
python -m pip install --upgrade pip
```

### 의존성 충돌 해결

가상 환경을 삭제하고 다시 생성합니다:

```bash
# 가상 환경 비활성화
deactivate

# 기존 가상 환경 삭제
rmdir /s venv  # Windows CMD
# 또는 Remove-Item -Recurse -Force venv  # Windows PowerShell
# 또는 rm -rf venv  # Linux/Mac

# 새 가상 환경 생성
python -m venv venv
venv\Scripts\activate  # Windows
# 또는 source venv/bin/activate  # Linux/Mac

# 의존성 재설치
pip install -r requirements.txt
```

### Python 버전 문제

Python 3.12 이상이 설치되어 있는지 확인합니다:

```bash
python --version
python3 --version
```

특정 Python 버전을 사용하려면:

```bash
python3.12 -m venv venv
python3.12 -m pip install -r requirements.txt
```

### 모듈을 찾을 수 없는 오류

설치 후 "ModuleNotFoundError"가 발생하는 경우:

1. 가상 환경이 활성화되어 있는지 확인합니다 (터미널 프롬프트에 `(venv)`가 표시되어야 합니다)
2. 패키지가 설치되어 있는지 확인합니다:
   ```bash
   pip list
   ```
3. 요구사항을 재설치합니다:
   ```bash
   pip install -r requirements.txt --force-reinstall
   ```

### 게임 창이 나타나지 않음

- 콘솔에서 오류 메시지를 확인합니다
- 그래픽 드라이버가 최신인지 확인합니다
- 먼저 더 간단한 게임을 실행해봅니다 (예: `world_grid.py`)
- 안티바이러스/방화벽이 애플리케이션을 차단하는지 확인합니다

### 성능 문제

- 다른 애플리케이션을 닫아 리소스를 확보합니다
- 게임 코드에서 그래픽 설정을 낮춥니다 (가능한 경우)
- 충분한 RAM과 GPU 메모리가 있는지 확인합니다

---

## 참고사항

- 가상 환경 폴더(`venv/`)는 `.gitignore`에 포함되어야 하며 Git에 커밋하지 않아야 합니다.
- 가상 환경이 활성화되면 터미널 프롬프트 앞에 `(venv)`가 표시됩니다.
- 게임을 종료하려면 창을 닫거나 `Escape`를 누릅니다 (게임에 따라 다름).
- 각 게임은 독립적이며 별도로 실행할 수 있습니다.
- minecraft_tut 프로젝트는 지형 생성에 `perlin_noise` 패키지가 필요합니다.

---

## 추가 리소스

- [Ursina 공식 문서](https://www.ursinaengine.org/)
- [Ursina GitHub 저장소](https://github.com/pokepetter/ursina)
- [Python 가상 환경 가이드](https://docs.python.org/3/tutorial/venv.html)
- [Panda3D 문서](https://docs.panda3d.org/)

---

## 빠른 참조

### 일반적인 명령어

```bash
# 가상 환경 활성화 (Windows)
venv\Scripts\activate

# 가상 환경 활성화 (Linux/Mac)
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 게임 실행
python game_name.py

# 가상 환경 비활성화
deactivate

# 설치된 패키지 확인
pip list

# pip 업그레이드
python -m pip install --upgrade pip
```
