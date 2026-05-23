import { preview } from 'vite';

const port = Number(process.env.PORT) || 3000;

await preview({
  preview: {
    host: '0.0.0.0',
    port,
    strictPort: true,
  },
});

console.log(`Ruletona listening on 0.0.0.0:${port}`);
