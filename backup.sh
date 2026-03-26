#!/bin/bash

# Скрипт резервного копирования проекта
# Использование: ./backup.sh

BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_NAME="consultation-qa-system"
BACKUP_FILE="${BACKUP_DIR}/${PROJECT_NAME}_${DATE}.tar.gz"

# Создание директории для бэкапов
mkdir -p $BACKUP_DIR

# Создание архива проекта
echo "Создание резервной копии..."
tar -czf $BACKUP_FILE \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='backups' \
  client/ server/ package.json .gitignore

if [ $? -eq 0 ]; then
  echo "Резервная копия успешно создана: $BACKUP_FILE"
  
  # Удаление старых бэкапов (старше 30 дней)
  find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
  echo "Старые резервные копии удалены"
else
  echo "Ошибка при создании резервной копии"
  exit 1
fi
