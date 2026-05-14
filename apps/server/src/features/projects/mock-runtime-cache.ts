import type { MountInput } from '@ghostapi/runtime';

import { prisma } from '../../db.js';
import { toMountInput, type DbEndpoint } from '../../routes/mock.mount-input.js';

const projectRuntimeInputs = new Map<string, Promise<MountInput[]>>();

export function invalidateProjectMockRuntime(projectId: string) {
  projectRuntimeInputs.delete(projectId);
}

export function clearProjectMockRuntimeCache() {
  projectRuntimeInputs.clear();
}

export function loadProjectMockRuntimeInputs(projectId: string): Promise<MountInput[]> {
  const cached = projectRuntimeInputs.get(projectId);
  if (cached) return cached;

  const loading = loadMountInputs(projectId).catch((error) => {
    projectRuntimeInputs.delete(projectId);
    throw error;
  });
  projectRuntimeInputs.set(projectId, loading);
  return loading;
}

async function loadMountInputs(projectId: string): Promise<MountInput[]> {
  const rows = (await prisma.endpoint.findMany({
    where: { projectId },
    include: { config: true, responses: { orderBy: [{ status: 'asc' }, { contentType: 'asc' }] } },
    orderBy: [{ group: 'asc' }, { path: 'asc' }, { method: 'asc' }],
  })) as unknown as DbEndpoint[];

  return rows.map(toMountInput);
}
