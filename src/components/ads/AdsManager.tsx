import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdsterraPopUnder from './AdsterraPopUnder';
import PopAds from './PopAds';

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
                } else {
                    setIsPro(false);
                }
            } catch (error) {
                console.error("Error checking ads status:", error);
            } finally {
                setLoading(false);
            }
        };

        checkSubscription();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            checkSubscription();
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) return null;
    if (isPro) return null;

    return (
        <>
            <AdsterraPopUnder />
            <PopAds />
        </>
    );
};

export default AdsManager;
