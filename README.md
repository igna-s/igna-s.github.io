# Stack & Slice

Portfolio interactivo de Ignacio Schwindt: una landing profesional acompañada por un minijuego de cocina donde los proyectos son recetas y las tecnologías son ingredientes.

**Sitio:** [igna-s.is-a.dev](https://igna-s.is-a.dev/)

## Qué incluye

- Portfolio bilingüe en español e inglés.
- Flujo jugable de mostrador, preparación, tres hornos concurrentes, corte y evaluación.
- Pedidos simultáneos, paciencia individual y cocción persistente entre estaciones.
- Pizzas incompletas, crudas o quemadas con puntuaciones y comentarios distintos.
- Sonido sintetizado localmente con Web Audio; no descarga audio ni usa servicios externos.
- Interfaz adaptable a escritorio y a un único viewport de teléfono, en vertical u horizontal.
- Estado de partida guardado únicamente en `localStorage`.

## Desarrollo

Requiere Node.js 22.13 o posterior.

```bash
npm ci
npm run dev
```

Validación local:

```bash
npm run build:github
npm test
```

## Seguridad y privacidad

La aplicación publicada es estática. No requiere API keys, no contiene autenticación propia y no envía datos del visitante a un backend. El correo, nombre, enlaces sociales, dominio e imagen de perfil incluidos en el sitio son información pública del portfolio.

## Licencia

El código, diseño y arte originales pertenecen a Ignacio Schwindt. Las dependencias de terceros conservan sus respectivas licencias.
