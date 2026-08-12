import { importPage, generateStaticParamsFor } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '@/mdx-components'

type RouteParams = {
  mdxPath?: string[]
}

const SECTION = 'blog'

export async function generateStaticParams() {
  const params = await generateStaticParamsFor('mdxPath')()
  return params
    .filter((item) => {
      const path = item.mdxPath
      return Array.isArray(path) && path[0] === SECTION
    })
    .map((item) => ({ mdxPath: (item.mdxPath as string[]).slice(1) }))
}

function withSectionPrefix(mdxPath?: string[]) {
  return [SECTION, ...(mdxPath ?? [])]
}

export async function generateMetadata(props: { params: Promise<RouteParams> }) {
  const params = await props.params
  const { metadata } = await importPage(withSectionPrefix(params.mdxPath))
  return metadata
}

const Wrapper = getMDXComponents({}).wrapper

export default async function Page(props: { params: Promise<RouteParams> }) {
  const params = await props.params
  const result = await importPage(withSectionPrefix(params.mdxPath))
  const { default: MDXContent, toc, metadata } = result

  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}