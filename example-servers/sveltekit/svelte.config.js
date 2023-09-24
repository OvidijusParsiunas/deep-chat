import {vitePreprocess} from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-auto';
// VERCEL - switch to the following adapter instead when deploying to Vercel
// import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
  },
};

export default config;
