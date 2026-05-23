import { getMagnetBySlug } from "@/lib/db/queries/magnets";
import { getTabsByMagnet } from "@/lib/db/queries/tabs";
import { getGatesByMagnet } from "@/lib/db/queries/gates";
import { getIntegrationsByMagnet } from "@/lib/db/queries/integrations";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PublicMagnetView from "@/components/public/PublicMagnetView";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const magnet = await getMagnetBySlug(slug);
  if (!magnet) return { title: "Not Found" };
  const settings = magnet.settings as { seoTitle?: string; seoDescription?: string; logo?: string };
  return {
    title: settings.seoTitle ?? magnet.title,
    description: settings.seoDescription ?? `Access this free resource: ${magnet.title}`,
    openGraph: {
      title: settings.seoTitle ?? magnet.title,
      description: settings.seoDescription ?? `Access this free resource: ${magnet.title}`,
      images: settings.logo ? [settings.logo] : [],
    },
  };
}

export default async function PublicMagnetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const magnet = await getMagnetBySlug(slug);
  if (!magnet) notFound();

  const [tabs, gates, integrations] = await Promise.all([
    getTabsByMagnet(magnet.id),
    getGatesByMagnet(magnet.id),
    getIntegrationsByMagnet(magnet.id),
  ]);

  const settings = magnet.settings as Record<string, string>;
  const rb2bIntegration = integrations.find(i => i.type === "rb2b" && i.active);
  const rb2bPixelId = rb2bIntegration ? (rb2bIntegration.config as { pixelId: string }).pixelId : undefined;

  return (
    <>
      {rb2bPixelId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){var reb2b=window.reb2b=window.reb2b||[];if(reb2b.invoked)return;reb2b.invoked=true;reb2b.methods=["identify","collect"];reb2b.factory=function(method){return function(){var args=Array.prototype.slice.call(arguments);args.unshift(method);reb2b.push(args);return reb2b;}};for(var i=0;i<reb2b.methods.length;i++){var key=reb2b.methods[i];reb2b[key]=reb2b.factory(key)}reb2b.load=function(key){var script=document.createElement("script");script.type="text/javascript";script.async=true;script.src="https://s3-us-west-2.amazonaws.com/b2bjsstore/b/"+key+"/reb2b.js.gz";var first=document.getElementsByTagName("script")[0];first.parentNode.insertBefore(script,first);};reb2b.SNIPPET_VERSION="1.0.1";reb2b.load("${rb2bPixelId}");}();`,
          }}
        />
      )}
      <PublicMagnetView
        magnet={magnet}
        tabs={tabs}
        gates={gates.filter(g => g.active)}
        settings={settings}
      />
    </>
  );
}
