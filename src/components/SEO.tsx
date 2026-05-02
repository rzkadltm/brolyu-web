import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://brolyu.com'
const SITE_NAME = 'Brolyu'
const DEFAULT_TITLE = 'Brolyu — Make Friends, Learn Languages & Game Together'
const DEFAULT_DESCRIPTION =
  'Join Brolyu to connect with people worldwide through live voice rooms. Make new friends, practice languages with native speakers, study together, and play games — all in real-time.'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`

interface SEOProps {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'article' | 'profile'
  noIndex?: boolean
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

export function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = '',
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false,
  jsonLd,
}: SEOProps) {
  const url = `${SITE_URL}${path}`
  const fullTitle =
    title === DEFAULT_TITLE ? title : `${title} | Brolyu`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content="brolyu, make friends online, language learning, language exchange, study together, game together online, voice chat rooms, meet people online, online community, voice rooms, practice languages"
      />
      <meta name="author" content="Brolyu" />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
      )}
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@brolyu" />
      <meta name="twitter:creator" content="@brolyu" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}
    </Helmet>
  )
}
