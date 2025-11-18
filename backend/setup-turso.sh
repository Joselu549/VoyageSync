#!/bin/bash

# Script de ayuda para configurar Turso DB
# Este script te guiará paso a paso para obtener tu token de autenticación

echo "=================================================="
echo "🚀 Configuración de Turso DB para VoyageSync"
echo "=================================================="
echo ""

# Verificar si Turso CLI está instalado
if ! command -v turso &> /dev/null; then
    echo "❌ Turso CLI no está instalado."
    echo "📦 Instalando Turso CLI..."
    curl -sSfL https://get.tur.so/install.sh | bash
    source ~/.bashrc
    echo "✅ Turso CLI instalado correctamente"
    echo ""
fi

# Paso 1: Autenticación
echo "📋 Paso 1: Autenticación"
echo "-------------------------------"
echo "Ejecuta el siguiente comando para autenticarte:"
echo ""
echo "  turso auth login"
echo ""
echo "Esto abrirá tu navegador para autenticarte con GitHub."
echo "Presiona Enter cuando hayas completado la autenticación..."
read -r

# Paso 2: Verificar bases de datos
echo ""
echo "📋 Paso 2: Verificar bases de datos"
echo "-------------------------------"
echo "Tus bases de datos disponibles:"
echo ""
turso db list

# Paso 3: Generar token
echo ""
echo "📋 Paso 3: Generar token de autenticación"
echo "-------------------------------"
echo "Ejecuta el siguiente comando para generar tu token:"
echo ""
echo "  turso db tokens create voyagesync"
echo ""
echo "Presiona Enter para generar el token automáticamente..."
read -r

TOKEN=$(turso db tokens create voyagesync)

if [ -z "$TOKEN" ]; then
    echo "❌ Error al generar el token."
    echo "Por favor, ejecuta manualmente: turso db tokens create voyagesync"
    exit 1
fi

echo ""
echo "✅ Token generado exitosamente!"
echo ""
echo "=================================================="
echo "🎉 Configuración completada"
echo "=================================================="
echo ""
echo "Copia el siguiente token en tu archivo .env:"
echo ""
echo "TURSO_AUTH_TOKEN=$TOKEN"
echo ""
echo "Tu archivo .env debería verse así:"
echo ""
echo "PORT=1234"
echo "TURSO_DATABASE_URL=libsql://voyagesync-joselu549.aws-eu-west-1.turso.io"
echo "TURSO_AUTH_TOKEN=$TOKEN"
echo ""
echo "=================================================="
echo "🚀 Ahora puedes iniciar el servidor con: npm start"
echo "=================================================="
