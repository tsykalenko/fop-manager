import { createClient } from "@/lib/supabase/client";

// Створюємо єдиний екземпляр для використання на клієнті
export const supabase = createClient();