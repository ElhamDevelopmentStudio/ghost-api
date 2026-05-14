import type { ProjectEndpoint } from '@ghostapi/types';

export function filterEndpoints(endpoints: ProjectEndpoint[], search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return endpoints;
  return endpoints.filter((endpoint) =>
    `${endpoint.method} ${endpoint.group} ${endpoint.path}`.toLowerCase().includes(query),
  );
}

export function groupEndpoints(endpoints: ProjectEndpoint[]) {
  const groups = new Map<string, ProjectEndpoint[]>();
  for (const endpoint of endpoints) {
    const groupName = endpoint.group || 'default';
    groups.set(groupName, [...(groups.get(groupName) ?? []), endpoint]);
  }
  return Array.from(groups.entries()).map(([name, groupEndpoints]) => ({
    name,
    endpoints: groupEndpoints,
  }));
}
