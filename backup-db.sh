#!/bin/bash

# Скрипт резервного копирования базы данных MongoDB
# Использование: ./backup-db.sh

BACKUP_DIR="db_backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="consultation-qa"
BACKUP_PATH="${BACKUP_DIR}/${DB_NAME}_${DATE}"

# Создание директории для бэкапов
mkdir -p $BACKUP_DIR

# Создание резервной копии базы данных
echo "Создание резервной копии базы данных..."
mongodump --db=$DB_NAME --out=$BACKUP_PATH

if [ $? -eq 0 ]; then
  echo "Резервная копия базы данных успешно создана: $BACKUP_PATH"
  
  # Архивирование бэкапа
  tar -czf "${BACKUP_PATH}.tar.gz" -C $BACKUP_DIR $(basename $BACKUP_PATH)
  rm -rf $BACKUP_PATH
  
  echo "Архив создан: ${BACKUP_PATH}.tar.gz"
  
  # Удаление старых бэкапов (старше 30 дней)
  find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
  echo "Старые резервные копии удалены"
else
  echo "Ошибка при создании резервной копии базы данных"
  exit 1
fi
