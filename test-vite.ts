import { createServer } from "vite";
async function test() {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  console.log("Vite created successfully");
  await vite.close();
}
test().catch(console.error);
