// generate-models.js
const fs = require("fs");
const path = require("path");

// ===== НАСТРОЙКИ =====
const MODELS_DIR = "models"; // Папка с моделями
const OUTPUT_FILE = "models.json"; // Выходной JSON-файл
const BASE_URL = "https://nikulinalexey.github.io/ar-models"; // Ваш GitHub Pages URL

// Расширения файлов моделей (поддерживаемые)
const MODEL_EXTENSIONS = [".glb", ".gltf", ".obj", ".fbx"];

// Расширения текстур (если нужны — опционально)
const TEXTURE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".ktx2"];

// ===== ФУНКЦИЯ ДЛЯ ФОРМАТИРОВАНИЯ НАЗВАНИЯ =====
function formatModelName(folderName) {
  return folderName
    // .replace(/-v\d+$/, "") // убираем -v1, -v2 и т.д.
    // .replace(/[-_]/g, " ") // заменяем дефисы и подчёркивания на пробелы
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// ===== ОСНОВНАЯ ФУНКЦИЯ ГЕНЕРАЦИИ =====
function generateModelsJson() {
  const modelsDirPath = path.join(process.cwd(), MODELS_DIR);

  // Проверяем, существует ли папка models
  if (!fs.existsSync(modelsDirPath)) {
    console.error(
      `❌ Ошибка: Папка "${MODELS_DIR}" не найдена по пути: ${modelsDirPath}`,
    );
    process.exit(1);
  }

  // Читаем содержимое папки models
  const items = fs.readdirSync(modelsDirPath, { withFileTypes: true });
  const models = [];

  for (const item of items) {
    // Нас интересуют только папки
    if (!item.isDirectory()) continue;

    const modelFolder = item.name;
    const folderPath = path.join(modelsDirPath, modelFolder);

    // Ищем файл модели в папке
    const files = fs.readdirSync(folderPath);

    // Ищем первый файл с поддерживаемым расширением
    let modelFile = null;
    let modelExt = null;

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (MODEL_EXTENSIONS.includes(ext)) {
        modelFile = file;
        modelExt = ext;
        break;
      }
    }

    if (!modelFile) {
      console.warn(
        `⚠️ В папке "${modelFolder}" не найден файл модели (${MODEL_EXTENSIONS.join(", ")})`,
      );
      continue;
    }

    // Формируем название модели
    const modelName = formatModelName(modelFolder);

    // Собираем информацию о текстурах (опционально)
    const textures = [];
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (TEXTURE_EXTENSIONS.includes(ext)) {
        textures.push({
          name: path.basename(file, ext),
          url: `${BASE_URL}/${MODELS_DIR}/${modelFolder}/${file}`,
          type: ext.substring(1), // jpg, png и т.д.
        });
      }
    }

    // Формируем объект модели
    const modelData = {
      id: modelFolder,
      name: modelName,
      path: `${BASE_URL}/${MODELS_DIR}/${modelFolder}/${modelFile}`,
      format: modelExt.substring(1), // glb, gltf, obj, fbx
    };

    // Добавляем текстуры, если есть
    if (textures.length > 0) {
      modelData.textures = textures;
    }

    models.push(modelData);
    console.log(
      `✅ Найдена модель: "${modelName}" → ${modelFile} (${modelExt})`,
    );
  }

  // Сортируем модели по имени
  models.sort((a, b) => a.name.localeCompare(b.name));

  // Формируем итоговый JSON
  const output = {
    generated: new Date().toISOString(),
    total: models.length,
    baseUrl: BASE_URL,
    models: models,
  };

  // Записываем JSON в файл
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\n✅ Файл "${OUTPUT_FILE}" успешно создан!`);
  console.log(`📊 Всего моделей: ${models.length}`);
  console.log(`📁 Путь: ${path.join(process.cwd(), OUTPUT_FILE)}`);
}

// ===== ЗАПУСК =====
generateModelsJson();
