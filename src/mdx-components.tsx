import { useMDXComponents as getDocsThemeComponents } from 'nextra-theme-docs' // nextra-theme-blog or your custom theme
import { useMDXComponents as getBlogThemeComponents } from 'nextra-theme-blog' // nextra-theme-blog or your custom theme

// Get the default MDX components
const docsThemeComponents = getDocsThemeComponents()
const blogThemeComponents = getBlogThemeComponents()

// Merge components
export function useMDXComponents(components: Record<string, React.ComponentType<unknown>>) {
  return {
    ...docsThemeComponents,
    ...blogThemeComponents,
    ...components,
  }
}
