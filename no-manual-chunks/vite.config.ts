import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          // manualChunks(id: string) {
          //   const module = id.split("/node_modules/")[1];
          //   if (!module) {
          //     return; // void
          //   }
          //   if (module.match(/^@react-three\/drei\//)) return "drei";
          //   if (module.match(/^@react-three\/fiber\//)) return "fiber";
          //   if (module.match(/^@react-three\/rapier\//)) return "rapier";
          //   if (module.match(/^leva\//)) return "leva";
          //   if (module.match(/^meshline\//)) return "meshline";
          //   if (module.match(/^three\//)) return "three";
          //   return; // void
          // },
        },
      },
    },
  };
});
