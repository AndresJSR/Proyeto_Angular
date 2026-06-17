# Diagnóstico: Problema de Eliminación de Categorías (CU-04)

## Síntoma
- Una categoría padre nueva, SIN subcategorías y SIN anotaciones NO se puede eliminar
- Según CU-04, debería permitirse la eliminación

## Causa Probable
El backend está retornando `can_delete: false` incorrectamente

---

## Validación de Frontend ✅

### 1. Delete Dialog Component
✅ Funciona correctamente:
```typescript
ngOnInit() {
  this.svc.canDelete(this.data.id_category).subscribe({
    next: (res) => {
      this.hasDependencies.set(!res.can_delete);  // Si can_delete=true → hasDependencies=false
      // ...
    },
  });
}
```

**Lógica:**
- Si backend retorna `can_delete: true` → `hasDependencies = false` → Botón "Eliminar" VISIBLE
- Si backend retorna `can_delete: false` → `hasDependencies = true` → Botón "Eliminar" OCULTO

✅ El frontend CONFÍA en la respuesta del backend

---

### 2. List Component
✅ Funciona correctamente:
```typescript
checkDependencies() {
  this.all().forEach(c => {
    this.svc.canDelete(c.id_category).subscribe({
      next: (res) => {
        if (!res.can_delete) {  // Solo marca si backend dice que NO se puede
          deps.add(c.id_category);
        }
      },
    });
  });
}
```

✅ Solo marca como "con dependencias" lo que el backend indica

---

## El Problema: Backend Validation

### Endpoint que debe revisar:
```
GET /api/categories/{id}/can-delete
```

### Respuesta esperada para categoría SIN dependencias:
```json
{
  "can_delete": true,
  "subcategories_count": 0,
  "anotaciones_count": 0
}
```

### Respuesta que probablemente está enviando:
```json
{
  "can_delete": false,    ← ❌ INCORRECTO
  "subcategories_count": 0,
  "anotaciones_count": 0
}
```

---

## Validación del Backend: Qué DEBE hacer

### Regla 1: Contar subcategorías hijas
```sql
SELECT COUNT(*) as subcategories_count 
FROM categories 
WHERE id_parent_category = {id}
```

**Solo es dependencia si COUNT > 0**

### Regla 2: Contar anotaciones
```sql
SELECT COUNT(*) as anotaciones_count 
FROM anotaciones 
WHERE id_category = {id}
```

**Solo es dependencia si COUNT > 0**

### Lógica de can_delete:
```typescript
can_delete = (subcategories_count === 0) AND (anotaciones_count === 0)
```

---

## Casos de Uso según CU-04

| Caso | Subcategorías | Anotaciones | can_delete | Esperado |
|------|----------------|-------------|-----------|----------|
| 1 | 0 | 0 | **true** ✅ | Permitir eliminar |
| 2 | > 0 | 0 | **false** ✅ | Bloquear |
| 3 | 0 | > 0 | **false** ✅ | Bloquear |
| 4 | > 0 | > 0 | **false** ✅ | Bloquear |

---

## Debugging: Cómo verificar

### 1. Consulta manual al endpoint
```bash
curl "http://localhost:3000/api/categories/{id}/can-delete"
```

Respuesta para categoría padre sin hijos:
```json
{
  "can_delete": true,
  "subcategories_count": 0,
  "anotaciones_count": 0
}
```

### 2. Verificar en consola del navegador
```javascript
// F12 → Console
fetch('/api/categories/1/can-delete')
  .then(r => r.json())
  .then(data => console.log(data));

// Debería ver:
// {can_delete: true, subcategories_count: 0, anotaciones_count: 0}
```

### 3. Revisar logs del backend
El endpoint debe loguear:
- ID de la categoría a verificar
- Subcategorías encontradas
- Anotaciones encontradas
- Resultado de `can_delete`

---

## Problema Específico Detectado

### Si es categoría PADRE:
La lógica del backend probablemente está:
```typescript
// ❌ INCORRECTO - Bloquea TODAS las categorías padre
if (category.id_parent_category === null) {
  can_delete = false;  // ← AQUÍ ESTÁ EL ERROR
}
```

**El backend confunde:**
- "Es una categoría padre" (id_parent_category = null)
- Con "tiene subcategorías hijas" (SELECT ... WHERE id_parent_category = {id})

Estas son DOS cosas diferentes:
- Una categoría PUEDE ser padre (raíz) sin tener subcategorías hijas

---

## Corrección Necesaria en Backend

```typescript
// ✅ CORRECTO
const subcategoriesCount = await db.query(
  'SELECT COUNT(*) as count FROM categories WHERE id_parent_category = ?', 
  [categoryId]
);

const anotacionesCount = await db.query(
  'SELECT COUNT(*) as count FROM anotaciones WHERE id_category = ?', 
  [categoryId]
);

const canDelete = subcategoriesCount === 0 && anotacionesCount === 0;

return {
  can_delete: canDelete,
  subcategories_count: subcategoriesCount,
  anotaciones_count: anotacionesCount
};
```

---

## Verificación del Frontend ✅

El frontend está correcto:

1. **Llamada correcta:**
   ```typescript
   this.svc.canDelete(c.id_category).subscribe(...)
   ```
   ✅ Usa `id_category` correctamente

2. **Lógica correcta:**
   ```typescript
   this.hasDependencies.set(!res.can_delete);
   ```
   ✅ Si `can_delete=true` → no tiene dependencias

3. **UI correcta:**
   - Botón visible si `!hasDependencies()`
   - Bloqueo visible si `hasDependencies()`
   ✅ Implementado correctamente

---

## Checklist de Verificación

- [ ] Backend retorna `can_delete: true` para categoría padre sin subcategorías
- [ ] Backend retorna conteos correctos de subcategorías
- [ ] Backend retorna conteos correctos de anotaciones
- [ ] Backend NO bloquea por ser "padre"
- [ ] Backend SOLO bloquea si tiene dependencias reales
- [ ] Endpoint HTTP 200 con `can_delete: true` para categoría eliminable
- [ ] Endpoint HTTP 200 con `can_delete: false` + error message para categoría con dependencias

---

## Próximos Pasos

1. ✅ Verificar respuesta de `/api/categories/{id}/can-delete`
2. ✅ Revisar consultas SQL en backend
3. ✅ Confirmar que `can_delete` usa la lógica correcta
4. ✅ Probar con categoría padre nueva sin dependencias

El frontend está listo. El backend necesita validarse.
