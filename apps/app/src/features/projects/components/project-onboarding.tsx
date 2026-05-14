import { useRef, useState, type DragEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiCodeBoxLine,
  RiFileList3Line,
  RiLoader4Line,
  RiUploadCloud2Line,
} from '@remixicon/react';

import { Button, cn, toast } from '@ghostapi/ui';
import type { ProjectDetail, UploadProjectSchemaResponse } from '@ghostapi/types';

import { uploadProjectSchema } from '@/features/projects/api/projects-api';

type ProjectOnboardingProps = {
  project: ProjectDetail;
  onContinue: () => void | Promise<void>;
};

export function ProjectOnboarding({ project, onContinue }: ProjectOnboardingProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadProjectSchemaResponse | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);

  const schemaMutation = useMutation({
    mutationFn: (content: string) => uploadProjectSchema({ projectId: project.id, content }),
    onSuccess: (result) => {
      setUploadResult(result);
      toast.success(`Schema uploaded: ${result.endpointCount} endpoints generated`);
    },
    onError: (error) => {
      setUploadResult(null);
      toast.error(error instanceof Error ? error.message : 'Schema upload failed');
    },
  });

  const importUrlMutation = useMutation({
    mutationFn: async (value: string) => {
      const response = await fetch(value);
      if (!response.ok) {
        throw new Error(`Import failed with ${response.status}`);
      }
      return response.text();
    },
    onSuccess: (content) => {
      setUploadedFileName(null);
      schemaMutation.mutate(content);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not import schema URL');
    },
  });

  const isWorking = schemaMutation.isPending || importUrlMutation.isPending;
  const canContinue = Boolean(uploadResult) && !isWorking && !isContinuing;

  async function uploadFile(file: File) {
    setUploadedFileName(file.name);
    setUploadResult(null);
    const content = await file.text();
    schemaMutation.mutate(content);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void uploadFile(file);
  }

  function handleImport() {
    const value = url.trim();
    if (!value) {
      toast.error('Enter a schema URL first');
      return;
    }
    setUploadedFileName(null);
    setUploadResult(null);
    importUrlMutation.mutate(value);
  }

  async function handleContinue() {
    if (!canContinue) return;
    setIsContinuing(true);
    try {
      await onContinue();
    } finally {
      setIsContinuing(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-132px)] rounded-lg border border-white/10 bg-white/[0.015]">
      <div className="mx-auto flex min-h-[610px] max-w-[980px] flex-col items-center px-5 py-14 text-center">
        <div className="relative grid size-16 place-items-center rounded-xl bg-purple-600/20 text-purple-300 shadow-[0_0_48px_rgba(124,58,237,0.26)]">
          <RiCodeBoxLine className="size-9" />
          <span className="absolute -right-8 -top-3 text-2xl text-purple-400">+</span>
          <span className="absolute -right-2 -top-8 text-lg text-purple-400">+</span>
          <span className="absolute -left-5 top-8 text-sm text-purple-400">+</span>
        </div>

        <h1 className="mt-8 text-3xl font-semibold tracking-normal text-white">
          Upload your OpenAPI schema
        </h1>
        <p className="text-white/58 mt-3 text-base">
          This is all we need to generate your mock API.
        </p>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'mt-10 flex min-h-[260px] w-full flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 transition-colors',
            isDragging
              ? 'border-purple-400 bg-purple-500/10'
              : 'border-white/24 bg-black/[0.08] hover:border-purple-400/60',
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.yaml,.yml,application/json,application/yaml,text/yaml,text/x-yaml"
            aria-label="Upload OpenAPI schema file"
            className="hidden"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) void uploadFile(file);
              event.currentTarget.value = '';
            }}
          />

          {isWorking ? (
            <>
              <RiLoader4Line className="size-14 animate-spin text-purple-300" />
              <p className="mt-6 text-sm font-medium text-white">
                {importUrlMutation.isPending ? 'Importing schema...' : 'Generating workspace...'}
              </p>
              <p className="text-white/48 mt-2 text-sm">
                Validating OpenAPI and mounting mock endpoints.
              </p>
            </>
          ) : uploadResult ? (
            <>
              <RiCheckboxCircleLine className="size-14 text-emerald-300" />
              <p className="mt-6 text-sm font-medium text-white">
                {uploadResult.endpointCount} endpoints generated
              </p>
              <p className="text-white/48 mt-2 text-sm">
                Schema v{uploadResult.version} is ready for the workspace.
              </p>
              {uploadedFileName ? (
                <p className="text-white/56 mt-4 inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 font-mono text-xs">
                  <RiFileList3Line className="size-4" />
                  {uploadedFileName}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <RiUploadCloud2Line className="size-16 text-purple-400" />
              <p className="mt-6 text-sm font-medium text-white">
                Drag and drop your OpenAPI file here
              </p>
              <p className="text-white/48 mt-5 text-sm">or</p>
              <Button
                type="button"
                size="lg"
                className="bg-brand-action hover:bg-brand-action-hover mt-5 min-w-[170px] text-white"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </Button>
              <p className="text-white/48 mt-5 text-sm">
                Supports OpenAPI 3.0 and 3.1 (JSON or YAML)
              </p>
            </>
          )}
        </div>

        {schemaMutation.isError ? (
          <div className="mt-5 w-full rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-left text-sm text-red-200">
            {schemaMutation.error instanceof Error
              ? schemaMutation.error.message
              : 'Schema upload failed'}
          </div>
        ) : null}

        <div className="text-white/42 mt-9 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-6 text-xs uppercase tracking-[0.16em]">
          <span className="bg-white/12 h-px" />
          <span>Or import from URL</span>
          <span className="bg-white/12 h-px" />
        </div>

        <div className="mt-7 grid w-full gap-4 md:grid-cols-[1fr_124px]">
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            disabled={isWorking}
            aria-label="OpenAPI schema URL"
            placeholder="https://example.com/openapi.json"
            className="placeholder:text-white/38 h-12 rounded-md border border-white/10 bg-black/[0.12] px-5 text-sm text-white outline-none transition focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
          />
          <Button
            type="button"
            variant="secondary"
            size="lg"
            loading={importUrlMutation.isPending}
            disabled={schemaMutation.isPending}
            className="border-white/10 bg-white/[0.035] text-white"
            onClick={handleImport}
          >
            Import
          </Button>
        </div>
      </div>

      <div className="flex justify-end border-t border-white/10 px-6 py-6 lg:px-8">
        <Button
          type="button"
          size="lg"
          disabled={!canContinue}
          loading={isContinuing}
          className="min-w-[154px] bg-white/10 text-white hover:bg-white/15 disabled:bg-white/10"
          onClick={() => void handleContinue()}
        >
          Continue
          <RiArrowRightLine className="size-4" />
        </Button>
      </div>
    </div>
  );
}
