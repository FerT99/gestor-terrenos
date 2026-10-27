/**
 * Utilidades de seguridad para el frontend.
 *
 * IMPORTANTE: Todo lo que se valida aquí es la PRIMERA línea de defensa
 * (mejora la UX y evita mandar basura al servidor). Un atacante puede saltarse
 * el navegador y llamar la API directamente, así que el backend SIEMPRE debe:
 *   - Usar consultas parametrizadas ($1, $2...) — nunca concatenar SQL.
 *   - Repetir estas validaciones.
 *   - Obtener usuario/rol del JWT verificado, no de headers enviados por el cliente.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ─── Sanitización de texto ────────────────────────────────────────────────────

// Caracteres de control (excepto \t \n \r), caracteres de ancho cero y
// marcas de dirección bidi que se usan para ocultar/engañar contenido.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;
const ANGLE_BRACKETS = /[<>]/g;

/** Campos que nunca se deben modificar (cambiarlos rompería el login). */
const NO_SANITIZE_KEYS = new Set(['password', 'contrasena', 'contraseña']);

const DEFAULT_MAX_LENGTH = 500;

/**
 * Limpia un texto: normaliza Unicode, quita caracteres de control/invisibles,
 * quita `<` y `>` (evita inyección de HTML/scripts), recorta espacios y limita longitud.
 */
export function sanitizeText(value: string, maxLength = DEFAULT_MAX_LENGTH): string {
  return value
    .normalize('NFC')
    .replace(CONTROL_CHARS, '')
    .replace(ANGLE_BRACKETS, '')
    .trim()
    .slice(0, maxLength);
}

/** Sanitiza recursivamente cualquier objeto/array antes de enviarlo a la API. */
export function sanitizeDeep<T>(value: T, key?: string): T {
  if (key && NO_SANITIZE_KEYS.has(key)) return value;
  if (typeof value === 'string') return sanitizeText(value) as T;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new ValidationError(`El campo "${key ?? 'valor'}" debe ser un número válido`);
    return value;
  }
  if (Array.isArray(value)) return value.map((v) => sanitizeDeep(v, key)) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // Bloquea claves usadas para "prototype pollution"
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      out[k] = sanitizeDeep(v, k);
    }
    return out as T;
  }
  return value;
}

// ─── Validadores básicos ──────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;
const PHONE_RE = /^[0-9+()\-\s.]{7,25}$/;
// IDs: UUIDs u otros identificadores simples. Bloquea "/", "..", "?", "#", etc.
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

export const isValidEmail = (v: string) => v.length <= 254 && EMAIL_RE.test(v);
export const isValidPhone = (v: string) => PHONE_RE.test(v);
export const isValidId = (v: string) => ID_RE.test(v);
export const isValidDate = (v: string) => v.length <= 40 && !Number.isNaN(Date.parse(v));

/**
 * Valida un ID antes de meterlo en una URL de la API.
 * Evita path traversal (`../`) y manipulación de rutas/query strings.
 */
export function safeId(id: string): string {
  if (typeof id !== 'string' || !isValidId(id)) {
    throw new ValidationError('Identificador inválido');
  }
  return encodeURIComponent(id);
}

/**
 * Devuelve la URL solo si usa http(s). Bloquea `javascript:`, `data:`, `vbscript:`, etc.
 * Úsalo en todos los `href` / `src` que vengan de datos del usuario o de la BD.
 */
export function safeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : undefined;
  } catch {
    return undefined;
  }
}

// ─── Validación por esquema ───────────────────────────────────────────────────

type FieldRule =
  | { type: 'text'; label: string; required?: boolean; max?: number; oneOf?: string[] }
  | { type: 'email'; label: string; required?: boolean }
  | { type: 'phone'; label: string; required?: boolean }
  | { type: 'id'; label: string; required?: boolean }
  | { type: 'idArray'; label: string; required?: boolean }
  | { type: 'date'; label: string; required?: boolean }
  | { type: 'url'; label: string; required?: boolean }
  | { type: 'number'; label: string; required?: boolean; min?: number; max?: number; integer?: boolean; gt?: number }
  | { type: 'boolean'; label: string; required?: boolean }
  | { type: 'password'; label: string; required?: boolean; min?: number };

export type Schema = Record<string, FieldRule>;

const isEmpty = (v: unknown) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

/**
 * Valida y sanitiza un payload según un esquema.
 * - `partial: true` → solo valida los campos presentes (para PATCH/updates parciales).
 * - Los campos que no están en el esquema se sanitizan de forma genérica.
 */
export function validate<T extends object>(input: T, schema: Schema, partial = false): T {
  if (!input || typeof input !== 'object') throw new ValidationError('Datos inválidos');
  const data = { ...(input as Record<string, unknown>) };

  for (const [key, rule] of Object.entries(schema)) {
    const raw = data[key];

    if (isEmpty(raw)) {
      if (rule.required && !partial) throw new ValidationError(`${rule.label} es obligatorio`);
      continue;
    }

    switch (rule.type) {
      case 'text': {
        if (typeof raw !== 'string') throw new ValidationError(`${rule.label} debe ser texto`);
        const max = rule.max ?? DEFAULT_MAX_LENGTH;
        if (raw.trim().length > max) throw new ValidationError(`${rule.label} no puede exceder ${max} caracteres`);
        const clean = sanitizeText(raw, max);
        if (rule.oneOf && !rule.oneOf.some((o) => o.toLowerCase() === clean.toLowerCase())) {
          throw new ValidationError(`${rule.label} tiene un valor no permitido`);
        }
        data[key] = clean;
        break;
      }
      case 'email': {
        const clean = sanitizeText(String(raw), 254).toLowerCase();
        if (!isValidEmail(clean)) throw new ValidationError(`${rule.label} no es un correo válido`);
        data[key] = clean;
        break;
      }
      case 'phone': {
        const clean = sanitizeText(String(raw), 25);
        if (!isValidPhone(clean)) throw new ValidationError(`${rule.label} solo puede contener números, espacios, +, -, ( )`);
        data[key] = clean;
        break;
      }
      case 'id': {
        if (typeof raw !== 'string' || !isValidId(raw)) throw new ValidationError(`${rule.label} es inválido`);
        break;
      }
      case 'idArray': {
        if (!Array.isArray(raw) || raw.some((v) => typeof v !== 'string' || !isValidId(v))) {
          throw new ValidationError(`${rule.label} contiene identificadores inválidos`);
        }
        break;
      }
      case 'date': {
        if (typeof raw !== 'string' || !isValidDate(raw)) throw new ValidationError(`${rule.label} no es una fecha válida`);
        break;
      }
      case 'url': {
        const clean = safeUrl(String(raw));
        if (!clean) throw new ValidationError(`${rule.label} no es una URL válida`);
        data[key] = clean;
        break;
      }
      case 'number': {
        const n = typeof raw === 'number' ? raw : Number(raw);
        if (!Number.isFinite(n)) throw new ValidationError(`${rule.label} debe ser un número válido`);
        if (rule.integer && !Number.isInteger(n)) throw new ValidationError(`${rule.label} debe ser un número entero`);
        if (rule.gt !== undefined && !(n > rule.gt)) throw new ValidationError(`${rule.label} debe ser mayor a ${rule.gt}`);
        if (rule.min !== undefined && n < rule.min) throw new ValidationError(`${rule.label} no puede ser menor a ${rule.min}`);
        if (rule.max !== undefined && n > rule.max) throw new ValidationError(`${rule.label} no puede ser mayor a ${rule.max}`);
        data[key] = n;
        break;
      }
      case 'boolean': {
        if (typeof raw !== 'boolean') throw new ValidationError(`${rule.label} debe ser verdadero o falso`);
        break;
      }
      case 'password': {
        if (typeof raw !== 'string') throw new ValidationError(`${rule.label} es inválida`);
        const min = rule.min ?? 8;
        if (raw.length < min) throw new ValidationError(`${rule.label} debe tener al menos ${min} caracteres`);
        if (raw.length > 128) throw new ValidationError(`${rule.label} es demasiado larga`);
        break;
      }
    }
  }

  // Sanitiza el resto de campos que no estén en el esquema
  const rest: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) if (!(k in schema)) rest[k] = v;
  return { ...data, ...sanitizeDeep(rest) } as T;
}

/** Valida (si hay esquema), sanitiza y serializa el body de una petición. */
export function secureBody(input: object, schema?: Schema, partial = false): string {
  const clean = schema ? validate(input, schema, partial) : sanitizeDeep(input);
  return JSON.stringify(clean);
}

// ─── Esquemas por entidad ─────────────────────────────────────────────────────

const MONEDAS = ['MXN', 'USD'];

export const schemas = {
  parcela: {
    nombre: { type: 'text', label: 'El nombre de la parcela', required: true, max: 120 },
    descripcion: { type: 'text', label: 'La descripción', max: 1000 },
    comision_base: { type: 'number', label: 'La comisión', min: 0, max: 100 },
  },
  terreno: {
    clave: { type: 'text', label: 'La clave', required: true, max: 50 },
    nombre: { type: 'text', label: 'El nombre', max: 150 },
    fase: { type: 'text', label: 'La fase', max: 50 },
    superficie_m2: { type: 'number', label: 'La superficie', min: 0, max: 100_000_000 },
    precio_lista: { type: 'number', label: 'El precio', min: 0, max: 100_000_000_000 },
    propietario: { type: 'text', label: 'El propietario', max: 150 },
    estado: { type: 'text', label: 'El estado', oneOf: ['disponible', 'apartado', 'vendido'] },
    coordenadas: { type: 'text', label: 'Las coordenadas', max: 20000 },
    notas: { type: 'text', label: 'Las notas', max: 2000 },
    moneda: { type: 'text', label: 'La moneda', oneOf: MONEDAS },
    vendedor_id: { type: 'id', label: 'El vendedor' },
  },
  cliente: {
    nombre_completo: { type: 'text', label: 'El nombre', required: true, max: 150 },
    email: { type: 'email', label: 'El correo' },
    telefono: { type: 'phone', label: 'El teléfono' },
    direccion: { type: 'text', label: 'La dirección', max: 500 },
    estado: { type: 'text', label: 'El estado', max: 30 },
  },
  planPago: {
    terreno_id: { type: 'id', label: 'El terreno', required: true },
    cliente_id: { type: 'id', label: 'El cliente', required: true },
    monto_total: { type: 'number', label: 'El monto total', required: true, gt: 0, max: 100_000_000_000 },
    enganche: { type: 'number', label: 'El enganche', min: 0, max: 100_000_000_000 },
    plazos: { type: 'number', label: 'Los plazos', integer: true, min: 0, max: 600 },
    tasa_interes: { type: 'number', label: 'La tasa de interés', min: 0, max: 100 },
    fecha_inicio: { type: 'date', label: 'La fecha de inicio', required: true },
    moneda: { type: 'text', label: 'La moneda', oneOf: MONEDAS },
  },
  abono: {
    periodo_pago_id: { type: 'id', label: 'El periodo de pago', required: true },
    monto_pagado: { type: 'number', label: 'El monto pagado', required: true, min: 0, max: 100_000_000_000 },
    fecha_pago: { type: 'date', label: 'La fecha de pago', required: true },
    metodo_pago: { type: 'text', label: 'El método de pago', max: 50 },
    notas: { type: 'text', label: 'Las notas', max: 2000 },
    tipo_cambio: { type: 'number', label: 'El tipo de cambio', gt: 0, max: 1000 },
    mora_aplicada: { type: 'number', label: 'La mora', min: 0, max: 100_000_000_000 },
    moneda: { type: 'text', label: 'La moneda', oneOf: MONEDAS },
    comprobante_url: { type: 'url', label: 'El comprobante' },
  },
  comprobante: {
    comprobante_url: { type: 'url', label: 'El comprobante', required: true },
  },
  egreso: {
    fecha: { type: 'date', label: 'La fecha', required: true },
    concepto: { type: 'text', label: 'El concepto', required: true, max: 200 },
    monto: { type: 'number', label: 'El monto', required: true, gt: 0, max: 100_000_000_000 },
    categoria: { type: 'text', label: 'La categoría', max: 80 },
    descripcion: { type: 'text', label: 'La descripción', max: 2000 },
  },
  vendedor: {
    email: { type: 'email', label: 'El correo', required: true },
    password: { type: 'password', label: 'La contraseña', required: true, min: 8 },
    nombre_completo: { type: 'text', label: 'El nombre', max: 150 },
    nombre: { type: 'text', label: 'El nombre', max: 150 },
    rol: { type: 'text', label: 'El rol', oneOf: ['admin', 'vendedor'] },
    parcela_ids: { type: 'idArray', label: 'Las parcelas' },
  },
  asignarParcelas: {
    parcela_ids: { type: 'idArray', label: 'Las parcelas', required: true },
  },
  configuracion: {
    razon_social: { type: 'text', label: 'La razón social', max: 200 },
    rfc: { type: 'text', label: 'El RFC', max: 20 },
    direccion_fiscal: { type: 'text', label: 'La dirección fiscal', max: 500 },
    email_soporte: { type: 'email', label: 'El correo de soporte' },
    telefono_contacto: { type: 'phone', label: 'El teléfono de contacto' },
    comision_base: { type: 'number', label: 'La comisión', min: 0, max: 100 },
    porcentaje_mora: { type: 'number', label: 'El porcentaje de mora', min: 0, max: 100 },
    permitir_dias_gracia: { type: 'boolean', label: 'Permitir días de gracia' },
    dias_gracia: { type: 'number', label: 'Los días de gracia', integer: true, min: 0, max: 365 },
    tipo_cambio_usd: { type: 'number', label: 'El tipo de cambio', gt: 0, max: 1000 },
    tipo_cambio_actualizado_at: { type: 'date', label: 'La fecha del tipo de cambio' },
    idioma: { type: 'text', label: 'El idioma', max: 10 },
    notificaciones_email: { type: 'boolean', label: 'Notificaciones por email' },
    notificaciones_slack: { type: 'boolean', label: 'Notificaciones por Slack' },
  },
} satisfies Record<string, Schema>;

// ─── Archivos ─────────────────────────────────────────────────────────────────

interface FileRules {
  maxBytes: number;
  /** MIME type → extensión que se usará al guardar (nunca se confía en el nombre original). */
  allowed: Record<string, string>;
}

export const FILE_RULES = {
  comprobante: {
    maxBytes: 10 * 1024 * 1024, // 10 MB
    allowed: {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/heic': 'heic',
      'application/pdf': 'pdf',
    },
  },
  excel: {
    maxBytes: 15 * 1024 * 1024, // 15 MB
    allowed: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-excel': 'xls',
    },
  },
} satisfies Record<string, FileRules>;

/**
 * Valida tipo y tamaño de un archivo. Devuelve la extensión segura a usar.
 * Bloquea, por ejemplo, subir un `.html` o `.svg` con scripts disfrazado de comprobante.
 */
export function validateFile(file: File, rules: FileRules): string {
  if (file.size === 0) throw new ValidationError('El archivo está vacío');
  if (file.size > rules.maxBytes) {
    throw new ValidationError(`El archivo no puede pesar más de ${Math.round(rules.maxBytes / 1024 / 1024)} MB`);
  }
  const nameExt = file.name.split('.').pop()?.toLowerCase() ?? '';
  const extFromMime = rules.allowed[file.type];
  // Algunos navegadores no reportan MIME para Excel; en ese caso validamos por extensión.
  const extFromName = Object.values(rules.allowed).includes(nameExt) && !file.type ? nameExt : undefined;
  const ext = extFromMime ?? extFromName;
  if (!ext) {
    throw new ValidationError(`Tipo de archivo no permitido. Formatos aceptados: ${[...new Set(Object.values(rules.allowed))].join(', ')}`);
  }
  return ext;
}
