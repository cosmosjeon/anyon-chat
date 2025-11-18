#!/bin/bash

# Test script to run through the entire planning flow

THREAD_ID="e98cf62f-90cb-4fb8-b276-4bdedd592d91"
BASE_URL="http://localhost:54369"

echo "=== Starting Planning Flow Test ==="
echo "Thread ID: $THREAD_ID"
echo ""

# Function to send a message and wait for response
send_message() {
    local message="$1"
    local step_name="$2"

    echo ">>> $step_name"
    echo "Sending: $message"
    echo ""

    curl -s -X POST "$BASE_URL/threads/$THREAD_ID/runs/stream" \
      -H "Content-Type: application/json" \
      -d "{\"assistant_id\":\"planning\",\"input\":{\"messages\":[{\"role\":\"human\",\"content\":\"$message\"}]}}" \
      2>/dev/null | jq -r 'select(.messages) | .messages[-1].content' | tail -1

    echo ""
    echo "---"
    echo ""
    sleep 2
}

# Answer question 2
send_message "학생들이 자신의 학습 스타일과 속도를 정확히 파악하기 어렵고, 이로 인해 비효율적인 학습 경로를 선택하게 되는 문제를 해결하고자 합니다." "Question 2: 핵심 문제"

# Continue with simple answers (selecting option 1 when available, or providing brief text)
send_message "1" "Question 3"
send_message "개인화된 AI 학습 경로 추천" "Question 4"
send_message "1" "Question 5"
send_message "학생들의 학습 성과 30% 향상" "Question 6"
send_message "1" "Question 7"
send_message "AI 기반 학습 분석 시스템" "Question 8"
send_message "1" "Question 9"
send_message "6개월" "Question 10"
send_message "1" "Question 11"
send_message "구독 기반 모델" "Question 12"
send_message "1" "Question 13"
send_message "학생 및 학부모" "Question 14"
send_message "1" "Question 15"

echo "=== Planning Flow Test Complete ==="
