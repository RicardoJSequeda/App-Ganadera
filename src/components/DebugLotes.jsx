import { useState, useEffect } from 'react';
import useAnimalesStore from '../store/animalesStore';
import { supabase } from '../utils/supabaseClient';

const DebugLotes = () => {
  const { animales, lotes, loading, error } = useAnimalesStore();
  const [debugData, setDebugData] = useState({});
  const [manualData, setManualData] = useState({});

  useEffect(() => {
    const debug = async () => {
      console.log('=== DEBUG LOTES ===');
      console.log('Animales del store:', animales);
      console.log('Lotes del store:', lotes);
      console.log('Loading:', loading);
      console.log('Error:', error);

      // Test manual de consultas
      try {
        const { data: animalesTest, error: animalesError } = await supabase
          .from('animales')
          .select('*')
          .eq('estado', 'en_campo');
        
        console.log('Test animales directo:', animalesTest, animalesError);

        const { data: lotesTest, error: lotesError } = await supabase
          .from('lotes')
          .select('*');
        
        console.log('Test lotes directo:', lotesTest, lotesError);

        const { data: animalLoteTest, error: animalLoteError } = await supabase
          .from('animal_lote')
          .select('*');
        
        console.log('Test animal_lote directo:', animalLoteTest, animalLoteError);

        setManualData({
          animales: animalesTest,
          lotes: lotesTest,
          animalLote: animalLoteTest,
          errors: {
            animales: animalesError,
            lotes: lotesError,
            animalLote: animalLoteError
          }
        });

      } catch (err) {
        console.error('Error en test manual:', err);
      }
    };

    debug();
  }, [animales, lotes, loading, error]);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-red-500 p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-y-auto z-50">
      <h3 className="font-bold text-red-600 mb-2">DEBUG LOTES</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Store State:</strong>
          <div>Animales: {animales?.length || 0}</div>
          <div>Lotes: {lotes?.length || 0}</div>
          <div>Loading: {loading ? 'true' : 'false'}</div>
          <div>Error: {error || 'none'}</div>
        </div>

        <div>
          <strong>Manual Queries:</strong>
          <div>Animales DB: {manualData.animales?.length || 0}</div>
          <div>Lotes DB: {manualData.lotes?.length || 0}</div>
          <div>Animal-Lote DB: {manualData.animalLote?.length || 0}</div>
        </div>

        <div>
          <strong>Errors:</strong>
          <div>Animales: {manualData.errors?.animales?.message || 'OK'}</div>
          <div>Lotes: {manualData.errors?.lotes?.message || 'OK'}</div>
          <div>Animal-Lote: {manualData.errors?.animalLote?.message || 'OK'}</div>
        </div>

        <div>
          <strong>Sample Data:</strong>
          <div>Primer Animal: {JSON.stringify(animales?.[0]?.numero_caravana || 'none')}</div>
          <div>Primer Lote: {JSON.stringify(lotes?.[0]?.nombre || 'none')}</div>
        </div>
      </div>
    </div>
  );
};

export default DebugLotes;
