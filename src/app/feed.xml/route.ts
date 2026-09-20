import { generateGoogleMerchantFeed } from "@/lib/merchant-feed";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // revalidate every hour

export async function GET() {
  try {
    const xml = await generateGoogleMerchantFeed();
    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error: any) {
    console.error("Error generating Google Merchant feed:", error);
    return new Response("<error>Failed to generate product feed</error>", {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
