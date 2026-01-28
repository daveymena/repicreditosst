
-- =====================================================
-- MIGRACIÓN AUTOMÁTICA - Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Eliminar constraint antiguo si existe
ALTER TABLE public.loans 
DROP CONSTRAINT IF EXISTS loans_interest_type_check;

-- 2. Agregar nuevo constraint
ALTER TABLE public.loans 
ADD CONSTRAINT loans_interest_type_check 
CHECK (interest_type IN ('simple', 'compound'));

-- 3. Actualizar valor por defecto
ALTER TABLE public.loans 
ALTER COLUMN interest_type SET DEFAULT 'simple';

-- 4. Actualizar valores existentes (si hay)
UPDATE public.loans 
SET interest_type = CASE 
  WHEN interest_type = 'flat' THEN 'simple'
  WHEN interest_type = 'declining' THEN 'compound'
  ELSE 'simple'
END
WHERE interest_type IN ('flat', 'declining') OR interest_type IS NULL;

-- 5. Verificar que installment_amount existe (si no, créala)
-- Si recibes error "column already exists", ignóralo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'installment_amount'
  ) THEN
    ALTER TABLE public.loans 
    ADD COLUMN installment_amount DECIMAL(15,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Verificación final
SELECT 
  COUNT(*) as total_loans,
  interest_type,
  COUNT(*) as count_by_type
FROM public.loans
GROUP BY interest_type;
