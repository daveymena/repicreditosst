-- Actualizar el campo interest_type para que coincida con el código frontend
-- Cambiar de 'flat'/'declining' a 'simple'/'compound'

-- 1. Actualizar los valores existentes
UPDATE public.loans 
SET interest_type = CASE 
  WHEN interest_type = 'flat' THEN 'simple'
  WHEN interest_type = 'declining' THEN 'compound'
  ELSE 'simple'
END;

-- 2. Eliminar el constraint antiguo
ALTER TABLE public.loans 
DROP CONSTRAINT IF EXISTS loans_interest_type_check;

-- 3. Agregar el nuevo constraint
ALTER TABLE public.loans 
ADD CONSTRAINT loans_interest_type_check 
CHECK (interest_type IN ('simple', 'compound'));

-- 4. Actualizar el valor por defecto
ALTER TABLE public.loans 
ALTER COLUMN interest_type SET DEFAULT 'simple';
