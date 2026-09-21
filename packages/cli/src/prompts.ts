import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

export async function withPrompts<T>(
  run: (ask: (question: string, fallback?: string) => Promise<string>) => Promise<T>,
): Promise<T> {
  const rl = createInterface({ input: stdin, output: stdout });
  const ask = async (question: string, fallback?: string): Promise<string> => {
    const suffix = fallback ? ` [${fallback}]` : '';
    const answer = (await rl.question(`${question}${suffix}: `)).trim();
    return answer || fallback || '';
  };
  try {
    return await run(ask);
  } finally {
    rl.close();
  }
}
