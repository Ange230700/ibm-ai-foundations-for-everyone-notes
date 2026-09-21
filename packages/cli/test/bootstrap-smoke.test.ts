import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { cp, copyFile, mkdir, mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const templateRoot = fileURLToPath(new URL('../../../', import.meta.url));
const repositoryRootEnvironment = 'COURSERA_NOTES_REPOSITORY_ROOT';

interface CommandResult {
  stdout: string;
  stderr: string;
}

async function seedTemplate(repositoryRoot: string): Promise<void> {
  await Promise.all([
    mkdir(resolve(repositoryRoot, 'courses'), { recursive: true }),
    mkdir(resolve(repositoryRoot, 'docs'), { recursive: true }),
    mkdir(resolve(repositoryRoot, 'packages'), { recursive: true }),
    cp(resolve(templateRoot, 'design-system'), resolve(repositoryRoot, 'design-system'), {
      recursive: true,
    }),
  ]);

  await Promise.all(
    [
      'LICENSE.template',
      'manifest.json',
      'manifest.schema.json',
      'package.json',
      'pnpm-workspace.yaml',
    ].map((path) => copyFile(resolve(templateRoot, path), resolve(repositoryRoot, path))),
  );
}

async function runTypeScript(
  repositoryRoot: string,
  script: string,
  args: readonly string[] = [],
  answers: readonly string[] = [],
): Promise<CommandResult> {
  const child = spawn(
    process.execPath,
    ['--import', 'tsx', resolve(templateRoot, script), ...args],
    {
      cwd: templateRoot,
      env: {
        ...process.env,
        [repositoryRootEnvironment]: repositoryRoot,
      },
      stdio: 'pipe',
    },
  );

  let stdout = '';
  let stderr = '';
  let promptsAnswered = 0;

  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk: string) => {
    stdout += chunk;

    const promptCount = stdout.match(/: /g)?.length ?? 0;

    while (promptsAnswered < promptCount && promptsAnswered < answers.length) {
      const answer = answers[promptsAnswered];

      if (answer === undefined) {
        break;
      }

      promptsAnswered += 1;

      if (promptsAnswered === answers.length) {
        child.stdin.end(`${answer}\n`);
      } else {
        child.stdin.write(`${answer}\n`);
      }
    }
  });
  child.stderr.on('data', (chunk: string) => {
    stderr += chunk;
  });

  if (answers.length === 0) {
    child.stdin.end();
  }

  const exitCode = await new Promise<number>((complete, reject) => {
    child.on('error', reject);
    child.on('close', (code) => complete(code ?? 1));
  });

  if (exitCode !== 0) {
    throw new Error(
      [
        `Command failed: ${script} ${args.join(' ')}`,
        `exit=${exitCode}`,
        `stdout:\n${stdout}`,
        `stderr:\n${stderr}`,
      ].join('\n'),
    );
  }

  return { stdout, stderr };
}

test(
  'clean template bootstrap generates and verifies canonical artifacts',
  {
    timeout: 120_000,
  },
  async () => {
    const repositoryRoot = await mkdtemp(resolve(tmpdir(), 'coursera-notes-v1-'));

    try {
      await seedTemplate(repositoryRoot);

      const setup = await runTypeScript(
        repositoryRoot,
        'packages/cli/src/setup.ts',
        [],
        ['V1 Smoke Program', 'Smoke Provider', 'v1-smoke-program', 'Smoke Holder', '2026'],
      );

      assert.match(setup.stdout, /Configured V1 Smoke Program/);

      const course = await runTypeScript(
        repositoryRoot,
        'packages/cli/src/course-add.ts',
        [],
        ['Smoke Course', 'Cours de démonstration', 'smoke-course'],
      );

      assert.match(course.stdout, /Added course-01/);

      const module = await runTypeScript(
        repositoryRoot,
        'packages/cli/src/module-add.ts',
        [],
        ['1', 'Smoke Module', 'Module de démonstration', 'smoke-module'],
      );

      assert.match(module.stdout, /Added module-01 to course-01/);

      const manifest = JSON.parse(
        await readFile(resolve(repositoryRoot, 'manifest.json'), 'utf8'),
      ) as {
        repository: { status: string };
        program: { id: string; title: string };
        courses: Array<{
          id: string;
          modules: Array<{ id: string }>;
        }>;
      };

      assert.equal(manifest.repository.status, 'configured');
      assert.equal(manifest.program.title, 'V1 Smoke Program');
      assert.match(manifest.program.id, /^program_[0-9a-f-]{36}$/i);
      assert.equal(manifest.courses.length, 1);
      assert.equal(manifest.courses[0]?.modules.length, 1);

      const generatedCourse = manifest.courses[0];
      const generatedModule = generatedCourse?.modules[0];

      assert.ok(generatedCourse);
      assert.ok(generatedModule);

      const validation = await runTypeScript(repositoryRoot, 'packages/cli/src/check.ts', [
        '--full',
      ]);

      assert.match(validation.stdout, /PASS manifest\.validate/);
      assert.match(validation.stdout, /PASS courses\.structure/);
      assert.match(validation.stdout, /2 active module-language target\(s\)/);

      const plan = await runTypeScript(repositoryRoot, 'packages/cli/src/artifact.ts', [
        'plan',
        '--course=1',
        '--module=1',
        '--lang=en',
        '--json',
      ]);

      const planPayload = JSON.parse(plan.stdout) as {
        targets: Array<{ key: string; language: string }>;
      };

      assert.deepEqual(planPayload.targets, [
        {
          key: 'course-01.module-01.en',
          courseId: generatedCourse.id,
          courseOrdinal: 1,
          moduleId: generatedModule.id,
          moduleOrdinal: 1,
          language: 'en',
          sourcePath: 'courses/01-smoke-course/en/01-smoke-module.md',
        },
      ]);

      await runTypeScript(repositoryRoot, 'packages/artifacts/src/export-txt.ts', ['--course=1']);

      const englishText = await readFile(
        resolve(repositoryRoot, '.artifacts', 'exports', 'course-01.en.txt'),
        'utf8',
      );
      const frenchText = await readFile(
        resolve(repositoryRoot, '.artifacts', 'exports', 'course-01.fr.txt'),
        'utf8',
      );

      assert.match(englishText, /Smoke Course/);
      assert.match(englishText, /Smoke Module/);
      assert.match(frenchText, /Cours de démonstration/);
      assert.match(frenchText, /Module de démonstration/);

      for (const format of ['pdf', 'pptx'] as const) {
        await runTypeScript(repositoryRoot, 'packages/cli/src/artifact.ts', [
          format,
          '--course=1',
          '--module=1',
          '--lang=en',
        ]);

        const verification = await runTypeScript(repositoryRoot, 'packages/cli/src/artifact.ts', [
          'verify',
          `--format=${format}`,
          '--course=1',
          '--module=1',
          '--lang=en',
        ]);

        assert.match(verification.stdout, /PASS/);

        const artifactPath = resolve(
          repositoryRoot,
          '.artifacts',
          format === 'pdf' ? 'document-pdf' : 'native-pptx',
          generatedCourse.id,
          generatedModule.id,
          'en',
          `module.${format}`,
        );

        const artifact = await stat(artifactPath);

        assert.ok(artifact.size > 4096);
      }

      const license = await readFile(resolve(repositoryRoot, 'LICENSE'), 'utf8');

      assert.match(license, /2026 Smoke Holder/);
    } finally {
      await rm(repositoryRoot, {
        recursive: true,
        force: true,
      });
    }
  },
);
