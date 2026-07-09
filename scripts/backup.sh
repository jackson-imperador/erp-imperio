#!/bin/bash
# Backup Script for ERP Imperio (PostgreSQL & MinIO)
# This script should be run via cron

set -e

BACKUP_DIR="/var/backups/erp_imperio"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_CONTAINER="erp_imperio_db"
DB_USER="postgres"
DB_NAME="erp_imperio"

MINIO_CONTAINER="erp_imperio_minio"
MINIO_DATA_PATH="/data"

mkdir -p "$BACKUP_DIR"

echo "[$TIMESTAMP] Starting database backup..."
docker exec -t $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME -F c > "$BACKUP_DIR/db_$TIMESTAMP.dump"
echo "Database backup completed: db_$TIMESTAMP.dump"

echo "[$TIMESTAMP] Starting MinIO data backup..."
# Tar the minio data volume directly or use mc (minio client)
docker run --rm --volumes-from $MINIO_CONTAINER -v $BACKUP_DIR:/backup alpine tar czf /backup/minio_$TIMESTAMP.tar.gz $MINIO_DATA_PATH
echo "MinIO backup completed: minio_$TIMESTAMP.tar.gz"

echo "[$TIMESTAMP] Cleaning up old backups (older than 7 days)..."
find $BACKUP_DIR -type f -mtime +7 -name "*.dump" -exec rm {} \;
find $BACKUP_DIR -type f -mtime +7 -name "*.tar.gz" -exec rm {} \;

echo "[$TIMESTAMP] Backup process finished successfully."
