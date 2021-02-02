import fs from "fs";
import path from "path";

import ora from "ora";
import chalk from "chalk";
import sharp from "sharp";

const spinner = ora();

spinner.info(chalk.green(" 大西瓜图片批处理助手"));

spinner.info(chalk.cyan(" 检查目录..."));

const COMMON_IMAGE_PATH = path.resolve(__dirname, "../images/common");
const SPECIAL_IMAGE_PATH = path.resolve(__dirname, "../images/special");
const PRESERVED_IMAGE_PATH = path.resolve(__dirname, "../images/preserved");

const OUTPUT_IMAGE_PATH = path.resolve(__dirname, "../output");

const checkDirPassed = [
  COMMON_IMAGE_PATH,
  SPECIAL_IMAGE_PATH,
  PRESERVED_IMAGE_PATH,
].every((path) => fs.existsSync(path));

if (!checkDirPassed) {
  spinner.fail(
    chalk.red("请确保你的/images目录下存在这些文件夹: common preserved special")
  );
  process.exit(0);
}

if (fs.existsSync(OUTPUT_IMAGE_PATH)) {
  fs.rmSync(OUTPUT_IMAGE_PATH, { recursive: true });
  spinner.info(chalk.green("已移除输出目录"));
}

const OUTPUT_COMMON_FOLDER_LIST = [
  "ad16ccdc-975e-4393-ae7b-8ac79c3795f2.png",
  "0cbb3dbb-2a85-42a5-be21-9839611e5af7.png",
  "d0c676e4-0956-4a03-90af-fee028cfabe4.png",
  "74237057-2880-4e1f-8a78-6d8ef00a1f5f.png",
  "132ded82-3e39-4e2e-bc34-fc934870f84c.png",
  "03c33f55-5932-4ff7-896b-814ba3a8edb8.png",
  "665a0ec9-6c43-4858-974c-025514f2a0e7.png",
  "84bc9d40-83d0-480c-b46a-3ef59e603e14.png",
  "5fa0264d-acbf-4a7b-8923-c106ec3b9215.png",
  "564ba620-6a55-4cbe-a5a6-6fa3edd80151.png",
  "5035266c-8df3-4236-8d82-a375e97a0d9c.png",
];

const OUTPUT_SPECIAL_FOLDER_LIST = [
  "8c52a851-9969-4702-9997-0a2ca9f43773.png",
  "4756311b-4364-4160-bc7e-299876f49770.png",
];

const PRESERVED_ASSETS = [
  "137b8bd7-03dc-47be-94d1-efd7ac5d0a74.png",
  "5f932042-0f42-44fa-9f47-e3ea49850807.png",
];

const REQUIRED_COMMON_SIZE_LIST: number[][] = [
  [52, 52],
  [80, 80],
  [108, 108],
  [119, 119],
  [153, 152],
  [183, 183],
  [193, 193],
  [258, 258],
  [308, 308],
  [308, 309],
  [408, 408],
];

const REQUIRED_SPECIAL_SIZE_LIST: number = 216;

const commonImageFileList = fs.readdirSync(COMMON_IMAGE_PATH);
const specialImageFileList = fs.readdirSync(SPECIAL_IMAGE_PATH);

const roundedCorners = (width: number, height: number) =>
  Buffer.from(
    `<svg><rect x="0" y="0" width="${width}" height="${height}" rx="${width}" ry="${height}"/></svg>`
  );

if (commonImageFileList.length !== 11 || specialImageFileList.length !== 2) {
}

fs.mkdirSync(OUTPUT_IMAGE_PATH);
spinner.succeed(chalk.green("输出目录创建成功"));

const usePath = (
  folder: string,
  outputName: string
): Record<"saveFolderPath" | "saveFilePath", string> => {
  const saveFolderPath = path.resolve(folder, outputName.slice(0, 2));
  const saveFilePath = path.resolve(saveFolderPath, outputName);

  return { saveFolderPath, saveFilePath };
};

(async () => {
  spinner.info(chalk.cyan("开始处理普通图片, 西内!"));
  for (const i in commonImageFileList) {
    const processingImage = commonImageFileList[i];
    const requiredOutputName = OUTPUT_COMMON_FOLDER_LIST[i];

    const { saveFolderPath, saveFilePath } = usePath(
      OUTPUT_IMAGE_PATH,
      requiredOutputName
    );

    if (!fs.existsSync(saveFolderPath)) {
      fs.mkdirSync(saveFolderPath);
    }

    const [width, height] = REQUIRED_COMMON_SIZE_LIST[i];

    const rawBuffer = fs.readFileSync(
      path.resolve(COMMON_IMAGE_PATH, processingImage)
    );

    await sharp(rawBuffer)
      .resize(width, height)
      .composite([
        {
          input: roundedCorners(width, height),
          blend: "dest-in",
        },
      ])
      .png()
      .toFile(saveFilePath);

    spinner.succeed(
      chalk.green(`图片 ${processingImage} 已保存至 ${saveFilePath}`)
    );
    console.log("");
  }

  spinner.succeed(chalk.cyan("普通图片处理完毕"));

  console.log("===");
  console.log(chalk.bold(chalk.green("天赋创新牛逼")));
  console.log("===");

  spinner.info(chalk.cyan("开始处理右上角闪图"));
  for (const i in specialImageFileList) {
    const processingImage = specialImageFileList[i];
    const requiredOutputName = OUTPUT_SPECIAL_FOLDER_LIST[i];

    const { saveFolderPath, saveFilePath } = usePath(
      OUTPUT_IMAGE_PATH,
      requiredOutputName
    );

    if (!fs.existsSync(saveFolderPath)) {
      fs.mkdirSync(saveFolderPath);
    }

    const rawBuffer = fs.readFileSync(
      path.resolve(SPECIAL_IMAGE_PATH, processingImage)
    );

    await sharp(rawBuffer)
      .resize(REQUIRED_SPECIAL_SIZE_LIST, REQUIRED_SPECIAL_SIZE_LIST)
      .png()
      .toFile(saveFilePath);

    spinner.succeed(
      chalk.green(`图片 ${processingImage} 已保存至 ${saveFilePath}`)
    );
    console.log("");
  }
  spinner.succeed(chalk.cyan("右上角闪图处理完毕"));

  console.log("===");
  console.log(chalk.bold(chalk.green("天赋创新牛逼")));
  console.log("===");

  spinner.info(chalk.cyan("开始处理保留资源"));
  for (const i in PRESERVED_ASSETS) {
    const processingImage = PRESERVED_ASSETS[i];

    const srcPath = path.resolve(PRESERVED_IMAGE_PATH, processingImage);

    const { saveFilePath } = usePath(OUTPUT_IMAGE_PATH, processingImage);

    fs.copyFileSync(srcPath, saveFilePath);

    spinner.succeed(
      chalk.green(`保留资源图片 ${srcPath} 已复制至 ${saveFilePath}`)
    );
    console.log("");
  }
  spinner.succeed(chalk.cyan("保留资源处理完毕"));
})();
