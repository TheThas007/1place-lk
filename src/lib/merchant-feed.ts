import { getProducts } from "@/lib/firestore-client";
import { isValidPrice } from "@/lib/utils";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, "").trim();
}

/**
 * Generates an official Google Merchant Center / Shopping RSS 2.0 Product Feed
 * Compliant with Google Merchant Center XML Specifications.
 */
export async function generateGoogleMerchantFeed(): Promise<string> {
  const baseUrl = "https://www.streetmobile.lk";
  const products = await getProducts().catch(() => []);

  // Filter for eligible products:
  // Must have a slug, must not be draft or inactive, and MUST have a valid non-zero price.
  const eligibleProducts = products.filter((p) => {
    if (!p.slug) return false;
    const status = (p as any).status;
    if (status === "draft" || status === "inactive") return false;

    const effectivePrice =
      typeof p.sale_price === "number" && p.sale_price > 0
        ? p.sale_price
        : p.price;

    return isValidPrice(effectivePrice) && effectivePrice > 0;
  });

  const itemsXml = eligibleProducts
    .map((product) => {
      const id = product.sku || product.code || product.id;
      const title = product.name;
      const rawDesc = product.description
        ? stripHtml(product.description)
        : `${product.name} available at Street Mobile Sri Lanka. 100% genuine with official warranty and fast islandwide delivery.`;
      const description = rawDesc.slice(0, 4900);
      const link = `${baseUrl}/products/${product.slug}`;

      const primaryImg =
        product.images?.[0] ||
        product.primary_image ||
        product.image_url ||
        product.thumbnail ||
        `${baseUrl}/logo.png`;

      // Price calculation
      const hasSale =
        typeof product.sale_price === "number" &&
        product.sale_price > 0 &&
        typeof product.price === "number" &&
        product.sale_price < product.price;

      const basePrice = hasSale ? product.price : (product.sale_price || product.price);
      const salePrice = hasSale ? product.sale_price : null;

      // Availability matching structured data
      let availability: "in_stock" | "out_of_stock" | "preorder" = "in_stock";
      const isPreOrder =
        product.stock_status === "pre_order" ||
        (product as any).is_preorder === true ||
        (product as any).pre_booking === true ||
        (product as any).pre_order === true;

      if (isPreOrder) {
        availability = "preorder";
      } else if (
        product.stock_status === "out_of_stock" ||
        ((product as any).stock_quantity === 0 && !isPreOrder) ||
        (product.stock_count === 0 && !isPreOrder)
      ) {
        availability = "out_of_stock";
      }

      // Brand
      const brand =
        product.brand_name ||
        product.brandName ||
        product.brand ||
        "";

      // Categories
      const category = product.category_name || product.categoryName || "";

      let item = `    <item>\n`;
      item += `      <g:id>${escapeXml(id)}</g:id>\n`;
      item += `      <g:title><![CDATA[${title}]]></g:title>\n`;
      item += `      <g:description><![CDATA[${description}]]></g:description>\n`;
      item += `      <g:link>${escapeXml(link)}</g:link>\n`;
      item += `      <g:image_link>${escapeXml(primaryImg)}</g:image_link>\n`;

      // Additional images if present
      if (product.images && product.images.length > 1) {
        product.images.slice(1, 10).forEach((extraImg) => {
          if (extraImg && extraImg !== primaryImg) {
            item += `      <g:additional_image_link>${escapeXml(extraImg)}</g:additional_image_link>\n`;
          }
        });
      }

      item += `      <g:price>${basePrice.toFixed(2)} LKR</g:price>\n`;
      if (salePrice) {
        item += `      <g:sale_price>${salePrice.toFixed(2)} LKR</g:sale_price>\n`;
      }

      item += `      <g:availability>${availability}</g:availability>\n`;
      item += `      <g:condition>new</g:condition>\n`;

      if (brand) {
        item += `      <g:brand><![CDATA[${brand}]]></g:brand>\n`;
      }

      if (product.sku) {
        item += `      <g:sku>${escapeXml(product.sku)}</g:sku>\n`;
      }

      if (category) {
        item += `      <g:product_type><![CDATA[${category}]]></g:product_type>\n`;
      }

      // GTIN / MPN only if available
      if ((product as any).gtin) {
        item += `      <g:gtin>${escapeXml((product as any).gtin)}</g:gtin>\n`;
      }
      if ((product as any).mpn) {
        item += `      <g:mpn>${escapeXml((product as any).mpn)}</g:mpn>\n`;
      }
      if (!(product as any).gtin && !(product as any).mpn) {
        item += `      <g:identifier_exists>${brand ? "yes" : "no"}</g:identifier_exists>\n`;
      }

      item += `    </item>`;
      return item;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>StreetMobile Sri Lanka - Official Google Merchant Center Product Feed</title>
    <link>${baseUrl}</link>
    <description>100% Genuine Smartphones, Apple, Samsung, Xiaomi &amp; Premium Accessories in Sri Lanka with Official Warranty.</description>
${itemsXml}
  </channel>
</rss>`;
}
