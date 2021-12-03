/**
 * @copyright Skyra Project
 * @license https://github.com/skyra-project/skyra/blob/main/LICENSE
 * @see https://github.com/skyra-project/skyra/blob/main/src/lib/env/augments.d.ts
 */

import type { KRLSEnv } from ".";

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends KRLSEnv {}
  }
}
