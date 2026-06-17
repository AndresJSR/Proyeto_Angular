# Requisitos Backend - CU-04: Gestión de Categorías y Subcategorías (Eliminación)

## Descripción General
El backend debe validar las dependencias ANTES de permitir la eliminación de una categoría o subcategoría. Esta validación debe cumplir con los requisitos funcionales del CU-04.

---

## Endpoints Requeridos

### 1. Verificar capacidad de eliminación
**Endpoint:** `GET /api/categories/{id}/can-delete`

**Propósito:** Valida si una categoría puede ser eliminada sin dependencias.

**Respuesta exitosa (HTTP 200):**
```json
{
  "can_delete": true|false,
  "subcategories_count": 0,
  "anotaciones_count": 0
}
```

**Campos:**
- `can_delete` (boolean): Indica si la categoría puede ser eliminada
- `subcategories_count` (number): Cantidad de subcategorías hijas
- `anotaciones_count` (number): Cantidad de anotaciones asociadas

**Lógica de validación:**
- `can_delete = true` SOLO si:
  - NO tiene subcategorías hijas (subcategories_count = 0)
  - NO tiene anotaciones asociadas (anotaciones_count = 0)
- `can_delete = false` si:
  - Tiene subcategorías hijas (subcategories_count > 0) O
  - Tiene anotaciones asociadas (anotaciones_count > 0)

---

### 2. Eliminar categoría (con validación)
**Endpoint:** `DELETE /api/categories/{id}`

**Validaciones previas:**
1. Verificar que la categoría existe
2. Verificar que NO tiene subcategorías hijas
3. Verificar que NO tiene anotaciones asociadas

**Respuesta si CAN delete (HTTP 200):**
```json
{
  "message": "Categoría eliminada correctamente"
}
```

**Respuesta si CANNOT delete (HTTP 409 - Conflict):**
```json
{
  "message": "No se puede eliminar esta categoría porque tiene subcategorías o anotaciones asociadas. Reasigne o elimine las dependencias antes de continuar.",
  "error": {
    "code": "DELETION_BLOCKED_DEPENDENCIES",
    "subcategories_count": 3,
    "anotaciones_count": 5
  }
}
```

**Respuesta si no existe (HTTP 404):**
```json
{
  "message": "Categoría no encontrada",
  "error": {
    "code": "NOT_FOUND"
  }
}
```

---

## Validaciones Funcionales (CU-04)

### Regla 1: No tener subcategorías hijas
- Una categoría con `id_parent_category = {id}` de otra categoría es una dependencia
- Buscar en la tabla `categories` donde `id_parent_category = {id}`
- Si hay registros, retornar el count en `subcategories_count`

### Regla 2: No tener anotaciones asociadas
- Una anotación asociada a una categoría es una dependencia
- Buscar en la tabla `anotaciones` donde `id_category = {id}` 
- Si hay registros, retornar el count en `anotaciones_count`

### Comportamiento esperado
1. **Verificación previa (can-delete):** Mostrar advertencia ANTES de intentar eliminar
2. **Eliminación bloqueada:** No eliminar en cascada, rechazar con mensaje claro
3. **Mensaje al usuario:** "No se puede eliminar esta categoría porque tiene subcategorías o anotaciones asociadas. Reasigne o elimine las dependencias antes de continuar."

---

## Casos de Uso

### Caso 1: Categoría sin dependencias → PERMITIR ELIMINACIÓN
```
GET /api/categories/1/can-delete
{
  "can_delete": true,
  "subcategories_count": 0,
  "anotaciones_count": 0
}
DELETE /api/categories/1 → HTTP 200 ✓
```

### Caso 2: Categoría con subcategorías → BLOQUEAR ELIMINACIÓN
```
GET /api/categories/1/can-delete
{
  "can_delete": false,
  "subcategories_count": 3,
  "anotaciones_count": 0
}
DELETE /api/categories/1 → HTTP 409
{
  "message": "No se puede eliminar esta categoría porque tiene subcategorías o anotaciones asociadas..."
}
```

### Caso 3: Categoría con anotaciones → BLOQUEAR ELIMINACIÓN
```
GET /api/categories/1/can-delete
{
  "can_delete": false,
  "subcategories_count": 0,
  "anotaciones_count": 5
}
DELETE /api/categories/1 → HTTP 409
```

### Caso 4: Categoría con AMBAS dependencias → BLOQUEAR ELIMINACIÓN
```
GET /api/categories/1/can-delete
{
  "can_delete": false,
  "subcategories_count": 2,
  "anotaciones_count": 3
}
DELETE /api/categories/1 → HTTP 409
```

---

## Notas Importantes

✅ **Validar SIEMPRE en el backend** - El frontend es solo UI, nunca confiar solo en validación cliente

✅ **No eliminar en cascada** - No forzar eliminación de dependencias automáticamente

✅ **Mensaje consistente** - Usar el mensaje estándar del CU-04 para coherencia

✅ **Conteos precisos** - Retornar los conteos exactos de dependencias para informar al usuario

✅ **Errores HTTP apropiados** - HTTP 409 para conflictos de dependencias, HTTP 404 para no encontrado

---

## Integración Frontend-Backend

El frontend ya implementa:
1. ✓ Consulta `GET /api/categories/{id}/can-delete` antes de permitir eliminar
2. ✓ Valida `can_delete = true` para habilitar botón de eliminar
3. ✓ Muestra conteos de dependencias al usuario
4. ✓ Maneja error HTTP 409 con mensaje claro
5. ✓ Impide eliminación en cascada desde frontend

**Frontend espera que el backend valide y retorne error si intenta eliminar con dependencias.**
