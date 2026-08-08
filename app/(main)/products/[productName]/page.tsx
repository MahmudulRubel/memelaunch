import React from 'react';
import Link from 'next/link';
import { insforge, insforgeAdmin } from '@/lib/insforge';
import { ProductView } from '@/components/product/product-view';
import { AlertCircle, ArrowLeft, Rocket } from 'lucide-react';

interface PageProps {
  params: Promise<{
    productName: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { productName } = await params;
  const decodedName = decodeURIComponent(productName);

  return {
    title: `${decodedName} | MemeLaunch`,
    description: `Check out ${decodedName} on MemeLaunch - Build in Public. Launch in Humor.`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { productName } = await params;
  const decodedName = decodeURIComponent(productName);

  let launchId: string | null = null;

  try {
    // 1. Primary lookup: Case-insensitive search on product_name
    const primaryQuery = insforgeAdmin.database
      .from('launches')
      .select('id')
      .ilike('product_name', decodedName)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: { message: 'Product lookup timeout' } }), 3500)
    );

    const { data: nameMatch } = await Promise.race([primaryQuery, timeoutPromise]);

    if (nameMatch?.id) {
      launchId = nameMatch.id;
    } else {
      // 2. Fallback lookup: Search by UUID if parameter is an ID
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(decodedName);
      if (isUuid) {
        const idQuery = insforge.database
          .from('launches')
          .select('id')
          .eq('id', decodedName)
          .maybeSingle();
        const { data: idMatch } = await Promise.race([idQuery, timeoutPromise]);
        if (idMatch?.id) {
          launchId = idMatch.id;
        }
      }
    }
  } catch (err) {
    console.error('Error looking up launch by product name:', err);
  }

  if (!launchId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-6 max-w-lg mx-auto">
        <div className="h-20 w-20 bg-rose-500/10 border-2 border-rose-500/30 rounded-3xl flex items-center justify-center text-rose-500 shadow-brutal">
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
            className="w-full sm:w-auto px-6 py-3 bg-[#ffe600] text-zinc-950 font-black uppercase text-xs rounded-xl border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Feed
          </Link>
          <Link
            href="/launch"
            className="w-full sm:w-auto px-6 py-3 bg-zinc-900 border-2 border-black text-zinc-200 hover:text-zinc-950 hover:bg-lime-400 font-black uppercase text-xs rounded-xl shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2"
          >
            <Rocket className="h-4 w-4" /> Launch A Product
          </Link>
        </div>
      </div>
    );
  }

  return <ProductView initialLaunchId={launchId} />;
}
