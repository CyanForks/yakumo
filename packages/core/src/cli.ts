#!/usr/bin/env node

for (let i = 2; i < process.argv.length; i++) {
  if (!process.argv[i].startsWith('--import')) continue
  const [arg] = process.argv.splice(i, 1)
  let [, path] = arg.split('=')
  if (!path) {
    path = process.argv.splice(i, 1)[0]
  }
  await import(path)
  --i
}

const { Context } = await import('cordis')
const { default: Loader } = await import('@cordisjs/plugin-loader')
const { default: Include } = await import('@cordisjs/plugin-include')
const { default: Cli } = await import('@cordisjs/plugin-cli')

const ctx = new Context()
await ctx.plugin(Loader)
await ctx.plugin(Include, {
  path: './yakumo.yml',
  initial: [
    { name: 'yakumo' },
  ],
})
await ctx.plugin(Cli, {
  name: 'yakumo',
})
await ctx.cli.executeArgv()

export {}
