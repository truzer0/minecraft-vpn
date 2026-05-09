#!/bin/sh
set -e

MODS_DIR="/mods"
SHADERS_DIR="/shaders"
RESOURCEPACKS_DIR="/resourcepacks"
MODS_LIST="/mods/mods-list.json"

echo "📦 Downloading Minecraft mods and shaders..."

# Создаем директории
mkdir -p $MODS_DIR $SHADERS_DIR $RESOURCEPACKS_DIR

# Функция для скачивания
download_file() {
    local name=$1
    local url=$2
    local output=$3
    local dir=$4
    
    echo "📥 Downloading $name..."
    if curl -L --progress-bar -o "$dir/$output" "$url"; then
        echo "✅ $name downloaded successfully"
    else
        echo "❌ Failed to download $name"
    fi
}

# ============================================
# ОПТИМИЗАЦИОННЫЕ МОДЫ (Fabric/Forge)
# ============================================

download_file "Sodium" \
    "https://cdn.modrinth.com/data/AANobbMI/versions/mH1XjGIu/sodium-forge-0.5.8%2Bmc1.20.4.jar" \
    "sodium-forge-0.5.8+mc1.20.4.jar" \
    $MODS_DIR

download_file "Lithium" \
    "https://cdn.modrinth.com/data/gvQqBUqZ/versions/QC0y2Nf7/lithium-forge-0.12.1%2Bmc1.20.4.jar" \
    "lithium-forge-0.12.1+mc1.20.4.jar" \
    $MODS_DIR

download_file "Phosphor" \
    "https://cdn.modrinth.com/data/hEOCdOgW/versions/jBgjK1Rg/phosphor-forge-0.10.0%2Bmc1.20.4.jar" \
    "phosphor-forge-0.10.0+mc1.20.4.jar" \
    $MODS_DIR

download_file "FerriteCore" \
    "https://cdn.modrinth.com/data/uXXizFIs/versions/U9rbASl3/ferritecore-6.0.3-forge.jar" \
    "ferritecore-6.0.3-forge.jar" \
    $MODS_DIR

download_file "Krypton" \
    "https://cdn.modrinth.com/data/fQEb0iXm/versions/jJbuEDX1/krypton-0.2.8.jar" \
    "krypton-0.2.8.jar" \
    $MODS_DIR

download_file "LazyDFU" \
    "https://cdn.modrinth.com/data/hvFnDODi/versions/xVrxQpO3/lazydfu-1.20.4-0.3.2.jar" \
    "lazydfu-1.20.4-0.3.2.jar" \
    $MODS_DIR

download_file "Entity Culling" \
    "https://cdn.modrinth.com/data/NNAgCjsB/versions/XFiK5LVu/entityculling-forge-1.6.1-mc1.20.4.jar" \
    "entityculling-forge-1.6.1-mc1.20.4.jar" \
    $MODS_DIR

download_file "Clumps" \
    "https://cdn.modrinth.com/data/Wnxd13zP/versions/IlwkMBtu/Clumps-forge-1.20.4-12.0.0.4.jar" \
    "Clumps-forge-1.20.4-12.0.0.4.jar" \
    $MODS_DIR

# ============================================
# UI И УДОБСТВА
# ============================================

download_file "JEI" \
    "https://cdn.modrinth.com/data/u6dRKJwZ/versions/ZMo4OFYz/jei-1.20.4-forge-17.0.0.35.jar" \
    "jei-1.20.4-forge-17.0.0.35.jar" \
    $MODS_DIR

download_file "JourneyMap" \
    "https://cdn.modrinth.com/data/lfHFW1mp/versions/LBDg0h1K/journeymap-1.20.4-5.10.3-forge.jar" \
    "journeymap-1.20.4-5.10.3-forge.jar" \
    $MODS_DIR

download_file "Xaero's Minimap" \
    "https://cdn.modrinth.com/data/1bokaNcj/versions/CJUTB1UK/Xaeros_Minimap_24.1.1_Forge_1.20.jar" \
    "Xaeros_Minimap_24.1.1_Forge_1.20.jar" \
    $MODS_DIR

download_file "Xaero's World Map" \
    "https://cdn.modrinth.com/data/NcUtCpym/versions/ayHKl1AE/XaerosWorldMap_1.38.1_Forge_1.20.jar" \
    "XaerosWorldMap_1.38.1_Forge_1.20.jar" \
    $MODS_DIR

download_file "FTB Essentials" \
    "https://cdn.modrinth.com/data/oAMYcFiU/versions/SX7RdB8V/ftb-essentials-forge-2001.3.0.jar" \
    "ftb-essentials-forge-2001.3.0.jar" \
    $MODS_DIR

download_file "Mouse Tweaks" \
    "https://cdn.modrinth.com/data/aC3cM3Vq/versions/Hmg7LBNR/MouseTweaks-forge-mc1.20.4-2.25.1.jar" \
    "MouseTweaks-forge-mc1.20.4-2.25.1.jar" \
    $MODS_DIR

download_file "AppleSkin" \
    "https://cdn.modrinth.com/data/EsAfCjCV/versions/Z9NkDR38/appleskin-forge-mc1.20.4-2.5.1.jar" \
    "appleskin-forge-mc1.20.4-2.5.1.jar" \
    $MODS_DIR

# ============================================
# ГЕЙМПЛЕЙНЫЕ МОДЫ
# ============================================

download_file "Tinkers Construct" \
    "https://cdn.modrinth.com/data/R7JpywDN/versions/StSNjBSn/TConstruct-1.20.4-3.9.0.35.jar" \
    "TConstruct-1.20.4-3.9.0.35.jar" \
    $MODS_DIR

download_file "Tinkers Construct - Mantle" \
    "https://cdn.modrinth.com/data/BQ2G0s3f/versions/0hB0RHAk/Mantle-1.20.4-1.11.30.jar" \
    "Mantle-1.20.4-1.11.30.jar" \
    $MODS_DIR

download_file "Immersive Portals" \
    "https://cdn.modrinth.com/data/zJpHMkdD/versions/ZBBV3HHp/imm_ptl_core-1.20.4-4.0.5-forge.jar" \
    "imm_ptl_core-1.20.4-4.0.5-forge.jar" \
    $MODS_DIR

download_file "Immersive Portals - QoL" \
    "https://cdn.modrinth.com/data/zJpHMkdD/versions/ZBBV3HHp/imm_ptl_qol-1.20.4-4.0.5-forge.jar" \
    "imm_ptl_qol-1.20.4-4.0.5-forge.jar" \
    $MODS_DIR

download_file "Pam's HarvestCraft 2" \
    "https://cdn.modrinth.com/data/fzXCj2tX/versions/iBnBvRBh/pamhc2crops-1.20.4-1.0.1.jar" \
    "pamhc2crops-1.20.4-1.0.1.jar" \
    $MODS_DIR

download_file "Pam's HarvestCraft - Food Core" \
    "https://cdn.modrinth.com/data/fzXCj2tX/versions/foKStoYL/pamhc2foodcore-1.20.4-1.0.1.jar" \
    "pamhc2foodcore-1.20.4-1.0.1.jar" \
    $MODS_DIR

download_file "Pam's HarvestCraft - Food Extended" \
    "https://cdn.modrinth.com/data/fzXCj2tX/versions/nkW8XXlA/pamhc2foodextended-1.20.4-1.0.1.jar" \
    "pamhc2foodextended-1.20.4-1.0.1.jar" \
    $MODS_DIR

download_file "Pam's HarvestCraft - Trees" \
    "https://cdn.modrinth.com/data/fzXCj2tX/versions/bNEPC7bZ/pamhc2trees-1.20.4-1.0.0.jar" \
    "pamhc2trees-1.20.4-1.0.0.jar" \
    $MODS_DIR

# ============================================
# ГЕНЕРАЦИЯ МИРА
# ============================================

download_file "TerraForged" \
    "https://cdn.modrinth.com/data/Sl2fSDMo/versions/Cn6PpN6q/TerraForged-1.20.4-0.4.2.jar" \
    "TerraForged-1.20.4-0.4.2.jar" \
    $MODS_DIR

download_file "TerraBlender" \
    "https://cdn.modrinth.com/data/kkmrDlKT/versions/ZRLbcj1o/TerraBlender-forge-1.20.4-3.0.1.7.jar" \
    "TerraBlender-forge-1.20.4-3.0.1.7.jar" \
    $MODS_DIR

download_file "Oh The Biomes You'll Go" \
    "https://cdn.modrinth.com/data/uDT5pgfq/versions/Nc1IZCrO/Oh_The_Biomes_Youll_Go-forge-1.20.4-4.0.1.6.jar" \
    "Oh_The_Biomes_Youll_Go-forge-1.20.4-4.0.1.6.jar" \
    $MODS_DIR

# ============================================
# ШЕЙДЕРЫ И ГРАФИКА
# ============================================

echo "🎨 Downloading shaders..."

# BSL Shaders
download_file "BSL Shaders" \
    "https://cdn.modrinth.com/data/EDCzuDxP/versions/ukdFUU30/BSL_v8.3.zip" \
    "BSL_v8.3.zip" \
    $SHADERS_DIR

# Complementary Shaders (альтернатива BSL)
download_file "Complementary Shaders" \
    "https://cdn.modrinth.com/data/R6NEzAwj/versions/SMnUs3kA/ComplementaryShaders_v4.7.2.zip" \
    "ComplementaryShaders_v4.7.2.zip" \
    $SHADERS_DIR

# ============================================
# ГРАФИЧЕСКИЕ МОДЫ
# ============================================

download_file "Oculus (Iris для Forge)" \
    "https://cdn.modrinth.com/data/GchcoXML/versions/9iLx6RPL/oculus-mc1.20.4-1.7.0.jar" \
    "oculus-mc1.20.4-1.7.0.jar" \
    $MODS_DIR

download_file "Oculus - Flywheel Compat" \
    "https://cdn.modrinth.com/data/GchcoXML/versions/puVFfMKb/oculus-flywheel-compat-1.20.4-0.2.3.jar" \
    "oculus-flywheel-compat-1.20.4-0.2.3.jar" \
    $MODS_DIR

download_file "Rubidium" \
    "https://cdn.modrinth.com/data/AANobbMI/versions/mH1XjGIu/sodium-forge-0.5.8%2Bmc1.20.4.jar" \
    "rubidium-0.5.8.jar" \
    $MODS_DIR

download_file "Embeddium" \
    "https://cdn.modrinth.com/data/sk9rgFjA/versions/wHFdLLXg/embeddium-0.2.17%2Bmc1.20.4.jar" \
    "embeddium-0.2.17+mc1.20.4.jar" \
    $MODS_DIR

# ProjectLUMA (альтернативный шейдерпад)
download_file "ProjectLUMA Shaders" \
    "https://cdn.modrinth.com/data/BNAydpMj/versions/iGgaUszW/ProjectLUMA_v1.42.zip" \
    "ProjectLUMA_v1.42.zip" \
    $SHADERS_DIR

# ============================================
# АНТИ-ЧИТ И БЕЗОПАСНОСТЬ
# ============================================

download_file "NoChatReports" \
    "https://cdn.modrinth.com/data/qQyHxfxd/versions/U6aRXOdX/NoChatReports-FORGE-1.20.4-v2.6.0.jar" \
    "NoChatReports-FORGE-1.20.4-v2.6.0.jar" \
    $MODS_DIR

# ============================================
# ДОПОЛНИТЕЛЬНЫЕ МОДЫ ДЛЯ СЕРВЕРА
# ============================================

download_file "Chunky" \
    "https://cdn.modrinth.com/data/fALzjamp/versions/pKuvHpR0/Chunky-1.4.16.jar" \
    "Chunky-1.4.16.jar" \
    $MODS_DIR

download_file "Spark" \
    "https://cdn.modrinth.com/data/l6YH9Als/versions/zpzLbaOF/spark-1.10.53-forge.jar" \
    "spark-1.10.53-forge.jar" \
    $MODS_DIR

download_file "Chunk Pregenerator" \
    "https://cdn.modrinth.com/data/1JdL3K4B/versions/TMULBvLb/Chunk+Pregenerator-1.20.4-5.0.1.jar" \
    "ChunkPregenerator-1.20.4-5.0.1.jar" \
    $MODS_DIR

echo "✅ All mods and shaders downloaded successfully!"
echo "📊 Summary:"
echo "   - Mods: $(ls -1 $MODS_DIR | wc -l) files"
echo "   - Shaders: $(ls -1 $SHADERS_DIR | wc -l) files"