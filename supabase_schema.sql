-- =====================================================
-- ESTRUCTURA PROFESIONAL PARA WHATSAPP AI AGENT
-- =====================================================

-- 1. Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enums
DO $$ BEGIN
    CREATE TYPE public.conversation_status AS ENUM ('active', 'pending', 'closed', 'escalated');
    CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tabla de Perfiles (Extensión de Auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    business_name TEXT,
    phone_number TEXT,
    avatar_url TEXT,
    subscription_plan subscription_plan DEFAULT 'free',
    whatsapp_limit INTEGER DEFAULT 1,
    agents_limit INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Nichos
CREATE TABLE IF NOT EXISTS public.market_niches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'store',
    color TEXT DEFAULT '#25D366',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Agentes de IA
CREATE TABLE IF NOT EXISTS public.ai_agents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    niche_id UUID REFERENCES public.market_niches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    model_name TEXT DEFAULT 'qwen2.5:3b',
    temperature DECIMAL(2,1) DEFAULT 0.7,
    greeting_message TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabla de Sesiones de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    niche_id UUID REFERENCES public.market_niches(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
    session_name TEXT NOT NULL,
    phone_number TEXT,
    qr_code TEXT,
    status TEXT DEFAULT 'disconnected',
    last_connected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabla de Conversaciones
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.whatsapp_sessions(id) ON DELETE CASCADE NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_name TEXT,
    status conversation_status DEFAULT 'active',
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabla de Mensajes
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- SEGURIDAD (RLS)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas para que cada usuario solo vea lo suyo
CREATE POLICY "Users can view own niche" ON public.market_niches FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own agents" ON public.ai_agents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own sessions" ON public.whatsapp_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own conversations" ON public.conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own messages" ON public.messages FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE conversations.id = messages.conversation_id 
        AND conversations.user_id = auth.uid()
    )
);

-- Función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, business_name, phone_number, avatar_url)
    VALUES (
        new.id, 
        new.raw_user_meta_data->>'full_name', 
        new.raw_user_meta_data->>'business_name', 
        new.raw_user_meta_data->>'phone_number', 
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
