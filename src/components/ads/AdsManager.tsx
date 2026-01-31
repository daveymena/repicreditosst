import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdsterraSocialBar from './AdsterraSocialBar';
import AdsterraPopUnder from './AdsterraPopUnder';

const AdsManager = () => {
    const [isPro, setIsPro] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("subscription_status")
                        .eq("user_id", user.id)
                        .single();

                    if (profile?.subscription_status === "pro" || profile?.subscription_status === "active") {
                        setIsPro(true);
                    }
                }
            } catch (error) {
                console.error("Error checking ads status:", error);
            } finally {
                setLoading(false);
            }
        };

        checkSubscription();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            checkSubscription();
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) return null;
    if (isPro) return null;

    return (
        <>
            <AdsterraSocialBar />
            <AdsterraPopUnder />
        </>
    );
};

export default AdsManager;
