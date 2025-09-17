import { supabase } from '../utils/supabaseClient';

// Función para verificar la conexión y estructura de la base de datos
export const verificarEstructuraBD = async () => {
  try {
    console.log('🔍 Verificando estructura de la base de datos...');

    // Verificar tabla animales
    const { data: animales, error: errorAnimales } = await supabase
      .from('animales')
      .select('count')
      .limit(1);

    if (errorAnimales) {
      console.error('❌ Error en tabla animales:', errorAnimales);
      return false;
    }

    // Verificar tabla proveedores
    const { data: proveedores, error: errorProveedores } = await supabase
      .from('proveedores')
      .select('count')
      .limit(1);

    if (errorProveedores) {
      console.error('❌ Error en tabla proveedores:', errorProveedores);
      return false;
    }

    // Verificar tabla lotes
    const { data: lotes, error: errorLotes } = await supabase
      .from('lotes')
      .select('count')
      .limit(1);

    if (errorLotes) {
      console.error('❌ Error en tabla lotes:', errorLotes);
      return false;
    }

    // Verificar tabla animal_lote
    const { data: animalLote, error: errorAnimalLote } = await supabase
      .from('animal_lote')
      .select('count')
      .limit(1);

    if (errorAnimalLote) {
      console.error('❌ Error en tabla animal_lote:', errorAnimalLote);
      return false;
    }

    console.log('✅ Todas las tablas están accesibles');
    return true;

  } catch (error) {
    console.error('❌ Error general verificando BD:', error);
    return false;
  }
};

// Función para crear datos de prueba
export const crearDatosPrueba = async () => {
  try {
    console.log('🔧 Creando datos de prueba...');

    // Crear un proveedor de prueba
    const { data: proveedor, error: errorProveedor } = await supabase
      .from('proveedores')
      .insert([
        {
          nombre: 'Estancia La Pampa',
          contacto: '+54 123 456 7890',
          cuit: '20-12345678-9',
          establecimiento: 'Estancia La Pampa',
          observaciones: 'Proveedor de prueba'
        }
      ])
      .select()
      .single();

    if (errorProveedor) {
      console.error('Error creando proveedor:', errorProveedor);
      return false;
    }

    // Crear un lote de prueba
    const { data: lote, error: errorLote } = await supabase
      .from('lotes')
      .insert([
        {
          nombre: 'Lote Primavera 2024',
          fecha_creacion: new Date().toISOString().split('T')[0],
          observaciones: 'Lote de prueba para testing'
        }
      ])
      .select()
      .single();

    if (errorLote) {
      console.error('Error creando lote:', errorLote);
      return false;
    }

    // Crear algunos animales de prueba
    const animalesPrueba = [
      {
        numero_caravana: '001',
        color_caravana: 'amarillo',
        categoria: 'ternero',
        peso_ingreso: 180,
        estado_fisico: 'bueno',
        proveedor_id: proveedor.id,
        precio_compra: 450.00,
        fecha_ingreso: new Date().toISOString().split('T')[0],
        estado: 'en_campo',
        observaciones: 'Animal de prueba 1'
      },
      {
        numero_caravana: '002',
        color_caravana: 'azul',
        categoria: 'ternera',
        peso_ingreso: 165,
        estado_fisico: 'excelente',
        proveedor_id: proveedor.id,
        precio_compra: 470.00,
        fecha_ingreso: new Date().toISOString().split('T')[0],
        estado: 'en_campo',
        observaciones: 'Animal de prueba 2'
      },
      {
        numero_caravana: '003',
        color_caravana: 'rojo',
        categoria: 'novillo',
        peso_ingreso: 220,
        estado_fisico: 'bueno',
        proveedor_id: proveedor.id,
        precio_compra: 420.00,
        fecha_ingreso: new Date().toISOString().split('T')[0],
        estado: 'en_campo',
        observaciones: 'Animal de prueba 3'
      }
    ];

    const { data: animales, error: errorAnimales } = await supabase
      .from('animales')
      .insert(animalesPrueba)
      .select();

    if (errorAnimales) {
      console.error('Error creando animales:', errorAnimales);
      return false;
    }

    // Asignar algunos animales al lote
    const asignacionesLote = animales.slice(0, 2).map(animal => ({
      animal_id: animal.id,
      lote_id: lote.id,
      fecha_asignacion: new Date().toISOString()
    }));

    const { error: errorAsignacion } = await supabase
      .from('animal_lote')
      .insert(asignacionesLote);

    if (errorAsignacion) {
      console.error('Error asignando animales a lote:', errorAsignacion);
      return false;
    }

    console.log('✅ Datos de prueba creados exitosamente');
    console.log(`📊 Creados: 1 proveedor, 1 lote, ${animales.length} animales`);
    return true;

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
    return false;
  }
};

// Función para limpiar datos de prueba
export const limpiarDatosPrueba = async () => {
  try {
    console.log('🧹 Limpiando datos de prueba...');

    // Eliminar en orden correcto por las relaciones FK
    await supabase.from('animal_lote').delete().ilike('observaciones', '%prueba%');
    await supabase.from('animales').delete().ilike('observaciones', '%prueba%');
    await supabase.from('lotes').delete().ilike('observaciones', '%prueba%');
    await supabase.from('proveedores').delete().ilike('observaciones', '%prueba%');

    console.log('✅ Datos de prueba eliminados');
    return true;

  } catch (error) {
    console.error('❌ Error limpiando datos de prueba:', error);
    return false;
  }
};
