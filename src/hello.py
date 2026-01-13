"""
hello.py - 파이썬 학습을 위한 첫 번째 모듈

이 모듈은 K-12 학생들이 함수의 기본 개념을 배우는 데 도움을 줍니다.
"""


def say_hello(name: str, times: int) -> str:
    """친구에게 여러 번 인사하는 함수입니다.

    이 함수는 주어진 이름으로 인사 메시지를 만들고,
    지정된 횟수만큼 반복하여 하나의 문자열로 반환합니다.

    Args:
        name: 인사할 친구의 이름.
        times: 인사를 반복할 횟수 (1 이상의 정수).

    Returns:
        인사 메시지가 담긴 문자열.
        예: "안녕, 철수! 안녕, 철수! 안녕, 철수!"

    Raises:
        ValueError: times가 1보다 작을 경우 발생합니다.

    Example:
        >>> say_hello("영희", 2)
        '안녕, 영희! 안녕, 영희!'

        >>> say_hello("민수", 1)
        '안녕, 민수!'
    """
    if times < 1:
        raise ValueError("times는 1 이상이어야 합니다.")

    greeting = f"안녕, {name}!"
    result = " ".join([greeting] * times)
    return result


if __name__ == "__main__":
    # 테스트 실행
    print(say_hello("파이썬", 3))
