-- ========================================
-- Supabase 데이터 정리 SQL
-- ========================================
-- 이 스크립트는 기존 assistants와 threads를 삭제합니다.
-- 실행 후 브라우저 새로고침하면 planning graphId로 새 assistant가 자동 생성됩니다.

-- ========================================
-- 옵션 1: 전체 데이터 삭제 (개발 환경용)
-- ========================================

-- 1. 모든 스레드 삭제 (대화 기록)
DELETE FROM threads;

-- 2. 모든 어시스턴트 삭제
DELETE FROM assistants;

-- 3. 체크포인트 데이터 삭제 (스레드 상태)
DELETE FROM checkpoint_writes;
DELETE FROM checkpoints;

-- 4. 실행 기록 삭제 (선택사항)
DELETE FROM runs;


-- ========================================
-- 옵션 2: 특정 유저 데이터만 삭제 (프로덕션 환경용)
-- ========================================

-- 본인의 user_id를 아래에 입력하세요
-- 예: 'abc123-def456-ghi789'

-- 1. 본인 어시스턴트만 삭제
DELETE FROM assistants
WHERE metadata->>'user_id' = 'YOUR_USER_ID_HERE';

-- 2. 본인 스레드만 삭제
DELETE FROM threads
WHERE metadata->>'user_id' = 'YOUR_USER_ID_HERE';

-- 3. 본인 체크포인트만 삭제
DELETE FROM checkpoint_writes
WHERE thread_id IN (
  SELECT thread_id FROM threads
  WHERE metadata->>'user_id' = 'YOUR_USER_ID_HERE'
);

DELETE FROM checkpoints
WHERE thread_id IN (
  SELECT thread_id FROM threads
  WHERE metadata->>'user_id' = 'YOUR_USER_ID_HERE'
);


-- ========================================
-- 실행 방법
-- ========================================
-- 1. Supabase Dashboard 열기
-- 2. 좌측 메뉴에서 "SQL Editor" 클릭
-- 3. 이 파일 내용 복사 후 붙여넣기
-- 4. 사용할 옵션 선택 (나머지는 주석 처리)
-- 5. "Run" 버튼 클릭
-- 6. 브라우저에서 애플리케이션 새로고침 (Cmd+Shift+R 또는 Ctrl+Shift+R)


-- ========================================
-- 주의사항
-- ========================================
-- ⚠️ 옵션 1 (전체 삭제)는 모든 유저의 데이터를 삭제합니다
-- ⚠️ 프로덕션 환경에서는 반드시 옵션 2를 사용하세요
-- ⚠️ 삭제된 데이터는 복구할 수 없습니다
-- ✅ 개발 중이면 옵션 1 사용해도 됩니다
