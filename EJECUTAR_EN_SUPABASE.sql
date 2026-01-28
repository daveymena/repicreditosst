-- =====================================================
-- MIGRACIÓN: Actualizar interest_type
-- De: 'flat'/'declining' → A: 'simple'/'compound'
-- =====================================================

-- 1. Eliminar el constraint antiguo
ALTER TABLE public.loans 
DROP CONSTRAINT IF EXISTS loans_interest_type_check;

-- 2. Agregar el nuevo constraint con los valores correctos
ALTER TABLE public.loans 
ADD CONSTRAINT loans_interest_type_check 
CHECK (interest_type IN ('simple', 'compound'));

-- 3. Actualizar el valor por defecto
ALTER TABLE public.loans 
ALTER COLUMN interest_type SET DEFAULT 'simple';

-- 4. Si hay préstamos existentes, actualizar sus valores
UPDATE public.loans 
SET interest_type = CASE 
  WHEN interest_type = 'flat' THEN 'simple'
  WHEN interest_type = 'declining' THEN 'compound'
  ELSE 'simple'
END
WHERE interest_type IN ('flat', 'declining');

-- Verificación
SELECT 
  COUNT(*) as total_loans,
  interest_type,
  COUNT(*) as count_by_type
FROM public.loans
GROUP BY interest_type;
