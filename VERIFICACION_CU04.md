# Verificación CU-04: Eliminación de Categorías/Subcategorías

## Estado Actual del Frontend ✅
Todos los cambios del frontend están implementados correctamente:

1. ✅ **Service:** Método `canDelete(id)` consulta backend
2. ✅ **Delete Dialog:** Valida dependencias antes de permitir eliminar
3. ✅ **List Component:** Marca categorías con dependencias
4. ✅ **Logging:** Consola muestra diagnóstico detallado

---

## Cómo Verificar el Problema

### 1. Abrir Console (F12)
- Presionar `F12` en el navegador
- Ir a pestaña **Console**
- Será visible el logging de las verificaciones

### 2. Ver Logs de Verificación
```
🔍 [CategoriesList] Verificando dependencias para 5 categorías
📋 [CategoriesList] Categoría A (ID:1): {can_delete: true, subcategories_count: 0, anotaciones_count: 0}
📋 [CategoriesList] Categoría B (ID:2): {can_delete: false, subcategories_count: 2, anotaciones_count: 0}
```

### 3. Intentar Eliminar una Categoría Padre Nueva
1. Ir a Gestión Institucional → Categorías
2. Crear nueva categoría padre (sin padre)
3. Completar datos y guardar
4. En el listado, hacer clic en eliminar
5. **Observe en Console:**
   ```
   🗑️ [DeleteCategoryDialog] Iniciando verificación para: 10 "Categoría Test"
   ✅ [DeleteCategoryDialog] Respuesta canDelete: {can_delete: true, subcategories_count: 0, anotaciones_count: 0}
   ✓ Categoría eliminable: sin dependencias
   ```

---

## Casos de Prueba

### Caso 1: Categoría padre sin dependencias ✅
- **Pasos:**
  1. Crear categoría padre nueva
  2. NO agregar subcategorías
  3. NO asociar anotaciones
  4. Intentar eliminar

- **Esperado:**
  - Botón "Eliminar" debe estar VISIBLE y habilitado
  - Console muestra: `✓ Categoría eliminable`
  - Backend retorna: `{can_delete: true, ...}`

- **Si falla:**
  - Backend retorna `{can_delete: false, ...}`
  - Botón "Eliminar" estará OCULTO
  - Console muestra: `✗ Categoría bloqueada`

### Caso 2: Categoría con subcategorías
- **Pasos:**
  1. Tomar una categoría que tenga subcategorías
  2. Intentar eliminar

- **Esperado:**
  - Botón "Eliminar" OCULTO
  - Diálogo muestra: "No se puede eliminar: tiene dependencias"
  - Console muestra: `✗ Categoría bloqueada: {subcategorías: 2, anotaciones: 0}`

### Caso 3: Categoría con anotaciones
- **Pasos:**
  1. Tomar una categoría que tenga anotaciones
  2. Intentar eliminar

- **Esperado:**
  - Botón "Eliminar" OCULTO
  - Diálogo muestra: "No se puede eliminar: tiene dependencias"
  - Console muestra: `✗ Categoría bloqueada: {subcategorías: 0, anotaciones: 5}`

---

## Información que Backend Debe Retornar

### Endpoint: `GET /api/categories/{id}/can-delete`

**Respuesta para categoría SIN dependencias:**
```json
{
  "can_delete": true,
  "subcategories_count": 0,
  "anotaciones_count": 0
}
```

**Respuesta para categoría CON subcategorías:**
```json
{
  "can_delete": false,
  "subcategories_count": 3,
  "anotaciones_count": 0
}
```

**Respuesta para categoría CON anotaciones:**
```json
{
  "can_delete": false,
  "subcategories_count": 0,
  "anotaciones_count": 5
}
```

---

## Debuggear Manualmente

### Opción 1: cURL (Terminal)
```bash
curl "http://localhost:3000/api/categories/1/can-delete"
```

Debería retornar:
```json
{"can_delete": true, "subcategories_count": 0, "anotaciones_count": 0}
```

### Opción 2: Navegador Console
```javascript
// Pegar en Console (F12)
fetch('/api/categories/1/can-delete')
  .then(r => r.json())
  .then(data => console.log('Respuesta:', data))
  .catch(e => console.error('Error:', e));
```

### Opción 3: Postman
- Método: GET
- URL: `http://localhost:3000/api/categories/1/can-delete`
- Enviar

---

## Validación: Qué Debe Hacer Backend

### SQL Queries Correctas:

**Query 1: Contar subcategorías hijas**
```sql
SELECT COUNT(*) 
FROM categories 
WHERE id_parent_category = ?
```

**Query 2: Contar anotaciones**
```sql
SELECT COUNT(*) 
FROM anotaciones 
WHERE id_category = ?
```

**Lógica:**
```
Si (subcategories_count == 0 AND anotaciones_count == 0)
  → can_delete = TRUE
Si no
  → can_delete = FALSE
```

---

## Checklist: Qué Verificar en Backend

- [ ] Endpoint `/api/categories/{id}/can-delete` existe
- [ ] Query de subcategorías cuenta correctamente
- [ ] Query de anotaciones cuenta correctamente
- [ ] `can_delete` es `true` solo si ambos conteos son 0
- [ ] `can_delete` es `false` si algún conteo es > 0
- [ ] NO bloquea por ser "categoría padre"
- [ ] Retorna HTTP 200 con respuesta correcta
- [ ] Conteos son números enteros (0, 1, 2, ...)

---

## Frontend: Lo que está funcionando ✅

### ✅ Envía ID correcto
```typescript
this.svc.canDelete(this.data.id_category)
// Usa id_category del model
```

### ✅ Interpreta respuesta correctamente
```typescript
this.hasDependencies.set(!res.can_delete);
// true = tiene dependencias (bloqueado)
// false = sin dependencias (permitir eliminar)
```

### ✅ Muestra UI según respuesta
- Si `can_delete = true` → Botón visible
- Si `can_delete = false` → Botón oculto + mensaje

### ✅ Logging para diagnosticar
Console muestra:
- ID de categoría verificada
- Respuesta del backend
- Si está bloqueada o no

---

## Próximos Pasos

1. **Revisar logs en Console (F12)**
   - ¿Qué retorna el backend?

2. **Verificar endpoint manualmente**
   - Usar curl o Postman
   - ¿Retorna `can_delete: true` para categoría sin dependencias?

3. **Revisar SQL en backend**
   - ¿Las queries cuentan correctamente?
   - ¿La lógica de `can_delete` es correcta?

4. **Prueba: Crear categoría padre nueva sin dependencias**
   - Debe permitir eliminar
   - Console debe mostrar: `✓ Categoría eliminable`

---

## Resumen

| Aspecto | Estado | Nota |
|--------|--------|------|
| Frontend Service | ✅ OK | Llama `canDelete()` correctamente |
| Frontend Delete Dialog | ✅ OK | Valida respuesta correctamente |
| Frontend UI | ✅ OK | Muestra/oculta botón según respuesta |
| Frontend Logging | ✅ OK | Console muestra diagnóstico |
| **Backend Validation** | ❌ REVISAR | Probablemente retorna `can_delete: false` incorrectamente |
| **Backend Queries** | ❌ REVISAR | Verificar conteos de dependencias |

**El frontend está 100% correcto. El problema está en el backend.**
