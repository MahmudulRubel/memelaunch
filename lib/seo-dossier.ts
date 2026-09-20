/**
 * SEO Dossier Data Structures and Synthesis Engine
 * Guarantees in-depth, high-ranking SEO content for all products on MemeLaunch
 */

export interface SeoFeature {
  title: string;
  description: string;
  icon?: string;
}

export interface TargetPersona {
  role: string;
  benefit: string;
}

export interface SeoFaq {
  question: string;
  answer: string;
}

export interface AlternateMeme {
  url: string;
  caption?: string;
  angle?: string;
}

export interface SeoDossier {
  tagline: string;
  problemStatement: string;
  solution: string;
  features: SeoFeature[];
  targetAudience: TargetPersona[];
  faqs: SeoFaq[];
  techHighlights?: string[];
  alternateMemes?: AlternateMeme[];
}

/**
 * Validates whether an object matches the SeoDossier structure
 */
export function isValidSeoDossier(obj: any): obj is SeoDossier {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.tagline === 'string' &&
    typeof obj.problemStatement === 'string' &&
    typeof obj.solution === 'string' &&
    Array.isArray(obj.features) &&
    obj.features.length > 0 &&
    Array.isArray(obj.targetAudience) &&
    Array.isArray(obj.faqs) &&
    obj.faqs.length > 0
  );
}

/**
 * Intelligent Fallback Synthesizer:
 * Generates an authoritative, compelling SEO dossier for any launch if one was not explicitly saved.
 */
export function synthesizeSeoDossier(launch: {
  product_name?: string | null;
  product_description?: string | null;
  category?: string | null;
  pricing?: string | null;
  product_url?: string | null;
  seo_dossier?: any;
}): SeoDossier {
  // If already present and valid, return it
  if (isValidSeoDossier(launch.seo_dossier)) {
    return launch.seo_dossier;
  }

  const name = launch.product_name?.trim() || 'This Product';
  const rawDesc = launch.product_description?.trim() || '';
  const category = launch.category?.trim() || 'Software & Tech';
  const pricing = (launch.pricing || 'free').toLowerCase();

  const pricingSummary =
    pricing === 'free'
      ? '100% Free to use'
      : pricing === 'freemium'
      ? 'Free tier available with optional premium upgrades'
      : 'Commercial software with dedicated founder support';

  const defaultDesc = rawDesc || `${name} is a high-performance ${category} solution built for modern builders.`;

  return {
    tagline: `${name} — The ultimate ${category} tool designed for builders who ship fast.`,
    problemStatement: `Modern creators and teams waste countless hours wrestling with clunky workflows, bloated legacy tools, and fragmented setups in the ${category} space. Most alternatives are either overpriced, excessively complex, or lack the community momentum needed to scale.`,
    solution: `${name} solves this by delivering a lightning-fast, purpose-built platform that streamlines execution. With an intuitive interface, thoughtful developer ergonomics, and zero unnecessary friction, it empowers you to focus on shipping and scaling.`,
    features: [
      {
        title: 'Frictionless Workflow',
        description: `Eliminate context switching and repetitive manual steps with an interface designed specifically for ${category} workflows.`,
        icon: 'Zap',
      },
      {
        title: 'Modern Architecture',
        description: `Engineered for responsiveness and resilience, ensuring your data and operations stay rapid and dependable under high load.`,
        icon: 'Cpu',
      },
      {
        title: 'Seamless Sharing & Growth',
        description: `Built-in viral mechanics and community discovery let you showcase your progress, gather immediate user feedback, and grow organically.`,
        icon: 'Sparkles',
      },
      {
        title: 'Transparent Pricing',
        description: `${pricingSummary}, providing clear value from day one without surprise fees or vendor lock-in.`,
        icon: 'Shield',
      },
    ],
    targetAudience: [
      {
        role: 'Founders & Indie Hackers',
        benefit: `Ship faster and validate ideas without wasting days configuring complex toolchains.`,
      },
      {
        role: 'Engineers & Developers',
        benefit: `Enjoy clean ergonomics, predictable behavior, and reliable performance out of the box.`,
      },
      {
        role: 'Growth & Marketing Teams',
        benefit: `Leverage viral momentum, community traction, and modern product presentation to attract adopters.`,
      },
    ],
    faqs: [
      {
        question: `What is ${name} and who is it built for?`,
        answer: `${name} is an innovative ${category} platform tailored for creators, founders, and teams seeking to accelerate their productivity and streamline daily workflows.`,
      },
      {
        question: `How much does ${name} cost?`,
        answer: `${name} operates on a ${pricing.toUpperCase()} model (${pricingSummary}). You can explore its features directly from the verified product link above.`,
      },
      {
        question: `Why was ${name} launched on MemeLaunch?`,
        answer: `MemeLaunch is the premier launchpad where high-agency builders ship in public, turn startup grit into viral humor, and win genuine early adopters and community upvotes.`,
      },
      {
        question: `How can I get started with ${name}?`,
        answer: `Simply click the "Visit Website" button above to access the official ${name} application, explore documentation, and start using it immediately.`,
      },
    ],
    techHighlights: [
      category,
      pricing === 'free' ? 'Free Tier' : pricing === 'freemium' ? 'Freemium' : 'Paid Plan',
      'Verified Launch',
      'Community Upvoted',
    ],
    alternateMemes: [],
  };
}
