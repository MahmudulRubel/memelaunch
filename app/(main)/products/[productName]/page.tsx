import React, { cache } from 'react';
import Link from 'next/link';
import { insforge, insforgeAdmin } from '@/lib/insforge';
import { ProductView } from '@/components/product/product-view';
import { synthesizeSeoDossier } from '@/lib/seo-dossier';
import { AlertCircle, ArrowLeft, Rocket } from 'lucide-react';

interface PageProps {
  params: Promise<{
    productName: string;
  }>;
}

/**
 * Deduplicated per-request product lookup cached across generateMetadata and Page render
 */
const getLaunchData = cache(async (rawProductName: string) => {
  const decodedName = decodeURIComponent(rawProductName).trim();
  try {
    // 1. Primary lookup: Case-insensitive search on product_name
    const { data: nameMatch, error: nameErr } = await insforgeAdmin.database
      .from('launches')
      .select('id, user_id, product_name, product_description, product_url, category, pricing, meme_image_url, product_logo_url, caption, created_at, seo_dossier')
      .ilike('product_name', decodedName)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (nameErr) {
      console.error('GETLAUNCHDATA PRIMARY ERROR:', nameErr);
    }

    if (nameMatch?.id) {
      return nameMatch;
    }

    // 2. Fallback lookup: Search by UUID if parameter is an ID
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(decodedName);
    if (isUuid) {
      const { data: idMatch } = await insforgeAdmin.database
        .from('launches')
        .select('id, user_id, product_name, product_description, product_url, category, pricing, meme_image_url, product_logo_url, caption, created_at, seo_dossier')
        .eq('id', decodedName)
        .maybeSingle();

      if (idMatch?.id) {
        return idMatch;
      }
    }
  } catch (err) {
    console.error('Error fetching launch in getLaunchData:', err);
  }
  return null;
});

export async function generateMetadata({ params }: PageProps) {
  const { productName } = await params;
  const decodedName = decodeURIComponent(productName);
  const launch = await getLaunchData(productName);

  let description = `Check out ${decodedName} on MemeLaunch - Build in Public. Launch in Humor. Win the Week.`;
  let title = `${decodedName} — Reviews, Features, Memes & Pricing | MemeLaunch`;
  let category = 'SaaS & Tech';

  if (launch) {
    const dossier = synthesizeSeoDossier(launch);
    category = launch.category || category;
    title = `${launch.product_name} — ${dossier.tagline ? dossier.tagline.slice(0, 60) : 'Reviews & Pricing'} | MemeLaunch`;
    description = dossier.tagline
      ? `${dossier.tagline}. ${launch.product_description || dossier.solution}`.slice(0, 160)
      : launch.product_description || description;
  }

  const encodedPath = encodeURIComponent(decodedName);

  return {
    title,
    description,
    keywords: [
      decodedName,
      category,
      'MemeLaunch',
      'product launch',
      'software reviews',
      'startup pricing',
      'AI memes',
      'indie hackers',
    ],
    alternates: {
      canonical: `https://www.launchme.me/products/${encodedPath}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.launchme.me/products/${encodedPath}`,
      siteName: 'MemeLaunch',
      type: 'website',
      images: [
        {
          url: `https://www.launchme.me/products/${encodedPath}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${decodedName} on MemeLaunch`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@launchme_me',
      creator: '@launchme_me',
      images: [`https://www.launchme.me/products/${encodedPath}/opengraph-image`],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { productName } = await params;
  const decodedName = decodeURIComponent(productName);
  const launch = await getLaunchData(productName);

  console.log('PAGE LAUNCH OBJ:', { productName, decodedName, launch });

  if (!launch?.id) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-6 max-w-lg mx-auto">
        <div className="h-20 w-20 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-center text-rose-400 shadow-xl backdrop-blur-xl">
          <AlertCircle className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-zinc-100">
            Product Not Found
          </h1>
          <p className="text-zinc-400 text-sm font-medium">
            We couldn&apos;t find any product launch matching &quot;<span className="text-[#ffe600] font-bold">{decodedName}</span>&quot;.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-[#ffe600] text-zinc-950 font-black uppercase text-xs rounded-xl shadow-lg hover:bg-yellow-300 hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Feed
          </Link>
          <Link
            href="/launch"
            className="w-full sm:w-auto px-6 py-3 bg-zinc-900/80 border border-white/10 text-zinc-200 hover:text-white hover:bg-zinc-800 font-bold uppercase text-xs rounded-xl shadow-md hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <Rocket className="h-4 w-4 text-[#ffe600]" /> Launch A Product
          </Link>
        </div>
      </div>
    );
  }

  const encodedPath = encodeURIComponent(launch.product_name);
  const dossier = synthesizeSeoDossier(launch);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: launch.product_name,
        headline: dossier.tagline,
        description: launch.product_description || dossier.solution,
        url: `https://www.launchme.me/products/${encodedPath}`,
        applicationCategory: launch.category || 'BusinessApplication',
        operatingSystem: 'All',
        image: launch.meme_image_url || `https://www.launchme.me/products/${encodedPath}/opengraph-image`,
        offers: {
          '@type': 'Offer',
          price: launch.pricing === 'paid' ? 'Paid' : '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        publisher: {
          '@type': 'Organization',
          name: 'MemeLaunch',
          url: 'https://www.launchme.me',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: dossier.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.launchme.me',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: launch.category || 'Products',
            item: `https://www.launchme.me/?category=${encodeURIComponent(launch.category || 'All')}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: launch.product_name,
            item: `https://www.launchme.me/products/${encodedPath}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductView initialLaunchId={launch.id} initialLaunch={launch as any} />
    </>
  );
}
