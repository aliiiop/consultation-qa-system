@echo off
REM Скрипт резервного копирования для Windows
REM Использование: backup.bat

set BACKUP_DIR=backups
set PROJECT_NAME=consultation-qa-system
set DATETIME=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set DATETIME=%DATETIME: =0%
set BACKUP_FILE=%BACKUP_DIR%\%PROJECT_NAME%_%DATETIME%.zip

REM Создание директории для бэкапов
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

echo Создание резервной копии...

REM Использование PowerShell для создания архива
powershell -Command "Compress-Archive -Path client,server,package.json,.gitignore -DestinationPath %BACKUP_FILE% -Force"

if %errorlevel% equ 0 (
    echo Резервная копия успешно создана: %BACKUP_FILE%
) else (
    echo Ошибка при создании резервной копии
    exit /b 1
)

echo Готово!
