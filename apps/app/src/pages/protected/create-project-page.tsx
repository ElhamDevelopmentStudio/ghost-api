import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import {
  RiBankCardLine,
  RiBox3Line,
  RiCheckboxBlankCircleLine,
  RiDatabase2Line,
  RiEqualizerLine,
  RiGlobalLine,
  RiKey2Line,
  RiShieldCheckLine,
  RiShoppingCartLine,
  RiSparkling2Line,
  RiTeamLine,
  RiTruckLine,
  RiUploadCloud2Line,
} from '@remixicon/react';

import {
  Button,
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@ghostapi/ui';

import { PageHeader } from '@/components/page-header';
import { ProtectedPageFrame } from '@/components/protected-page-frame';
import { createProject } from '@/features/projects/api/projects-api';
import { FloatingGhost } from '@/features/projects/components/floating-ghost';
import {
  attachmentAssetUrl,
  uploadAttachment,
  type Attachment,
} from '@/features/uploads/api/uploads-api';

const libraryIcons = [
  {
    id: 'shopping-cart',
    icon: RiShoppingCartLine,
    color: 'text-fuchsia-300',
    glow: 'bg-fuchsia-500/20',
  },
  { id: 'users', icon: RiTeamLine, color: 'text-emerald-300', glow: 'bg-emerald-500/16' },
  { id: 'card', icon: RiBankCardLine, color: 'text-sky-300', glow: 'bg-sky-500/16' },
  { id: 'analytics', icon: RiEqualizerLine, color: 'text-orange-300', glow: 'bg-orange-500/16' },
  { id: 'truck', icon: RiTruckLine, color: 'text-purple-300', glow: 'bg-purple-500/16' },
  {
    id: 'settings',
    icon: RiCheckboxBlankCircleLine,
    color: 'text-cyan-300',
    glow: 'bg-cyan-500/16',
  },
  { id: 'database', icon: RiDatabase2Line, color: 'text-blue-300', glow: 'bg-blue-500/16' },
  { id: 'shield', icon: RiShieldCheckLine, color: 'text-green-300', glow: 'bg-green-500/16' },
  { id: 'globe', icon: RiGlobalLine, color: 'text-violet-300', glow: 'bg-violet-500/16' },
  { id: 'key', icon: RiKey2Line, color: 'text-amber-300', glow: 'bg-amber-500/16' },
] as const;

export function CreateProjectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [baseUrlProtocol, setBaseUrlProtocol] = useState<'https://' | 'http://'>('https://');
  const [environment, setEnvironment] = useState<'Development' | 'Staging' | 'Production'>(
    'Development',
  );
  const [icon, setIcon] = useState<string>(libraryIcons[0].id);
  const [iconMode, setIconMode] = useState<'library' | 'upload'>('library');
  const [projectImage, setProjectImage] = useState<Attachment | null>(null);

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created');
      navigate('/projects');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAttachment({ file, purpose: 'project-avatar' }),
    onSuccess: (attachment) => {
      setProjectImage(attachment);
      setIconMode('upload');
      toast.success('Project image uploaded');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Project image upload failed');
    },
  });

  const projectName = name.trim();
  const dropzone = useDropzone({
    accept: {
      'image/avif': ['.avif'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    disabled: uploadMutation.isPending,
    maxFiles: 1,
    maxSize: 8 * 1024 * 1024,
    onDropAccepted: ([file]) => {
      if (file) uploadMutation.mutate(file);
    },
    onDropRejected: () => {
      toast.error('Use PNG, JPG, WebP, or AVIF up to 8 MB');
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectName) {
      toast.error('Project name is required');
      return;
    }

    mutation.mutate({
      name: projectName,
      description: description.trim() || undefined,
      baseUrl: baseUrl.trim()
        ? `${baseUrlProtocol}${baseUrl.trim().replace(/^https?:\/\//, '')}`
        : undefined,
      environment,
      icon: iconMode === 'library' ? icon : undefined,
      imageAttachmentId: iconMode === 'upload' ? projectImage?.id : undefined,
    });
  }

  return (
    <ProtectedPageFrame topbar={{ action: null }}>
      <PageHeader
        eyebrow={
          <nav className="flex items-center gap-2">
            <Link to="/projects" className="hover:text-white">
              Projects
            </Link>
            <span>/</span>
            <span className="text-white">Create</span>
          </nav>
        }
        title={
          <>
            Create a New <span className="text-purple-300">Project</span>
            <RiSparkling2Line className="ml-2 inline size-5 fill-purple-500 text-purple-400" />
          </>
        }
        description="Organize your mock APIs, simulate real-world scenarios, and bring your frontend to life."
        visual={<FloatingGhost />}
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="border-white/12 bg-app-panel/90 rounded-lg border">
            <div className="border-white/6 flex items-center gap-3 border-b px-7 py-5">
              <RiBox3Line className="size-4 text-purple-400" />
              <div>
                <h2 className="text-base font-semibold">Project Details</h2>
                <p className="text-white/52 mt-1 text-sm">
                  Start with the fields needed to identify and organize the mock API.
                </p>
              </div>
            </div>

            <div className="space-y-7 px-7 py-5">
              <FieldLabel
                label="Project Name"
                help="Choose a name that helps you identify this project."
              >
                <div className="bg-app-panel-muted shadow-project-input-focus flex h-11 items-center rounded-md border border-purple-500 px-4">
                  <RiBox3Line className="text-white/56 mr-4 size-4" />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value.slice(0, 60))}
                    required
                    placeholder="e.g. E-commerce API"
                    className="placeholder:text-white/38 min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
                  />
                  <span className="text-white/52 text-sm">{name.length}/60</span>
                </div>
              </FieldLabel>

              <FieldLabel
                label="Project Description"
                optional
                help="A short description of what this project is for."
              >
                <div className="bg-app-panel-muted rounded-md border border-white/10 p-4">
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value.slice(0, 200))}
                    placeholder="e.g. Mock APIs for our e-commerce platform"
                    className="placeholder:text-white/38 h-[72px] w-full resize-none bg-transparent text-sm text-white outline-none"
                  />
                  <div className="text-white/52 text-right text-sm">{description.length}/200</div>
                </div>
              </FieldLabel>

              <FieldLabel
                label="Base URL"
                optional
                help="This will be the base URL for all endpoints in this project."
              >
                <div className="bg-app-panel-muted flex h-11 rounded-md border border-white/10">
                  <Select
                    value={baseUrlProtocol}
                    onValueChange={(value) => setBaseUrlProtocol(value as 'https://' | 'http://')}
                  >
                    <SelectTrigger className="border-white/8 h-11 w-[112px] rounded-r-none border-0 border-r bg-transparent text-white shadow-none focus-visible:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-app-panel border-white/10 text-white">
                      <SelectItem value="https://">https://</SelectItem>
                      <SelectItem value="http://">http://</SelectItem>
                    </SelectContent>
                  </Select>
                  <input
                    value={baseUrl}
                    onChange={(event) => setBaseUrl(event.target.value)}
                    placeholder="api.example.com"
                    className="min-w-0 flex-1 bg-transparent px-5 text-sm text-white outline-none placeholder:text-white/40"
                  />
                </div>
              </FieldLabel>

              <FieldLabel
                label="Environment"
                optional
                help="Choose the default environment for this project."
              >
                <Select
                  value={environment}
                  onValueChange={(value) =>
                    setEnvironment(value as 'Development' | 'Staging' | 'Production')
                  }
                >
                  <SelectTrigger className="bg-app-panel-muted h-11 w-full border-white/10 px-4 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="bg-app-panel border-white/10 text-white"
                  >
                    {(['Development', 'Staging', 'Production'] as const).map((value) => (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-3">
                          <span
                            className={cn(
                              'size-2 rounded-full',
                              value === 'Production'
                                ? 'bg-red-400'
                                : value === 'Staging'
                                  ? 'bg-yellow-400'
                                  : 'bg-emerald-400',
                            )}
                          />
                          {value}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldLabel>
            </div>
          </div>

          <aside className="border-white/12 bg-app-panel/90 h-fit rounded-lg border p-6">
            <h2 className="text-base font-semibold">Project Icon</h2>
            <p className="text-white/52 mt-1 text-sm">
              Pick one visual marker now. You can change it later.
            </p>

            <div className="border-white/8 mt-5 grid grid-cols-2 rounded-md border p-1 text-sm">
              <button
                type="button"
                onClick={() => setIconMode('library')}
                className={cn(
                  'h-9 rounded-sm transition',
                  iconMode === 'library'
                    ? 'bg-purple-700/25 text-purple-200'
                    : 'text-white/52 hover:text-white',
                )}
              >
                Icon Library
              </button>
              <button
                type="button"
                onClick={() => setIconMode('upload')}
                className={cn(
                  'h-9 rounded-sm transition',
                  iconMode === 'upload'
                    ? 'bg-purple-700/25 text-purple-200'
                    : 'text-white/52 hover:text-white',
                )}
              >
                Upload Image
              </button>
            </div>

            {iconMode === 'library' ? (
              <div className="mt-5 grid grid-cols-3 gap-3">
                {libraryIcons.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIcon(item.id)}
                      className={cn(
                        'bg-app-icon-surface grid aspect-square place-items-center rounded-lg border transition hover:border-purple-400/70',
                        icon === item.id ? 'border-purple-500' : 'border-white/10',
                      )}
                    >
                      <span className={cn('grid size-11 place-items-center rounded-lg', item.glow)}>
                        <Icon className={cn('size-7', item.color)} />
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5">
                <div
                  {...dropzone.getRootProps({
                    className: cn(
                      'bg-app-icon-surface flex h-[190px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/14 text-center text-sm text-white/58 transition hover:border-purple-500/60 hover:text-white',
                      dropzone.isDragActive && 'border-purple-500 bg-purple-500/10 text-white',
                    ),
                  })}
                >
                  {projectImage ? (
                    <img
                      src={attachmentAssetUrl(projectImage.thumbnailUrl ?? projectImage.url)}
                      alt=""
                      className="size-20 rounded-lg object-cover"
                    />
                  ) : (
                    <>
                      <RiUploadCloud2Line className="mb-3 size-7 text-purple-300" />
                      <span className="font-medium text-white">Upload project image</span>
                      <span className="mt-1">PNG, JPG, WebP, or AVIF up to 8 MB</span>
                    </>
                  )}
                  <input
                    {...dropzone.getInputProps({
                      'aria-label': 'Upload project image',
                    })}
                  />
                </div>
                {uploadMutation.isPending ? (
                  <p className="mt-3 text-sm text-purple-300">
                    Uploading and creating thumbnail...
                  </p>
                ) : null}
              </div>
            )}
          </aside>
        </section>

        <div className="bg-app-panel/60 flex justify-end gap-3 rounded-lg border border-white/10 px-5 py-4">
          <Button
            asChild
            variant="secondary"
            className="h-11 w-[135px] border-white/10 bg-transparent"
          >
            <Link to="/projects">Cancel</Link>
          </Button>
          <Button
            type="submit"
            loading={mutation.isPending || uploadMutation.isPending}
            disabled={!projectName || (iconMode === 'upload' && !projectImage)}
            className="bg-brand-action hover:bg-brand-action-hover h-11 w-[182px]"
          >
            Create Project
            <span>-&gt;</span>
          </Button>
        </div>
      </form>
    </ProtectedPageFrame>
  );
}

function FieldLabel({
  label,
  optional = false,
  help,
  children,
}: {
  label: string;
  optional?: boolean;
  help: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">
        {label} {optional ? <span className="text-white/52 font-normal">(optional)</span> : null}
      </span>
      <span className="text-white/56 mt-1 block text-sm">{help}</span>
      <span className="mt-3 block">{children}</span>
    </label>
  );
}
