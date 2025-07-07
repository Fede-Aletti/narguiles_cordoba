
# Guía para Interactuar con el Proyecto

Este documento sirve como una guía para entender la estructura de este proyecto Next.js y cómo realizar cambios de manera efectiva.

## 1. Descripción General del Proyecto

Este es un proyecto de e-commerce desarrollado con las siguientes tecnologías principales:

- **Framework:** [Next.js](https://nextjs.org/) (v15)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Backend y Base de Datos:** [Supabase](https://supabase.io/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/) (construido sobre Radix UI)
- **Gestión de Estado:** [Zustand](https://github.com/pmndrs/zustand)
- **Formularios:** [React Hook Form](https://react-hook-form.com/) con [Zod](https://zod.dev/) para validación.
- **Gestor de Paquetes:** [pnpm](https://pnpm.io/)

## 2. Estructura de Archivos

La estructura del proyecto sigue las convenciones de Next.js App Router.

```
/
├── public/               # Archivos estáticos (imágenes, videos, etc.)
├── src/
│   ├── app/              # Rutas de la aplicación (App Router)
│   │   ├── (admin)/      # Rutas y layout para el panel de administración
│   │   ├── (shop)/       # Rutas y layout para la tienda (pública)
│   │   ├── api/          # Rutas de API (si las hubiera)
│   │   └── layout.tsx    # Layout principal de la aplicación
│   ├── actions/          # Server Actions de Supabase para interactuar con la BD
│   ├── components/       # Componentes de React reutilizables
│   │   ├── ui/           # Componentes de bajo nivel de Shadcn/ui
│   │   └── sections/     # Componentes más grandes que componen secciones de una página
│   ├── hooks/            # Hooks de React personalizados
│   ├── interfaces/       # Definiciones de tipos y interfaces de TypeScript
│   ├── lib/              # Funciones de utilidad, queries y configuración
│   └── utils/            # Utilidades generales, incluyendo la configuración de Supabase
├── package.json          # Dependencias y scripts del proyecto
└── tailwind.config.ts    # Configuración de Tailwind CSS
```

- **`src/app`**: Contiene las rutas de la aplicación. Las carpetas con paréntesis `(admin)` y `(shop)` son "Route Groups" que permiten organizar rutas con layouts diferentes sin afectar a la URL.
- **`src/actions`**: Aquí se definen las "Server Actions" que se comunican con Supabase. Estas funciones se ejecutan en el servidor y pueden ser llamadas directamente desde los componentes del cliente.
- **`src/components`**: Componentes de React. Los componentes de UI genéricos de Shadcn/ui están en `src/components/ui`.
- **`src/interfaces`**: Define las estructuras de datos (tipos de TypeScript) usadas en la aplicación (ej: `Product`, `Order`, `User`).
- **`src/lib`**: Contiene lógica de negocio, utilidades y la configuración de la tienda (Zustand).
- **`src/utils/supabase`**: Configuración del cliente de Supabase.

## 3. Flujo de Desarrollo

Para trabajar en el proyecto, utiliza los siguientes scripts definidos en `package.json`:

- **Instalar dependencias:**
  ```bash
  pnpm install
  ```

- **Ejecutar el servidor de desarrollo:**
  ```bash
  pnpm dev
  ```
  Esto iniciará la aplicación en [http://localhost:3000](http://localhost:3000).

- **Construir para producción:**
  ```bash
  pnpm build
  ```

- **Ejecutar en modo producción:**
  ```bash
  pnpm start
  ```

- **Verificar el código (linting):**
  ```bash
  pnpm lint
  ```

## 4. Backend (Supabase)

La interacción con la base de datos se realiza principalmente a través de **Server Actions** que utilizan el cliente de Supabase.

- **Cliente de Supabase:** La configuración del cliente se encuentra en `src/utils/supabase`.
- **Server Actions:** Los archivos en `src/actions` (ej: `product-actions.ts`, `order-actions.ts`) contienen las funciones para crear, leer, actualizar y eliminar (CRUD) datos. Estas acciones están diseñadas para ser seguras, ya que se ejecutan en el servidor.

**Ejemplo de Server Action (`src/actions/product-actions.ts`):**
```typescript
'use server';

import { createClient } from '@/utils/supabase/server';
import { Product } from '@/interfaces/product';

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}
```

## 5. Frontend

- **Componentes:** El proyecto utiliza una arquitectura de componentes. Los componentes más pequeños y reutilizables están en `src/components`. Las páginas se construyen componiendo estos elementos.
- **Estilos:** Se utiliza Tailwind CSS para los estilos. Las clases de utilidad se aplican directamente en el JSX. La configuración de Tailwind se encuentra en `tailwind.config.ts`.
- **Gestión de Estado Global:** Para el estado global (como el carrito de compras), se utiliza **Zustand**. La configuración del store se encuentra en `src/lib/store.ts`.
- **Gestión de Estado de Servidor:** Para el fetching, caching y actualización de datos del servidor se utiliza **React Query** (`@tanstack/react-query`).

## 6. Cómo Añadir Nuevas Funcionalidades

### Añadir una nueva página:

1.  Crea una nueva carpeta dentro de `src/app/(shop)` o `src/app/(admin)` con el nombre de la ruta (ej: `src/app/(shop)/mi-nueva-pagina`).
2.  Dentro de esa carpeta, crea un archivo `page.tsx`.
3.  Define tu componente de página en `page.tsx`. Next.js automáticamente creará la ruta.

### Añadir un nuevo componente:

1.  Crea un nuevo archivo `.tsx` en `src/components` (o una subcarpeta si es necesario).
2.  Desarrolla tu componente.
3.  Impórtalo y úsalo en tus páginas u otros componentes.

### Añadir una nueva interacción con la base de datos:

1.  Abre el archivo de "actions" correspondiente en `src/actions` (ej: `user-actions.ts`).
2.  Crea una nueva `async function` que utilice el cliente de Supabase para realizar la operación que necesitas.
3.  Añade la directiva `'use server';` al principio del archivo si no la tiene.
4.  Llama a esta función desde tus componentes de cliente (ej: en un `onClick` de un botón o en un `useEffect`).
