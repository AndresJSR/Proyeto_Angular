# Backend Flask: Implementación CU-04 Eliminación de Categorías

## Archivo: app/routes/categories.py

```python
from flask import Blueprint, request, jsonify
from app.models import Category, Anotacion
from app import db
import logging

bp = Blueprint('categories', __name__, url_prefix='/api/categories')

# Configurar logging
logger = logging.getLogger(__name__)

# ============================================================================
# DELETE /api/categories/<id>
# CU-04: Eliminar categoría con validación de dependencias
# ============================================================================

@bp.route('/<int:id>', methods=['DELETE'])
def delete_category(id):
    """
    Elimina una categoría según CU-04.
    
    E2: Eliminar: el sistema verifica que no tenga subcategorías ni anotaciones
    E2a: Tiene dependencias → impide la eliminación y sugiere reasignar
    
    Validación:
    1. Contar subcategorías HIJAS (id_parent_category = id)
    2. Contar anotaciones (id_category = id)
    3. Si ambas = 0 → permitir eliminar (HTTP 200)
    4. Si alguna > 0 → bloquear con mensaje (HTTP 409)
    """
    try:
        logger.info(f"🗑️ Intentando eliminar categoría ID: {id}")
        
        # =========================================
        # PASO 1: Validar que existe
        # =========================================
        category = Category.query.filter_by(id_category=id).first()
        
        if not category:
            logger.warning(f"❌ Categoría {id} no encontrada")
            return jsonify({
                'message': 'Categoría no encontrada'
            }), 404
        
        logger.info(f"✓ Categoría encontrada: {category.name}")
        
        # =========================================
        # PASO 2: Contar SUBCATEGORÍAS HIJAS
        # =========================================
        # Buscar categorías que tienen ESTA como padre
        subcategories_count = db.session.query(Category).filter_by(
            id_parent_category=id
        ).count()
        
        logger.info(f"📊 Subcategorías hijas de {id}: {subcategories_count}")
        
        # =========================================
        # PASO 3: Contar ANOTACIONES
        # =========================================
        # Buscar anotaciones asociadas a ESTA categoría
        anotaciones_count = db.session.query(Anotacion).filter_by(
            id_category=id
        ).count()
        
        logger.info(f"📊 Anotaciones de {id}: {anotaciones_count}")
        
        # =========================================
        # PASO 4: VALIDAR según CU-04
        # =========================================
        # E2: Verificar que NO tenga subcategorías NI anotaciones
        
        if subcategories_count > 0 or anotaciones_count > 0:
            # E2a: Tiene dependencias → IMPEDIR ELIMINACIÓN
            logger.warning(f"🚫 Categoría {id} tiene dependencias:")
            logger.warning(f"   - Subcategorías: {subcategories_count}")
            logger.warning(f"   - Anotaciones: {anotaciones_count}")
            
            return jsonify({
                'message': 'No se puede eliminar esta categoría porque tiene subcategorías o anotaciones asociadas. Reasigne o elimine las dependencias antes de continuar.',
                'error': {
                    'code': 'CATEGORY_HAS_DEPENDENCIES',
                    'subcategories_count': subcategories_count,
                    'anotaciones_count': anotaciones_count,
                    'details': {
                        'has_subcategories': subcategories_count > 0,
                        'has_anotaciones': anotaciones_count > 0
                    }
                }
            }), 409  # HTTP 409 Conflict
        
        # =========================================
        # PASO 5: SIN DEPENDENCIAS → PERMITIR ELIMINACIÓN
        # =========================================
        logger.info(f"✅ Categoría {id} sin dependencias. Procediendo a eliminar...")
        
        # Eliminar la categoría
        db.session.delete(category)
        db.session.commit()
        
        logger.info(f"✓ Categoría {id} eliminada exitosamente")
        
        return jsonify({
            'message': 'Categoría eliminada correctamente',
            'id': id,
            'name': category.name
        }), 200  # HTTP 200 OK
        
    except Exception as error:
        logger.error(f"❌ Error eliminando categoría {id}: {str(error)}", exc_info=True)
        db.session.rollback()
        
        return jsonify({
            'message': 'Error al eliminar la categoría',
            'error': str(error)
        }), 500  # HTTP 500 Internal Server Error


# ============================================================================
# GET /api/categories/<id>/can-delete (OPCIONAL pero recomendado)
# Verificar ANTES de mostrar el botón de eliminar
# ============================================================================

@bp.route('/<int:id>/can-delete', methods=['GET'])
def can_delete_category(id):
    """
    Verifica si una categoría puede ser eliminada.
    
    Retorna:
    - can_delete: true/false
    - subcategories_count: número de subcategorías
    - anotaciones_count: número de anotaciones
    """
    try:
        logger.info(f"🔍 Verificando si se puede eliminar categoría {id}")
        
        # Validar que existe
        category = Category.query.filter_by(id_category=id).first()
        
        if not category:
            logger.warning(f"❌ Categoría {id} no encontrada")
            return jsonify({
                'message': 'Categoría no encontrada'
            }), 404
        
        # Contar subcategorías
        subcategories_count = db.session.query(Category).filter_by(
            id_parent_category=id
        ).count()
        
        # Contar anotaciones
        anotaciones_count = db.session.query(Anotacion).filter_by(
            id_category=id
        ).count()
        
        # Determinar si puede eliminar
        can_delete = (subcategories_count == 0 and anotaciones_count == 0)
        
        logger.info(f"📊 Categoría {id}: can_delete={can_delete}, subcats={subcategories_count}, annots={anotaciones_count}")
        
        return jsonify({
            'can_delete': can_delete,
            'subcategories_count': subcategories_count,
            'anotaciones_count': anotaciones_count,
            'category_id': id,
            'category_name': category.name
        }), 200
        
    except Exception as error:
        logger.error(f"❌ Error verificando categoría {id}: {str(error)}", exc_info=True)
        return jsonify({
            'message': 'Error al verificar la categoría'
        }), 500


# ============================================================================
# MODELOS necesarios (app/models.py)
# ============================================================================

# Asegúrate de que tus modelos tengan estas relaciones:
'''
class Category(db.Model):
    __tablename__ = 'categories'
    id_category = db.Column(db.Integer, primary_key=True)
    id_parent_category = db.Column(db.Integer, db.ForeignKey('categories.id_category'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    status = db.Column(db.String(50), default='active')
    
    # Relación con subcategorías
    subcategories = db.relationship('Category', backref='parent')

class Anotacion(db.Model):
    __tablename__ = 'anotaciones'
    id_anotacion = db.Column(db.Integer, primary_key=True)
    id_category = db.Column(db.Integer, db.ForeignKey('categories.id_category'))
    title = db.Column(db.String(255))
    content = db.Column(db.Text)
    # ... otros campos
'''

# ============================================================================
# Testing: Verificar con curl
# ============================================================================

"""
# Test 1: Categoría sin dependencias (debería permitir)
curl -X DELETE http://127.0.0.1:5000/api/categories/100
# Esperado: HTTP 200 + "Categoría eliminada correctamente"

# Test 2: Categoría con subcategorías (debería bloquear)
curl -X DELETE http://127.0.0.1:5000/api/categories/101
# Esperado: HTTP 409 + "No se puede eliminar..."

# Test 3: Verificar si se puede eliminar (OPCIONAL)
curl http://127.0.0.1:5000/api/categories/102/can-delete
# Esperado: HTTP 200 + {"can_delete": true/false, ...}
"""
```

---

## INTEGRACIÓN CON TU APP ACTUAL

### 1. Ubicación del archivo
```
backend/
├── app/
│   ├── __init__.py
│   ├── models.py (ya existe)
│   └── routes/
│       ├── __init__.py
│       └── categories.py ← ESTE ARCHIVO
```

### 2. En app/__init__.py
```python
from flask import Flask
from app.routes import categories

def create_app():
    app = Flask(__name__)
    
    # ... configuración ...
    
    # Registrar blueprints
    app.register_blueprint(categories.bp)
    
    return app
```

### 3. Importar en app/routes/__init__.py
```python
from . import categories
```

---

## CHECKLIST DE IMPLEMENTACIÓN

- [ ] Copiar el código del endpoint DELETE
- [ ] Copiar el código del endpoint GET can-delete (opcional)
- [ ] Verificar que los modelos Category y Anotacion existen
- [ ] Verificar que la relación id_parent_category funciona
- [ ] Agregar logging (import logging)
- [ ] Registrar el blueprint en app/__init__.py
- [ ] Probar con curl
- [ ] Probar desde el frontend (F12 → Console)

---

## VALIDACIÓN FINAL

Cuando todo esté implementado, el flujo será:

```
1. Usuario abre diálogo de eliminar
   ↓
2. Frontend (opcional) consulta GET /api/categories/{id}/can-delete
   - Si can_delete=false → muestra bloqueado
   - Si error 404 → permite intentar
   ↓
3. Usuario confirma
   ↓
4. Frontend envía DELETE /api/categories/{id}
   ↓
5. Backend valida:
   - Subcategorías? Si > 0 → HTTP 409 ❌
   - Anotaciones? Si > 0 → HTTP 409 ❌
   - Ambas = 0? → HTTP 200 ✅
   ↓
6. Frontend muestra resultado
```

---

## RESULTADO ESPERADO

✅ **Categoría nueva sin dependencias:** Se elimina correctamente
✅ **Categoría con subcategorías:** Se bloquea con mensaje
✅ **Categoría con anotaciones:** Se bloquea con mensaje
✅ **Categoría con ambas:** Se bloquea con mensaje + conteos

**Cumple 100% con CU-04 E2 y E2a**
