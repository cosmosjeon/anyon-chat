-- ========================================
-- Supabase 데이터베이스 구조 확인 SQL
-- ========================================

-- 1. 모든 테이블 목록 조회
SELECT
    table_schema,
    table_name,
    table_type
FROM
    information_schema.tables
WHERE
    table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY
    table_schema,
    table_name;


-- 2. 각 테이블의 컬럼 정보 조회
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
ORDER BY
    table_name,
    ordinal_position;


-- 3. assistant 관련 테이블 찾기 (테이블 이름에 'assist' 포함)
SELECT
    table_name
FROM
    information_schema.tables
WHERE
    table_schema = 'public'
    AND table_name LIKE '%assist%';


-- 4. thread 관련 테이블 찾기 (테이블 이름에 'thread' 포함)
SELECT
    table_name
FROM
    information_schema.tables
WHERE
    table_schema = 'public'
    AND table_name LIKE '%thread%';


-- 5. checkpoint 관련 테이블 찾기
SELECT
    table_name
FROM
    information_schema.tables
WHERE
    table_schema = 'public'
    AND table_name LIKE '%check%';


-- 6. 실제 데이터가 있는 테이블 확인 (행 개수)
-- 참고: 이 쿼리는 테이블이 존재하는 경우에만 실행하세요
-- 먼저 위의 쿼리로 테이블 목록을 확인한 후 실행
/*
SELECT
    schemaname,
    tablename,
    n_live_tup as row_count
FROM
    pg_stat_user_tables
WHERE
    schemaname = 'public'
ORDER BY
    n_live_tup DESC;
*/
