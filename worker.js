export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Producten ophalen
    if (url.pathname === "/api/products" && request.method === "GET") {
      const result = await env.DB
        .prepare("SELECT * FROM products WHERE active = 1 ORDER BY created_at DESC")
        .all();

      return Response.json(result.results);
    }

    // Product toevoegen
    if (url.pathname === "/api/products" && request.method === "POST") {
      try {
        const product = await request.json();

        const id = crypto.randomUUID();

        await env.DB
          .prepare(`
            INSERT INTO products
            (id, name, price_cents, stock, unlimited_stock, category,
             image_url, description, specs)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            id,
            product.name,
            Math.round(Number(product.price) * 100),
            Number(product.stock || 0),
            product.unlimited ? 1 : 0,
            product.category || "",
            product.image_url || "",
            product.description || "",
            product.specs || ""
          )
          .run();

        return Response.json({
          success: true,
          id
        });
      } catch (error) {
        return Response.json(
          {
            success: false,
            error: error.message
          },
          { status: 400 }
        );
      }
    }

    // Websitebestanden tonen
    return env.ASSETS.fetch(request);
  }
};
