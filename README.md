# MyFitnessApp

Base inicial del proyecto web para seguimiento del entrenamiento.

## Contenido actual

- `supabase/migrations`: esquema SQL v1
- `supabase/seed`: catalogo inicial
- `app`: rutas principales con App Router
- `components`: layout y UI base
- `features`: placeholders por dominio funcional
- `lib/supabase`: clientes base para browser y server

## Siguiente paso recomendado

1. Instalar Node.js
2. Ejecutar `npm install`
3. Copiar `.env.example` a `.env.local` y rellenar credenciales de Supabase
4. Aplicar migraciones y seed en Supabase
5. Probar autenticacion en `/login` y `/registro`
6. Consumir el catalogo de ejercicios en frontend
