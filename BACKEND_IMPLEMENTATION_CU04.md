# Backend: Implementación Validación CU-04 (Node.js/Express)

## Problema Actual
El backend está permitiendo eliminar categorías que tienen anotaciones y/o subcategorías.

## Solución: Validar en DELETE /api/categories/{id}

---

## Opción 1: Implementación Node.js/Express

```javascript
// routes/categories.js
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // PASO 1: Validar que la categoría existe
    const category = await db.query(
      'SELECT * FROM categories WHERE id_category = ?',
      [id]
    );
    
    if (!category.length) {
      return res.status(404).json({
        message: 'Categoría no encontrada'
      });
    }

    // PASO 2: Contar SUBCATEGORÍAS HIJAS
    const subcatsResult = await db.query(
      'SELECT COUNT(*) as count FROM categories WHERE id_parent_category = ?',
      [id]
    );
    const subcategoriesCount = subcatsResult[0].count;
    console.log(`Subcategorías de ${id}: ${subcategoriesCount}`);

    // PASO 3: Contar ANOTACIONES
    const anotResult = await db.query(
      'SELECT COUNT(*) as count FROM anotaciones WHERE id_category = ?',
      [id]
    );
    const anotacionesCount = anotResult[0].count;
    console.log(`Anotaciones de ${id}: ${anotacionesCount}`);

    // PASO 4: VALIDAR según CU-04
    // E2: Eliminar: el sistema verifica que no tenga subcategorías ni anotaciones
    if (subcategoriesCount > 0 || anotacionesCount > 0) {
      // E2a: Tiene dependencias → impide eliminación
      return res.status(409).json({
        message: 'No se puede eliminar esta categoría porque tiene subcategorías o anotaciones asociadas. Reasigne o elimine las dependencias antes de continuar.',
        error: {
          code: 'CATEGORY_HAS_DEPENDENCIES',
          subcategories_count: subcategoriesCount,
          anotaciones_count: anotacionesCount
        }
      });
    }

    // PASO 5: SIN DEPENDENCIAS → PERMITIR ELIMINACIÓN
    await db.query('DELETE FROM categories WHERE id_category = ?', [id]);
    
    return res.status(200).json({
      message: 'Categoría eliminada correctamente',
      id: id
    });

  } catch (error) {
    console.error('Error eliminando categoría:', error);
    return res.status(500).json({
      message: 'Error al eliminar la categoría'
    });
  }
});
```

---

## Opción 2: Implementación Python/Flask

```python
# routes/categories.py
@bp.route('/<int:id>', methods=['DELETE'])
def delete_category(id):
    try:
        # PASO 1: Validar que la categoría existe
        category = db.session.query(Category).filter_by(id_category=id).first()
        if not category:
            return jsonify({'message': 'Categoría no encontrada'}), 404

        # PASO 2: Contar SUBCATEGORÍAS HIJAS
        subcategories_count = db.session.query(Category).filter_by(
            id_parent_category=id
        ).count()
        print(f"Subcategorías de {id}: {subcategories_count}")

        # PASO 3: Contar ANOTACIONES
        anotaciones_count = db.session.query(Anotacion).filter_by(
            id_category=id
        ).count()
        print(f"Anotaciones de {id}: {anotaciones_count}")

        # PASO 4: VALIDAR según CU-04
        # E2: Verificar que no tenga subcategorías ni anotaciones
        if subcategories_count > 0 or anotaciones_count > 0:
            # E2a: Tiene dependencias → impide eliminación
            return jsonify({
                'message': 'No se puede eliminar esta categoría porque tiene subcategorías o anotaciones asociadas. Reasigne o elimine las dependencias antes de continuar.',
                'error': {
                    'code': 'CATEGORY_HAS_DEPENDENCIES',
                    'subcategories_count': subcategories_count,
                    'anotaciones_count': anotaciones_count
                }
            }), 409

        # PASO 5: SIN DEPENDENCIAS → PERMITIR ELIMINACIÓN
        db.session.delete(category)
        db.session.commit()

        return jsonify({
            'message': 'Categoría eliminada correctamente',
            'id': id
        }), 200

    except Exception as error:
        print(f"Error eliminando categoría: {error}")
        return jsonify({
            'message': 'Error al eliminar la categoría'
        }), 500
```

---

## Opción 3: Implementación Java/Spring Boot

```java
// CategoryController.java
@DeleteMapping("/{id}")
public ResponseEntity<?> deleteCategory(@PathVariable Integer id) {
    try {
        // PASO 1: Validar que la categoría existe
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        // PASO 2: Contar SUBCATEGORÍAS HIJAS
        long subcategoriesCount = categoryRepository.countByIdParentCategory(id);
        System.out.println("Subcategorías de " + id + ": " + subcategoriesCount);

        // PASO 3: Contar ANOTACIONES
        long anotacionesCount = anotacionRepository.countByIdCategory(id);
        System.out.println("Anotaciones de " + id + ": " + anotacionesCount);

        // PASO 4: VALIDAR según CU-04
        // E2: Verificar que no tenga subcategorías ni anotaciones
        if (subcategoriesCount > 0 || anotacionesCount > 0) {
            // E2a: Tiene dependencias → impide eliminación
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(
                    "No se puede eliminar esta categoría porque tiene subcategorías o anotaciones asociadas. Reasigne o elimine las dependencias antes de continuar.",
                    "CATEGORY_HAS_DEPENDENCIES",
                    subcategoriesCount,
                    anotacionesCount
                ));
        }

        // PASO 5: SIN DEPENDENCIAS → PERMITIR ELIMINACIÓN
        categoryRepository.deleteById(id);

        return ResponseEntity.ok(new SuccessResponse(
            "Categoría eliminada correctamente",
            id
        ));

    } catch (Exception error) {
        System.err.println("Error eliminando categoría: " + error.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("Error al eliminar la categoría"));
    }
}
```

---

## Validaciones Clave (TODOS los backends)

✅ **Paso 1: Verificar que la categoría existe**
- Si no existe → HTTP 404

✅ **Paso 2: Contar subcategorías HIJAS**
```sql
SELECT COUNT(*) FROM categories WHERE id_parent_category = {id}
```
- Esto cuenta categorías que tienen ESTA como padre
- No cuenta si ESTA es padre de sí misma

✅ **Paso 3: Contar anotaciones**
```sql
SELECT COUNT(*) FROM anotaciones WHERE id_category = {id}
```
- Esto cuenta anotaciones que están asociadas a ESTA categoría

✅ **Paso 4: Validar según CU-04**
```
IF (subcategories_count == 0 AND anotaciones_count == 0) THEN
  ✅ PERMITIR ELIMINACIÓN (HTTP 200)
ELSE
  ❌ BLOQUEAR ELIMINACIÓN (HTTP 409)
END IF
```

✅ **Paso 5: Eliminar solo si pasó validación**
- No eliminar en cascada
- No borrar "de todos modos"
- Solo borrar si pasa todas las validaciones

---

## Mensajes de Respuesta

### ✅ Éxito (HTTP 200)
```json
{
  "message": "Categoría eliminada correctamente",
  "id": 12
}
```

### ❌ Tiene Dependencias (HTTP 409)
```json
{
  "message": "No se puede eliminar esta categoría porque tiene subcategorías o anotaciones asociadas. Reasigne o elimine las dependencias antes de continuar.",
  "error": {
    "code": "CATEGORY_HAS_DEPENDENCIES",
    "subcategories_count": 2,
    "anotaciones_count": 3
  }
}
```

### ❌ No Existe (HTTP 404)
```json
{
  "message": "Categoría no encontrada"
}
```

---

## Testing: Verificar que funciona

### Test 1: Categoría sin dependencias
```bash
# Crear categoría padre nueva (ID=100)
POST /api/categories
{ "name": "Test", "description": "Test" }

# Verificar que no tiene hijos
SELECT COUNT(*) FROM categories WHERE id_parent_category = 100
# Resultado: 0

# Verificar que no tiene anotaciones
SELECT COUNT(*) FROM anotaciones WHERE id_category = 100
# Resultado: 0

# Eliminar
DELETE /api/categories/100
# Esperado: HTTP 200 ✓ Eliminada
```

### Test 2: Categoría con subcategorías
```bash
# Crear categoría padre (ID=101)
# Crear subcategoría hija (ID=102, id_parent_category=101)

# Intentar eliminar padre
DELETE /api/categories/101
# Esperado: HTTP 409 ❌ Bloqueada
# Mensaje: "...tiene subcategorías..."
```

### Test 3: Categoría con anotaciones
```bash
# Crear categoría (ID=103)
# Crear anotación con id_category=103

# Intentar eliminar
DELETE /api/categories/103
# Esperado: HTTP 409 ❌ Bloqueada
# Mensaje: "...tiene anotaciones..."
```

### Test 4: Categoría con ambas
```bash
# Categoría con 2 subcategorías + 5 anotaciones

# Intentar eliminar
DELETE /api/categories/104
# Esperado: HTTP 409 ❌ Bloqueada
# Con ambos conteos en la respuesta
```

---

## Lo Más Importante

🚨 **LA VALIDACIÓN DEBE ESTAR EN EL BACKEND**

El frontend confía en la respuesta del backend. Si el backend permite algo que no debería:
- No hay forma de que el frontend lo bloquee completamente
- El usuario verá inconsistencias

**Backend es la fuente de verdad para validaciones.**

---

## Resumen

**Implementar en el backend (cualquier lenguaje):**

1. ✅ En el endpoint DELETE `/api/categories/{id}`
2. ✅ Contar subcategorías hijas
3. ✅ Contar anotaciones
4. ✅ Si alguna cuenta > 0 → HTTP 409 (bloquear)
5. ✅ Si ambas = 0 → HTTP 200 (eliminar)
6. ✅ Retornar mensaje claro en ambos casos

**Esto cumple 100% con CU-04 E2 y E2a.**
