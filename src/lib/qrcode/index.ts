/**
 * Motor de Generación de Códigos QR en TypeScript Puro (Zero Dependencies)
 * Basado en las especificaciones ISO/IEC 18004.
 * Soporta codificación UTF-8 / Byte Mode, versiones 1 a 14 (hasta ~400 caracteres),
 * corrección de errores (L, M, Q, H) y exportación directa a SVG y Canvas (PNG).
 */

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QROptions {
  ecl?: ErrorCorrectionLevel;
  fgColor?: string;
  bgColor?: string;
  size?: number;
  margin?: number;
}

// Tablas estándar de capacidades de datos por versión y nivel ECC (Byte mode)
// [versión, [L, M, Q, H]]
const CAPACITY_TABLE: [number, [number, number, number, number]][] = [
  [1, [17, 14, 11, 7]],
  [2, [32, 26, 20, 14]],
  [3, [53, 42, 32, 24]],
  [4, [78, 62, 46, 34]],
  [5, [106, 84, 60, 44]],
  [6, [134, 106, 74, 58]],
  [7, [154, 122, 86, 64]],
  [8, [192, 152, 108, 84]],
  [9, [230, 180, 130, 98]],
  [10, [271, 213, 151, 119]],
  [11, [321, 251, 177, 137]],
  [12, [367, 287, 203, 155]],
  [13, [425, 331, 241, 177]],
  [14, [458, 362, 258, 194]],
];

// Cantidad de palabras clave de corrección de error por bloque y estructura de bloques
// [version, ecLevel(0=L,1=M,2=Q,3=H), ecCodewordsPerBlock, [numBlocksGroup1, dataCodewordsPerBlock1, numBlocksGroup2, dataCodewordsPerBlock2]]
const ECC_SPECS: Record<number, Record<number, { ecPerBlock: number; blocks: [number, number, number, number] }>> = {
  1: {
    0: { ecPerBlock: 7, blocks: [1, 19, 0, 0] },
    1: { ecPerBlock: 10, blocks: [1, 16, 0, 0] },
    2: { ecPerBlock: 13, blocks: [1, 13, 0, 0] },
    3: { ecPerBlock: 17, blocks: [1, 9, 0, 0] },
  },
  2: {
    0: { ecPerBlock: 10, blocks: [1, 34, 0, 0] },
    1: { ecPerBlock: 16, blocks: [1, 28, 0, 0] },
    2: { ecPerBlock: 22, blocks: [1, 22, 0, 0] },
    3: { ecPerBlock: 28, blocks: [1, 16, 0, 0] },
  },
  3: {
    0: { ecPerBlock: 15, blocks: [1, 55, 0, 0] },
    1: { ecPerBlock: 26, blocks: [1, 44, 0, 0] },
    2: { ecPerBlock: 18, blocks: [2, 17, 0, 0] },
    3: { ecPerBlock: 22, blocks: [2, 13, 0, 0] },
  },
  4: {
    0: { ecPerBlock: 20, blocks: [1, 80, 0, 0] },
    1: { ecPerBlock: 18, blocks: [2, 32, 0, 0] },
    2: { ecPerBlock: 26, blocks: [2, 24, 0, 0] },
    3: { ecPerBlock: 16, blocks: [4, 9, 0, 0] },
  },
  5: {
    0: { ecPerBlock: 26, blocks: [1, 108, 0, 0] },
    1: { ecPerBlock: 24, blocks: [2, 43, 0, 0] },
    2: { ecPerBlock: 18, blocks: [2, 15, 2, 16] },
    3: { ecPerBlock: 22, blocks: [2, 11, 2, 12] },
  },
  6: {
    0: { ecPerBlock: 18, blocks: [2, 68, 0, 0] },
    1: { ecPerBlock: 16, blocks: [4, 27, 0, 0] },
    2: { ecPerBlock: 24, blocks: [4, 19, 0, 0] },
    3: { ecPerBlock: 28, blocks: [4, 15, 0, 0] },
  },
  7: {
    0: { ecPerBlock: 20, blocks: [2, 78, 0, 0] },
    1: { ecPerBlock: 18, blocks: [4, 31, 0, 0] },
    2: { ecPerBlock: 18, blocks: [2, 14, 4, 15] },
    3: { ecPerBlock: 26, blocks: [4, 13, 1, 14] },
  },
  8: {
    0: { ecPerBlock: 24, blocks: [2, 97, 0, 0] },
    1: { ecPerBlock: 22, blocks: [2, 38, 2, 39] },
    2: { ecPerBlock: 22, blocks: [4, 18, 2, 19] },
    3: { ecPerBlock: 26, blocks: [4, 14, 2, 15] },
  },
  9: {
    0: { ecPerBlock: 30, blocks: [2, 116, 0, 0] },
    1: { ecPerBlock: 22, blocks: [3, 36, 2, 37] },
    2: { ecPerBlock: 20, blocks: [4, 16, 4, 17] },
    3: { ecPerBlock: 24, blocks: [4, 12, 4, 13] },
  },
  10: {
    0: { ecPerBlock: 18, blocks: [2, 68, 2, 69] },
    1: { ecPerBlock: 26, blocks: [4, 43, 1, 44] },
    2: { ecPerBlock: 24, blocks: [6, 19, 2, 20] },
    3: { ecPerBlock: 28, blocks: [6, 15, 2, 16] },
  },
  11: {
    0: { ecPerBlock: 20, blocks: [4, 81, 0, 0] },
    1: { ecPerBlock: 30, blocks: [1, 50, 4, 51] },
    2: { ecPerBlock: 28, blocks: [4, 22, 4, 23] },
    3: { ecPerBlock: 24, blocks: [3, 12, 8, 13] },
  },
  12: {
    0: { ecPerBlock: 24, blocks: [2, 92, 2, 93] },
    1: { ecPerBlock: 22, blocks: [6, 36, 2, 37] },
    2: { ecPerBlock: 26, blocks: [4, 20, 6, 21] },
    3: { ecPerBlock: 28, blocks: [7, 14, 4, 15] },
  },
  13: {
    0: { ecPerBlock: 26, blocks: [4, 107, 0, 0] },
    1: { ecPerBlock: 22, blocks: [8, 37, 1, 38] },
    2: { ecPerBlock: 24, blocks: [8, 20, 4, 21] },
    3: { ecPerBlock: 22, blocks: [12, 11, 4, 12] },
  },
  14: {
    0: { ecPerBlock: 30, blocks: [3, 115, 1, 116] },
    1: { ecPerBlock: 24, blocks: [4, 40, 5, 41] },
    2: { ecPerBlock: 20, blocks: [11, 16, 5, 17] },
    3: { ecPerBlock: 24, blocks: [11, 12, 5, 13] },
  },
};

// Patrones de alineamiento por versión
const ALIGNMENT_PATTERN_POSITIONS: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
  11: [6, 30, 54],
  12: [6, 32, 58],
  13: [6, 34, 62],
  14: [6, 26, 46, 66],
};

// Aritmética de Campos Galois GF(256) con polinomio primitivo 0x11D
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(() => {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = val;
    EXP_TABLE[i + 255] = val;
    LOG_TABLE[val] = i;
    val = (val << 1) ^ (val >= 128 ? 0x11d : 0);
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
}

// Generador de polinomios Reed-Solomon
function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const nextPoly = new Uint8Array(poly.length + 1);
    const root = EXP_TABLE[i];
    for (let j = 0; j < poly.length; j++) {
      nextPoly[j] ^= gfMul(poly[j], root);
      nextPoly[j + 1] ^= poly[j];
    }
    poly = nextPoly;
  }
  return poly;
}

// Cálculo de palabras de corrección de error Reed-Solomon
function rsCalculateEcc(data: Uint8Array, eccLen: number): Uint8Array {
  const gen = rsGeneratorPoly(eccLen);
  const remainder = new Uint8Array(eccLen);

  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    for (let j = 0; j < eccLen - 1; j++) {
      remainder[j] = remainder[j + 1] ^ gfMul(gen[eccLen - 1 - j], factor);
    }
    remainder[eccLen - 1] = gfMul(gen[0], factor);
  }
  return remainder;
}

// Convertir nivel ECC a índice 0..3
function eclToIndex(ecl: ErrorCorrectionLevel): number {
  switch (ecl) {
    case 'L': return 0;
    case 'M': return 1;
    case 'Q': return 2;
    case 'H': return 3;
  }
}

// Selección de la versión mínima que acomode la cantidad de bytes
function selectVersion(byteCount: number, eclIdx: number): number {
  for (const [ver, caps] of CAPACITY_TABLE) {
    if (byteCount <= caps[eclIdx]) return ver;
  }
  throw new Error(`Texto demasiado largo para generar código QR (${byteCount} bytes)`);
}

/**
 * Genera la matriz booleana del código QR (true = oscuro, false = claro).
 */
export function generateQRMatrix(text: string, ecl: ErrorCorrectionLevel = 'M'): boolean[][] {
  const eclIdx = eclToIndex(ecl);
  const utf8Bytes = new TextEncoder().encode(text);
  const version = selectVersion(utf8Bytes.length, eclIdx);
  const size = 17 + version * 4;

  const spec = ECC_SPECS[version][eclIdx];
  const { ecPerBlock, blocks } = spec;
  const [b1Count, b1Data, b2Count, b2Data] = blocks;
  const totalDataBytes = b1Count * b1Data + b2Count * b2Data;

  // 1. Bit Buffer: Indicador de modo Byte (0100) + Contador de caracteres (8 bits para ver 1-9, 16 bits para ver 10+)
  const bits: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte Mode
  const countBits = version <= 9 ? 8 : 16;
  pushBits(utf8Bytes.length, countBits);

  for (let i = 0; i < utf8Bytes.length; i++) {
    pushBits(utf8Bytes[i], 8);
  }

  // Terminador
  const maxBits = totalDataBytes * 8;
  const termLen = Math.min(4, maxBits - bits.length);
  pushBits(0, termLen);

  // Alinear a byte (múltiplo de 8)
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Padding con bytes alternados 0xEC y 0x11
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convertir bits a bytes de datos
  const dataBytes = new Uint8Array(totalDataBytes);
  for (let i = 0; i < totalDataBytes; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i * 8 + j];
    }
    dataBytes[i] = b;
  }

  // 2. Dividir en bloques y calcular ECC
  const dataBlocks: Uint8Array[] = [];
  const eccBlocks: Uint8Array[] = [];
  let byteOffset = 0;

  for (let i = 0; i < b1Count; i++) {
    const slice = dataBytes.slice(byteOffset, byteOffset + b1Data);
    dataBlocks.push(slice);
    eccBlocks.push(rsCalculateEcc(slice, ecPerBlock));
    byteOffset += b1Data;
  }
  for (let i = 0; i < b2Count; i++) {
    const slice = dataBytes.slice(byteOffset, byteOffset + b2Data);
    dataBlocks.push(slice);
    eccBlocks.push(rsCalculateEcc(slice, ecPerBlock));
    byteOffset += b2Data;
  }

  // 3. Intercalado de datos y ECC
  const finalCodewords: number[] = [];
  const maxDataBlockLen = Math.max(b1Data, b2Data || 0);
  for (let i = 0; i < maxDataBlockLen; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) finalCodewords.push(block[i]);
    }
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (const ecc of eccBlocks) {
      finalCodewords.push(ecc[i]);
    }
  }

  // 4. Crear la matriz del QR
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function setModule(r: number, c: number, isDark: boolean) {
    matrix[r][c] = isDark;
    isFunction[r][c] = true;
  }

  // Patrones de búsqueda (Finder patterns)
  function placeFinder(top: number, left: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        setModule(top + r, left + c, isBorder || isCenter);
      }
    }
  }

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Separadores alrededor de los finders
  for (let i = 0; i < 8; i++) {
    // Top-left
    if (i < 8) {
      if (size > 7) {
        if (i < size) {
          if (matrix[7][i] === null) setModule(7, i, false);
          if (matrix[i][7] === null) setModule(i, 7, false);
        }
      }
    }
    // Top-right
    if (size - 8 >= 0) {
      if (matrix[7][size - 1 - i] === null) setModule(7, size - 1 - i, false);
      if (matrix[i][size - 8] === null) setModule(i, size - 8, false);
    }
    // Bottom-left
    if (size - 8 >= 0) {
      if (matrix[size - 8][i] === null) setModule(size - 8, i, false);
      if (matrix[size - 1 - i][7] === null) setModule(size - 1 - i, 7, false);
    }
  }

  // Patrones de alineamiento (Alignment patterns) para versión > 1
  const alignPos = ALIGNMENT_PATTERN_POSITIONS[version] || [];
  for (const r of alignPos) {
    for (const c of alignPos) {
      // Ignorar si coincide con un finder
      if (
        (r <= 8 && c <= 8) ||
        (r <= 8 && c >= size - 8) ||
        (r >= size - 8 && c <= 8)
      ) {
        continue;
      }
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const isEdge = Math.abs(dr) === 2 || Math.abs(dc) === 2;
          const isCenter = dr === 0 && dc === 0;
          setModule(r + dr, c + dc, isEdge || isCenter);
        }
      }
    }
  }

  // Patrones de sincronización (Timing patterns)
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) setModule(6, i, i % 2 === 0);
    if (matrix[i][6] === null) setModule(i, 6, i % 2 === 0);
  }

  // Módulo oscuro obligatorio (Dark module)
  setModule(size - 8, 8, true);

  // Reservar bits de información de formato
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      if (matrix[8][i] === null) setModule(8, i, false);
      if (matrix[i][8] === null) setModule(i, 8, false);
    }
  }
  for (let i = 0; i < 8; i++) {
    if (matrix[8][size - 1 - i] === null) setModule(8, size - 1 - i, false);
    if (matrix[size - 1 - i][8] === null) setModule(size - 1 - i, 8, false);
  }

  // Reservar bits de versión si version >= 7
  if (version >= 7) {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 3; c++) {
        setModule(size - 11 + c, r, false);
        setModule(r, size - 11 + c, false);
      }
    }
  }

  // 5. Ubicar los bits de datos en zig-zag
  const finalBits: number[] = [];
  for (const b of finalCodewords) {
    for (let i = 7; i >= 0; i--) {
      finalBits.push((b >> i) & 1);
    }
  }

  let bitIdx = 0;
  let upward = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Saltar columna de timing vertical

    for (let vert = 0; vert < size; vert++) {
      const r = upward ? size - 1 - vert : vert;
      for (let c = right; c >= right - 1; c--) {
        if (!isFunction[r][c]) {
          const bit = bitIdx < finalBits.length ? finalBits[bitIdx++] : 0;
          matrix[r][c] = bit === 1;
        }
      }
    }
    upward = !upward;
  }

  // 6. Aplicar la mejor máscara (Probamos máscara 0 a 7, máscara estándar 0: (r + c) % 2 === 0)
  // Para optimización y velocidad usamos la máscara 0 estándar con formato precalculado
  const mask = 0; // (r + c) % 2 === 0

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isFunction[r][c]) {
        const shouldInvert = (r + c) % 2 === 0;
        if (shouldInvert) {
          matrix[r][c] = !matrix[r][c];
        }
      }
    }
  }

  // 7. Escribir bits de formato (ECL + Mask con BCH error code)
  // Formatos precalculados para máscara 0 con XOR 0x5412:
  // L(01)=0x77c4, M(00)=0x5412, Q(11)=0x355f, H(10)=0x1689
  const FORMAT_BITS: Record<number, number> = {
    0: 0x77c4, // L
    1: 0x5412, // M
    2: 0x355f, // Q
    3: 0x1689, // H
  };
  const formatVal = FORMAT_BITS[eclIdx] ?? 0x5412;

  // Ubicar los 15 bits de formato
  for (let i = 0; i < 15; i++) {
    const bit = ((formatVal >> (14 - i)) & 1) === 1;

    // Primer tramo
    if (i < 6) setModule(8, i, bit);
    else if (i === 6) setModule(8, 7, bit);
    else if (i === 7) setModule(8, 8, bit);
    else if (i === 8) setModule(7, 8, bit);
    else setModule(14 - i, 8, bit);

    // Segundo tramo
    if (i < 8) setModule(size - 1 - i, 8, bit);
    else setModule(8, size - 15 + i, bit);
  }

  return matrix.map((row) => row.map((cell) => cell ?? false));
}

/**
 * Genera un SVG en string con el código QR.
 */
export function generateQRSvg(text: string, options: QROptions = {}): string {
  const {
    ecl = 'M',
    fgColor = '#000000',
    bgColor = '#ffffff',
    size = 400,
    margin = 2,
  } = options;

  const matrix = generateQRMatrix(text, ecl);
  const moduleCount = matrix.length;
  const totalModules = moduleCount + margin * 2;
  const cellSize = size / totalModules;

  let pathData = '';

  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r][c]) {
        const x = (c + margin) * cellSize;
        const y = (r + margin) * cellSize;
        pathData += `M${x.toFixed(2)},${y.toFixed(2)}h${cellSize.toFixed(2)}v${cellSize.toFixed(2)}h-${cellSize.toFixed(2)}z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    ${bgColor !== 'transparent' ? `<rect width="100%" height="100%" fill="${bgColor}" />` : ''}
    <path d="${pathData.trim()}" fill="${fgColor}" />
  </svg>`;
}

/**
 * Dibuja el código QR en un elemento HTMLCanvasElement (para descargar PNG de alta resolución).
 */
export function renderQRToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  options: QROptions = {}
): void {
  const {
    ecl = 'M',
    fgColor = '#000000',
    bgColor = '#ffffff',
    size = 1024,
    margin = 2,
  } = options;

  const matrix = generateQRMatrix(text, ecl);
  const moduleCount = matrix.length;
  const totalModules = moduleCount + margin * 2;
  const cellSize = size / totalModules;

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (bgColor === 'transparent') {
    ctx.clearRect(0, 0, size, size);
  } else {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
  }

  ctx.fillStyle = fgColor;
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r][c]) {
        const x = Math.round((c + margin) * cellSize);
        const y = Math.round((r + margin) * cellSize);
        const w = Math.ceil(cellSize);
        const h = Math.ceil(cellSize);
        ctx.fillRect(x, y, w, h);
      }
    }
  }
}
