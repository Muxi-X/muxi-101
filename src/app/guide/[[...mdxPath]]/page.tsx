import { importPage, generateStaticParamsFor } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from 'nextra-theme-docs'

type RouteParams = {
  mdxPath?: string[]
}

const SECTION = 'guide'

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
  const { default: MDXContent, toc, metadata, sourceCode } = result

  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}