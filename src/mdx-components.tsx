import { useMDXComponents as getDocsThemeComponents } from 'nextra-theme-docs'
import { useMDXComponents as getBlogThemeComponents } from 'nextra-theme-blog'

const docsThemeComponents = getDocsThemeComponents()
const blogThemeComponents = getBlogThemeComponents()

export function useMDXComponents(components: Record<string, React.ComponentType<unknown>>) {
  return {
    ...docsThemeComponents,
    ...blogThemeComponents,
    ...components,
  }
}