# Backend: Validación de Eliminación de Categorías (CU-04)

## Requisito del Backend

El endpoint `DELETE /api/categories/{id}` DEBE validar ANTES de eliminar:

### Validación 1: Contar Subcategorías Hijas
```sql
SELECT COUNT(*) as count
FROM categories
WHERE id_parent_category = {id}
```

**Solo es bloqueante si COUNT > 0**

### Validación 2: Contar Anotaciones
```sql
SELECT COUNT(*) as count
FROM anotaciones
WHERE id_category = {id}
```

**Solo es bloqueante si COUNT > 0**

---

## Lógica de Eliminación

```
IF (subcategories_count == 0 AND anotaciones_count == 0) THEN
  ✅ PERMITIR ELIMINACIÓN
  Retornar: HTTP 200
ELSE IF (subcategories_count > 0 OR anotaciones_count > 0) THEN
  ❌ BLOQUEAR ELIMINACIÓN
  Retornar: HTTP 409 Conflict
  {
    "message": "No se puede eliminar esta categoría porque tiene subcategorías o anotaciones asociadas. Reasigne o elimine las dependencias antes de continuar."
  }
END IF
```

---

## Casos de Prueba Específicos

### ✅ Caso 1: Categoría NUEVA sin dependencias
**Setup:**
- Crear categoría padre nueva
- Sin subcategorías
- Sin anotaciones

**DELETE /api/categories/{id}:**
```
SELECT COUNT(*) FROM categories WHERE id_parent_category = 1  → 0
SELECT COUNT(*) FROM anotaciones WHERE id_category = 1        → 0

Resultado: ✅ PERMITIR
HTTP 200
{"message": "Categoría eliminada correctamente"}
```

### ❌ Caso 2: Categoría con subcategorías
**Setup:**
- Categoría padre ID=1
- Tiene 2 subcategorías hijas

**DELETE /api/categories/1:**
```
SELECT COUNT(*) FROM categories WHERE id_parent_category = 1  → 2
SELECT COUNT(*) FROM anotaciones WHERE id_category = 1        → 0

Resultado: ❌ BLOQUEAR
HTTP 409
{
  "message": "No se puede eliminar esta categoría porque tiene subcategorías o anotaciones asociadas. Reasigne o elimine las dependencias antes de continuar."
}
```

### ❌ Caso 3: Categoría con anotaciones
**Setup:**
- Categoría ID=1
- Tiene 3 anotaciones

**DELETE /api/categories/1:**
```
SELECT COUNT(*) FROM categories WHERE id_parent_category = 1  → 0
SELECT COUNT(*) FROM anotaciones WHERE id_category = 1        → 3

Resultado: ❌ BLOQUEAR
HTTP 409
{
  "message": "No se puede eliminar esta categoría porque tiene subcategorías o anotaciones asociadas. Reasigne o elimine las dependencias antes de continuar."
}
```

### ❌ Caso 4: Categoría con AMBAS
**Setup:**
- Categoría ID=1
- Tiene 2 subcategorías
- Tiene 5 anotaciones

**DELETE /api/categories/1:**
```
SELECT COUNT(*) FROM categories WHERE id_parent_category = 1  → 2
SELECT COUNT(*) FROM anotaciones WHERE id_category = 1        → 5

Resultado: ❌ BLOQUEAR
HTTP 409
{
  "message": "No se puede eliminar esta categoría porque tiene subcategorías o anotaciones asociadas. Reasigne o elimine las dependencias antes de continuar."
}
```

---

## Lo que el Frontend Hará

### Flujo Cuando Backend es Correcto:

**1. Categoría sin dependencias:**
```
DELETE /api/categories/1
↓
Backend retorna: HTTP 200
↓
Frontend muestra: ✓ Categoría eliminada correctamente
↓
Diálogo se cierra
↓
Listado se recarga
```

**2. Categoría con dependencias:**
```
DELETE /api/categories/1
↓
Backend retorna: HTTP 409 + mensaje
↓
Frontend muestra: Error en snackbar con mensaje del backend
↓
Diálogo permanece abierto
```

---

## Importancia: NO Confundir

❌ **INCORRECTO: Bloquear porque es padre**
```sql
-- ❌ WRONG - Bloquea TODAS las categorías padre
IF (id_parent_category IS NULL) THEN
  RETURN HTTP 409 "Es una categoría padre"
```

✅ **CORRECTO: Bloquear solo si tiene hijos**
```sql
-- ✅ CORRECT - Solo bloquea si TIENE subcategorías hijas
SELECT COUNT(*) FROM categories WHERE id_parent_category = {id}
IF (count > 0) THEN
  RETURN HTTP 409
```

**Diferencia:**
- Una categoría PUEDE ser padre (raíz) sin tener subcategorías hijas
- Solo debe bloquearse si REALMENTE tiene subcategorías hijas

---

## Checklist: Backend

- [ ] Endpoint DELETE /api/categories/{id} existe
- [ ] Valida: COUNT(*) FROM categories WHERE id_parent_category = {id}
- [ ] Valida: COUNT(*) FROM anotaciones WHERE id_category = {id}
- [ ] Si ambos = 0: Retorna HTTP 200 (elimina)
- [ ] Si alguno > 0: Retorna HTTP 409 (bloquea)
- [ ] Mensaje en HTTP 409: Mensaje exacto del CU-04
- [ ] NO bloquea solo porque sea padre/raíz
- [ ] Conteos son precisos (0, 1, 2, ...)

---

## Frontend: Lo que Está Implementado ✅

✅ Envía `id_category` correcto
✅ Intenta GET can-delete (404 es manejado)
✅ Si GET retorna can_delete=false: bloquea UI
✅ Intenta DELETE si no hay bloqueo previo
✅ Si DELETE retorna error (409, etc): muestra mensaje
✅ Si DELETE retorna 200: muestra éxito
✅ Console muestra diagnóstico completo

---

## Prueba Rápida en Backend

### Test 1: Verificar query de subcategorías
```sql
-- Ejecutar en base de datos
SELECT id_category, name, 
  (SELECT COUNT(*) FROM categories WHERE id_parent_category = c.id_category) as subcats
FROM categories c;

-- Verificar que conteo es correcto
```

### Test 2: Verificar query de anotaciones
```sql
-- Ejecutar en base de datos
SELECT id_category, name,
  (SELECT COUNT(*) FROM anotaciones WHERE id_category = c.id_category) as annots
FROM categories c;

-- Verificar que conteo es correcto
```

### Test 3: Endpoint DELETE
```bash
# Probar categoría sin dependencias
curl -X DELETE http://localhost:5000/api/categories/1
# Esperado: HTTP 200

# Probar categoría con dependencias
curl -X DELETE http://localhost:5000/api/categories/2
# Esperado: HTTP 409 + mensaje
```

---

## Resumen CU-04

**Regla Única:**
- Una categoría se elimina SI Y SOLO SI no tiene subcategorías hijas Y no tiene anotaciones
- Si tiene CUALQUIERA de las dos: bloquear con mensaje claro
- NO bloquear por ser "padre" - bloquear por tener "hijos"

**Frontend está 100% listo.** Backend necesita validar correctamente en DELETE.
