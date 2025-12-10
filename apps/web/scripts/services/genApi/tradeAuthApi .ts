import console from 'node:console'
import { resolve } from 'node:path'
import process from 'node:process'
import { camelCase, compact, lowerCase, replace } from 'lodash-es'
import { generateApi } from 'swagger-typescript-api'

export function generateBladeAuthApi({ env = 'development' }: { env?: string } = {}) {
  console.log(env)
  const url = `http://172.31.27.8:8000/blade-auth/v2/api-docs`

  if (!url) {
    throw new Error('Could not find api json document url')
  }

  const moduleNameIndex = 1

  const x = generateApi({
    fileName: 'gen.ts',
    // input: resolve(process.cwd(), './scripts/services/genApi/blade-auth.json'),
    url,
    apiClassName: 'BladeAuthApi',
    singleHttpClient: true,
    output: resolve(process.cwd(), './src/services/api/blade-auth/instance'),
    generateUnionEnums: true,
    extractRequestParams: false,
    extractRequestBody: false,
    extractResponseBody: false,
    enumNamesAsValues: true,
    addReadonly: true,
    generateRouteTypes: true,
    moduleNameFirstTag: false,
    moduleNameIndex: moduleNameIndex,
    extractEnums: true,
    // unwrapResponseData: true,
    // httpClientType: 'fetch',
    // codeGenConstructs: (data) => {
    //   // console.log(data)
    //   // data.Keyword.Any = 'unknown'
    //   return data
    // },
    // primitiveTypeConstructs: () => {
    //   return {}
    // },
    hooks: {
      onFormatRouteName: (routeInfo) => {
        const methodAliases: Record<string, (pathName: string, hasPathInserts: boolean) => string> = {
          get: (pathName: string, hasPathInserts: boolean) => {
            let name = `get_${pathName}`.toLocaleLowerCase()

            // console.log(hasPathInserts, pathName)
            // if(hasPathInserts) {
            //   const hasPathInsertsName = 'detail'
            //   const endsWith = [hasPathInsertsName, 'info']
            //   if(!endsWith.some((item) => name.endsWith(item))) {
            //     name = `${name}_${hasPathInsertsName}`
            //   }
            // } else {
            //   const hasPathInsertsName = 'list'
            //   const endsWith = [hasPathInsertsName]
            //   if(!endsWith.some((item) => name.endsWith(item))) {
            //     name = `${name}_${hasPathInsertsName}`
            //   }
            // }
            if (name.endsWith('page')) {
              name = `${name}_${'list'}`
            }

            return camelCase(name)
          },
          post: (pathName: string, hasPathInserts: boolean) => camelCase(`post_${pathName}`),
          put: (pathName: string, hasPathInserts: boolean) => camelCase(`put_${pathName}`),
          patch: (pathName: string, hasPathInserts: boolean) => camelCase(`path_${pathName}`),
          delete: (pathName: string, hasPathInserts: boolean) => camelCase(`delete_${pathName}`),
        }

        // console.log('=============================================')
        // console.log('routeInfo', routeInfo)
        // console.log('templateRouteName', templateRouteName)
        const { method, moduleName, route } = routeInfo

        const hasPathInserts = /\{\w+\}/.test(route)
        let splittedRouteBySlash = compact(replace(route, /\{(\w)+\}/g, '').split('/'))

        if (moduleNameIndex > 0) {
          // console.log(splittedRouteBySlash)
          splittedRouteBySlash = splittedRouteBySlash.splice(moduleNameIndex)
          // console.log(console.log(splittedRouteBySlash))
        }

        const routeParts = (
          splittedRouteBySlash.length > 4 ? splittedRouteBySlash.splice(3) : splittedRouteBySlash
        ).join('_')

        // console.log('hasPathInserts', hasPathInserts)
        // console.log('splittedRouteBySlash', splittedRouteBySlash)
        // console.log('routeParts', routeParts)
        const name =
          routeParts.length > 3 && !!methodAliases[method]
            ? methodAliases[method](routeParts, hasPathInserts)
            : camelCase(`${lowerCase(method)}_${[moduleName].join('_')}`) || 'index'
        // console.log(routeParts)
        // console.log(name, splittedRouteBySlash)

        return camelCase(name)
      },
    },
  })

  return x as any
}

export function timingGenerateBladeAuthApi({
  timing,
  env,
}: {
  /**
   * Timed generation (minutes)
   */
  timing?: number | boolean
  /**
   * Packaged environment
   */
  env?: string
} = {}) {
  generateBladeAuthApi({ env })

  // Default ten minutes
  const defaultTiming = 10
  const defineTiming = timing === true ? defaultTiming : typeof timing === 'number' && timing > 0 ? timing : 0
  if (defineTiming) {
    const delay = defineTiming * 1000 * 60
    setInterval(() => {
      generateBladeAuthApi({ env })
    }, delay)
  }
}
