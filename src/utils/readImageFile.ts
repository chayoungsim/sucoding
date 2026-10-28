// 백엔드 JSON 본문 제한이 100KB라서, 제목·내용을 뺀 이미지 몫을 이 길이로 제한한다
const maxDataUrlLength = 60000;
const maxOriginalBytes = 10 * 1024 * 1024;
const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxDimension = 800;
const minDimension = 200;
const shrinkRatio = 0.8;
const qualities = [0.8, 0.7, 0.6, 0.5];

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read this file"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read this image"));
    image.src = src;
  });
}

// 이미지를 긴 변 기준 maxSide 이하로 줄여 그린 뒤, 품질을 낮춰 가며 JPEG 데이터 URL을 만든다
function compress(image: HTMLImageElement, maxSide: number): string | null {
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not process this image");

  // JPEG는 투명을 표현하지 못하므로 흰 배경을 먼저 칠한다
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  for (const quality of qualities) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length <= maxDataUrlLength) return dataUrl;
  }
  return null;
}

// 선택한 이미지 파일을 FileReader로 읽고, 서버 제한에 맞게 줄여 데이터 URL로 돌려준다
export async function readImageFile(file: File): Promise<string> {
  if (!acceptedTypes.includes(file.type)) {
    throw new Error("Only JPG, PNG, and WebP images are supported");
  }
  if (file.size > maxOriginalBytes) {
    throw new Error("The image must be 10MB or smaller");
  }

  const image = await loadImage(await readAsDataUrl(file));

  for (let side = maxDimension; side >= minDimension; side *= shrinkRatio) {
    const dataUrl = compress(image, side);
    if (dataUrl) return dataUrl;
  }
  throw new Error("This image is too complex. Please choose a smaller one");
}
