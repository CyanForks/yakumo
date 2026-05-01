import { Context } from 'yakumo'
import type {} from '@cordisjs/plugin-cli'
import { startVitest } from 'vitest/node'
import { globby } from 'globby'

export const inject = ['yakumo', 'cli']

export function apply(ctx: Context) {
  ctx.cli
    .command('vitest [...packages]', 'Run tests with vitest')
    .option('-w, --watch', 'Watch mode')
    .option('-u, --update', 'Update snapshots')
    .option('-b, --bail [bail:integer]', 'Stop after first N failures')
    .option('-t, --test-timeout [ms:integer]', 'Per-test timeout in milliseconds')
    .option('--coverage', 'Collect coverage (requires @vitest/coverage-v8)')
    .option('--coverage.reporter [...reporter]', 'Coverage reporter(s): text, html, json, lcov, ...')
    .action(async ({ args, options }) => {
      await ctx.yakumo.initialize()

      function getPatterns(names: string[]) {
        if (!names.length) return ['**/tests/*.spec.ts']
        return names.flatMap((name) => {
          const [folder] = name.split('/', 1)
          name = name.slice(folder.length + 1) || '*'
          return ctx.yakumo.locate(folder, { includeRoot: true }).map((path) => {
            return `${path}/tests/${name}.spec.ts`.slice(1)
          })
        })
      }

      const files = await globby(getPatterns(args), {
        cwd: ctx.yakumo.cwd,
        onlyFiles: true,
        absolute: true,
        ignore: ['**/node_modules/**'],
      })

      const vitest = await startVitest('test', files, {
        watch: !!options.watch,
        update: !!options.update,
        bail: options.bail,
        testTimeout: options.testTimeout,
        passWithNoTests: true,
        root: ctx.yakumo.cwd,
        ...options.coverage ? {
          coverage: {
            enabled: true,
            provider: 'v8',
            reporter: options['coverage.reporter'],
          },
        } : {},
      })

      if (!vitest) {
        process.exit(1)
      }

      if (!options.watch) {
        const failed = vitest.state.getCountOfFailedTests()
        await vitest.close()
        process.exit(failed > 0 ? 1 : 0)
      }
    })
}
