import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert'
import { it } from 'vitest'

const cliPath = fileURLToPath(new URL('../../core/src/cli.ts', import.meta.url))
const fixtureDir = fileURLToPath(new URL('../../../fixtures/default/', import.meta.url))

export interface TestExecOptions {
  args: string[]
  code?: number
}

export function testExec(options: TestExecOptions) {
  const command = options.args.join(' ')
  it(command, () => new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, ['--import', 'tsx', cliPath, ...options.args], {
      cwd: fixtureDir,
      stdio: 'inherit',
    })
    child.on('close', (code) => {
      try {
        assert.strictEqual(code, options.code ?? 0)
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  }))
}
