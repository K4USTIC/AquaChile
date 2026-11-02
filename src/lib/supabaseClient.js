// src/lib/supabaseClient.js
// Crea UNA sola conexión a Supabase para toda la app.
// Las credenciales se leen del archivo .env (ver .env.example).
// En Create React App las variables deben empezar con REACT_APP_.
import { createClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabaseConfigurado = Boolean(url && anonKey);

// Si faltan las variables exportamos null (en vez de romper toda la app al cargar);
// el servicio avisa con un mensaje claro cuando alguien intenta usar la base de datos.
export const supabase = supabaseConfigurado ? createClient(url, anonKey) : null;
