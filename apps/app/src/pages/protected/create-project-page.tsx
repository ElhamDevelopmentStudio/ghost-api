import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import {
  RiAddLine,
  RiArrowDownSLine,
  RiBankCardLine,
  RiBox3Line,
  RiCheckLine,
  RiCheckboxBlankCircleLine,
  RiDatabase2Line,
  RiEqualizerLine,
  RiGlobalLine,
  RiKey2Line,
  RiNotification3Line,
  RiSearchLine,
  RiShieldCheckLine,
  RiShoppingCartLine,
  RiSparkling2Line,
  RiSunLine,
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

import { createProject } from '@/features/projects/api/projects-api';
import { FloatingGhost } from '@/features/projects/components/floating-ghost';
import { ProjectCard } from '@/features/projects/components/project-card';
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

const colors = [
  'var(--brand-action)',
  'var(--method-post)',
  'var(--method-head)',
  'var(--success)',
  'var(--warning)',
  'var(--destructive)',
  'var(--chart-6)',
  'var(--method-options)',
];

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
  const [initials, setInitials] = useState('');
  const [customColor, setCustomColor] = useState(colors[0]);
  const [iconMode, setIconMode] = useState<'library' | 'upload'>('library');
  const [projectImage, setProjectImage] = useState<Attachment | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

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

  const selectedIcon = libraryIcons.find((item) => item.id === icon) ?? libraryIcons[0];
  const previewName = name.trim() || 'E-commerce API';
  const previewInitials = initials.trim().slice(0, 2).toUpperCase() || 'EA';
  const previewIcon =
    iconMode === 'upload' && projectImage
      ? (projectImage.thumbnailUrl ?? projectImage.url)
      : initials.trim()
        ? `initials:${previewInitials}:${customColor}`
        : selectedIcon.id;
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
    mutation.mutate({
      name: previewName,
      description: description.trim() || undefined,
      baseUrl: baseUrl.trim()
        ? `${baseUrlProtocol}${baseUrl.trim().replace(/^https?:\/\//, '')}`
        : undefined,
      environment,
      icon:
        iconMode === 'library'
          ? initials.trim()
            ? `initials:${previewInitials}:${customColor}`
            : icon
          : undefined,
      imageAttachmentId: iconMode === 'upload' ? projectImage?.id : undefined,
    });
  }

  return (
    <div className="bg-app-canvas min-h-screen text-white">
      <CreateTopbar />

      <main className="mx-auto max-w-[1120px] px-6 pb-10 pt-7">
        <nav className="mb-5 flex items-center gap-2 text-sm text-white/50">
          <Link to="/projects" className="hover:text-white">
            Projects
          </Link>
          <span>/</span>
          <span className="text-white">Create</span>
        </nav>

        <section className="grid min-h-[143px] items-center gap-8 lg:grid-cols-[1fr_520px]">
          <div>
            <h1 className="text-[36px] font-semibold leading-tight tracking-[0] md:text-[38px]">
              Create a New <span className="text-purple-300">Project</span>
              <RiSparkling2Line className="ml-2 inline size-5 fill-purple-500 text-purple-400" />
            </h1>
            <p className="text-white/82 mt-3 max-w-[520px] text-lg leading-8">
              Organize your mock APIs, simulate real-world scenarios, and bring your frontend to
              life.
            </p>
          </div>
          <FloatingGhost compact />
        </section>

        <form onSubmit={handleSubmit}>
          <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="border-white/12 bg-app-panel/90 rounded-lg border">
              <div className="border-white/6 flex items-center gap-3 border-b px-7 py-5">
                <RiBox3Line className="size-4 text-purple-400" />
                <h2 className="text-base font-semibold">Project Details</h2>
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

              <button
                type="button"
                onClick={() => setAdvancedOpen((open) => !open)}
                className="border-white/6 flex h-[60px] w-full items-center justify-between border-t px-7 text-left"
                aria-expanded={advancedOpen}
              >
                <span className="flex items-center gap-3 text-sm font-semibold">
                  <RiCheckboxBlankCircleLine className="size-4 text-purple-400" />
                  Advanced Settings
                </span>
                <RiArrowDownSLine
                  className={cn('text-white/42 size-4 transition', advancedOpen && 'rotate-180')}
                />
              </button>
              {advancedOpen ? (
                <div className="border-white/6 grid gap-5 border-t px-7 py-5 sm:grid-cols-2">
                  <label className="bg-app-panel-muted flex items-center justify-between rounded-md border border-white/10 px-4 py-3 text-sm">
                    <span>
                      <span className="block font-semibold text-white">Start paused</span>
                      <span className="text-white/48 mt-1 block">
                        Create the project without live mock serving.
                      </span>
                    </span>
                    <input type="checkbox" className="size-4 accent-purple-500" />
                  </label>
                  <label className="bg-app-panel-muted block rounded-md border border-white/10 px-4 py-3 text-sm">
                    <span className="font-semibold text-white">Mock latency</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="0 ms"
                      className="placeholder:text-white/38 mt-2 h-9 w-full bg-transparent text-white outline-none"
                    />
                  </label>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="border-white/12 bg-app-panel/90 rounded-lg border p-6">
                <h2 className="text-base font-semibold">Project Icon</h2>
                <p className="text-white/52 mt-1 text-sm">
                  Choose an icon that represents your project.
                </p>

                <div className="border-white/8 mt-5 flex gap-10 border-b pb-4 text-sm">
                  <button
                    type="button"
                    onClick={() => setIconMode('library')}
                    className={iconMode === 'library' ? 'text-white' : 'text-white/52'}
                  >
                    Icon Library
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconMode('upload')}
                    className={iconMode === 'upload' ? 'text-white' : 'text-white/52'}
                  >
                    Upload Image
                  </button>
                </div>

                {iconMode === 'library' ? (
                  <div className="mt-4 grid grid-cols-5 gap-4">
                    {libraryIcons.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setIcon(item.id)}
                          className={cn(
                            'bg-app-icon-surface grid size-[68px] place-items-center rounded-lg border',
                            icon === item.id ? 'border-purple-500' : 'border-white/10',
                          )}
                        >
                          <span
                            className={cn('grid size-11 place-items-center rounded-lg', item.glow)}
                          >
                            <Icon className={cn('size-7', item.color)} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4">
                    <div
                      {...dropzone.getRootProps({
                        className: cn(
                          'bg-app-icon-surface flex h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/14 text-center text-sm text-white/58 transition hover:border-purple-500/60 hover:text-white',
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

                <div className={cn('mt-7', iconMode === 'upload' && 'opacity-45')}>
                  <h3 className="text-sm font-semibold">Custom Icon</h3>
                  <p className="text-white/52 mt-1 text-sm">Create your own icon with initials.</p>

                  <div className="mt-4 flex items-center gap-4">
                    <div
                      className="grid size-[60px] place-items-center rounded-full text-xl font-semibold text-white"
                      style={{ background: customColor }}
                    >
                      {previewInitials}
                    </div>
                    <input
                      value={initials}
                      onChange={(event) => setInitials(event.target.value.slice(0, 2))}
                      disabled={iconMode === 'upload'}
                      placeholder="Enter initials (max 2)"
                      className="placeholder:text-white/42 bg-app-panel-muted h-11 min-w-0 flex-1 rounded-md border border-white/10 px-4 text-sm text-white outline-none"
                    />
                  </div>

                  <div className="mt-4 flex gap-3">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Use ${color}`}
                        onClick={() => setCustomColor(color)}
                        className="grid size-7 place-items-center rounded-full"
                        style={{ background: color }}
                      >
                        {customColor === color ? (
                          <RiCheckLine className="size-4 rounded-full ring-2 ring-white/75" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-white/12 bg-app-panel/90 rounded-lg border p-6">
                <h2 className="text-base font-semibold">Preview</h2>
                <div className="mt-5">
                  <ProjectCard
                    preview
                    project={{
                      name: previewName,
                      description:
                        description.trim() ||
                        'Mock API project ready for schema uploads and simulated traffic.',
                      icon: previewIcon,
                      status: 'Live',
                      updatedAt: new Date().toISOString(),
                      visibility: 'Private',
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="mt-7 flex justify-center gap-4">
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
              disabled={iconMode === 'upload' && !projectImage}
              className="bg-brand-action hover:bg-brand-action-hover h-11 w-[182px]"
            >
              Create Project
              <span>-&gt;</span>
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

function CreateTopbar() {
  return (
    <header className="border-white/8 flex h-[75px] items-center justify-between border-b px-8 md:px-12">
      <div className="flex items-center gap-16">
        <Link to="/projects" className="flex items-center gap-3">
          <div className="bg-brand-ghost relative grid size-8 place-items-center rounded-b-md rounded-t-2xl">
            <RiSparkling2Line className="size-4 fill-white text-white" />
          </div>
          <span className="font-mono text-2xl font-bold tracking-[0] text-white">
            GHOST<span className="text-brand-accent">API</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <label className="text-white/48 bg-app-panel-deep/95 hidden h-10 w-[308px] items-center gap-3 rounded-lg border border-white/10 px-3 md:flex">
          <RiSearchLine className="size-4" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/45"
            placeholder="Search projects..."
          />
          <span className="text-xs text-white/60">⌘K</span>
        </label>
        <button
          type="button"
          className="bg-app-panel-strong hidden h-10 min-w-10 rounded-lg border border-white/10 px-4 text-lg md:block"
        >
          /
        </button>
        <button
          type="button"
          aria-label="Theme"
          className="bg-app-panel-strong hidden size-10 place-items-center rounded-lg border border-white/10 md:grid"
        >
          <RiSunLine className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="bg-app-panel-strong relative hidden size-10 place-items-center rounded-lg border border-white/10 md:grid"
        >
          <RiNotification3Line className="size-5" />
          <span className="bg-primary-active absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full text-xs font-bold">
            3
          </span>
        </button>
        <Button className="bg-brand-action hover:bg-brand-action-hover h-10 rounded-md px-5 text-sm">
          <RiAddLine className="size-4" />
          New Project
        </Button>
      </div>
    </header>
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
