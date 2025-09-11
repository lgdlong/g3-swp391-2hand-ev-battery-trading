#!/bin/bash
set -e

# Chờ PostgreSQL sẵn sàng
until pg_isready -U "$POSTGRES_USER"; do
  echo "Waiting for postgres..."
  sleep 1
done

# Tìm file .dump mới nhất
DUMP_FILE=$(ls -t /docker-entrypoint-initdb.d/*.dump 2>/dev/null | head -n 1)

if [ -z "$DUMP_FILE" ]; then
  echo "❌ No .dump file found to restore!"
  exit 1
fi

# Chỉ restore nếu database rỗng
if [ -z "$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_tables WHERE schemaname='public' LIMIT 1")" ]; then
  echo "Restoring database from $DUMP_FILE..."

  # Xoá schema public (nếu cần) để tránh lỗi tồn tại bảng cũ
  echo "Dropping and recreating schema public..."
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

  # Khôi phục từ file .dump
  pg_restore --no-owner --clean --if-exists -U "$POSTGRES_USER" -d "$POSTGRES_DB" "$DUMP_FILE"
else
  echo "Database already has tables, skipping restore."
fi
