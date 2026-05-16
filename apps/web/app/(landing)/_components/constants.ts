import type { ApiLogEntry, TerminalLine } from '@ghostapi/ui';
import type { ComponentType } from 'react';
import {
  RiBracesLine,
  RiCodeLine,
  RiEqualizerLine,
  RiFileCodeLine,
  RiFlashlightLine,
  RiGlobalLine,
  RiPulseLine,
  RiRefreshLine,
  RiRocketLine,
  RiSettings3Line,
  RiStackLine,
  RiTeamLine,
} from '@remixicon/react';

export type BillingCycle = 'monthly' | 'yearly';

export type DashboardUserStatus = 'Active' | 'Inactive';
export type DashboardOrderStatus = 'Paid' | 'Pending' | 'Failed';

export type DashboardUser = {
  name: string;
  email: string;
  status: DashboardUserStatus;
};

export type DashboardOrder = {
  id: string;
  date: string;
  amount: string;
  status: DashboardOrderStatus;
};

export type LandingFeature = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

export type TrustedCompany = {
  name: string;
  icon: ComponentType<{ className?: string }>;
};

export const HERO_TRUST_BULLETS = ['No credit card', 'Open source', 'Works in seconds'] as const;

export const HERO_TERMINAL_LINES: TerminalLine[] = [
  { type: 'command', text: '$ ghostapi start' },
  { type: 'success', text: 'Parsing openapi.yaml' },
  { type: 'success', text: 'Generating endpoints' },
  { type: 'success', text: 'Starting mock server' },
  { type: 'link', label: 'Live at', href: 'http://localhost:4321' },
  { type: 'status', text: 'Ready to receive requests' },
];

export const LANDING_API_LOG: ApiLogEntry[] = [
  {
    id: '1',
    method: 'GET',
    endpoint: '/users',
    status: 'OK',
    statusCode: 200,
    responseTime: '482ms',
    size: '1.2 KB',
    timestamp: '10:24:31:250',
  },
  {
    id: '2',
    method: 'POST',
    endpoint: '/users/login',
    status: 'OK',
    statusCode: 200,
    responseTime: '321ms',
    size: '1.1 KB',
    timestamp: '10:24:31:987',
  },
  {
    id: '3',
    method: 'GET',
    endpoint: '/products?limit=10',
    status: 'OK',
    statusCode: 200,
    responseTime: '196ms',
    size: '2.4 KB',
    timestamp: '10:24:32:521',
  },
  {
    id: '4',
    method: 'PUT',
    endpoint: '/users/123',
    status: 'OK',
    statusCode: 200,
    responseTime: '612ms',
    size: '1.3 KB',
    timestamp: '10:24:33:102',
  },
  {
    id: '5',
    method: 'POST',
    endpoint: '/orders',
    status: 'Created',
    statusCode: 201,
    responseTime: '842ms',
    size: '1.8 KB',
    timestamp: '10:24:33:659',
  },
  {
    id: '6',
    method: 'GET',
    endpoint: '/orders/987',
    status: 'OK',
    statusCode: 200,
    responseTime: '278ms',
    size: '2.1 KB',
    timestamp: '10:24:34:221',
  },
  {
    id: '7',
    method: 'DELETE',
    endpoint: '/users/456',
    status: 'Not Found',
    statusCode: 404,
    responseTime: '128ms',
    size: '240 B',
    timestamp: '10:24:34:820',
  },
  {
    id: '8',
    method: 'POST',
    endpoint: '/uploads',
    status: 'Unauthorized',
    statusCode: 401,
    responseTime: '315ms',
    size: '512 B',
    timestamp: '10:24:35:443',
  },
];

export const DASHBOARD_USERS: DashboardUser[] = [
  { name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { name: 'Jane Cooper', email: 'jane@example.com', status: 'Active' },
  { name: 'Devon Lane', email: 'devon@example.com', status: 'Active' },
  { name: 'Cody Fisher', email: 'cody@example.com', status: 'Inactive' },
];

export const DASHBOARD_ORDERS: DashboardOrder[] = [
  { id: '#ORD-987', date: 'May 24, 2024', amount: '$129.00', status: 'Paid' },
  { id: '#ORD-986', date: 'May 24, 2024', amount: '$89.00', status: 'Paid' },
  { id: '#ORD-985', date: 'May 23, 2024', amount: '$199.00', status: 'Pending' },
  { id: '#ORD-984', date: 'May 23, 2024', amount: '$49.00', status: 'Failed' },
];

export const DASHBOARD_REVENUE_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

export const FEATURES: LandingFeature[] = [
  {
    title: 'OpenAPI -> Mock API',
    description: 'Upload your OpenAPI schema and get a fully working API in seconds.',
    icon: RiFileCodeLine,
  },
  {
    title: 'Realistic Responses',
    description: 'Dynamic data, relationships, and custom rules that feel real.',
    icon: RiBracesLine,
  },
  {
    title: 'Behavior Controls',
    description: 'Simulate delays, errors, auth, and edge cases with ease.',
    icon: RiEqualizerLine,
  },
  {
    title: 'Live Request Logs',
    description: 'See every request in real-time with headers, query params, and payloads.',
    icon: RiPulseLine,
  },
  {
    title: 'Team Workspaces',
    description: 'Collaborate with your team and share mock environments.',
    icon: RiTeamLine,
  },
  {
    title: 'Environment Sync',
    description: 'Switch between multiple environments in one click.',
    icon: RiRefreshLine,
  },
];

export const HOW_IT_WORKS_SCHEMA = `openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  /users:
    get:
      responses:
        '200':
          description: OK`;

export const PRICING_PLANS = [
  {
    name: 'Free',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    suffix: '/ month',
    description: 'Perfect for getting started.',
    yearlyDescription: 'Perfect for getting started.',
    features: ['1 Project', '2 Environments', '5K Requests / Month', 'Community Support'],
    cta: 'GET STARTED',
    highlighted: false,
  },
  {
    name: 'Pro',
    monthlyPrice: '$9',
    yearlyPrice: '$7',
    suffix: '/ month',
    description: 'For individual developers.',
    yearlyDescription: 'For individual developers, billed yearly.',
    features: [
      'Unlimited Projects',
      '10 Environments',
      '100K Requests / Month',
      'Priority Support',
    ],
    cta: 'START FREE TRIAL',
    highlighted: true,
  },
  {
    name: 'Team',
    monthlyPrice: '$29',
    yearlyPrice: '$23',
    suffix: '/ month',
    description: 'For small teams.',
    yearlyDescription: 'For small teams, billed yearly.',
    features: ['Everything in Pro', 'Team Workspaces', '1M Requests / Month', 'Team Support'],
    cta: 'START FREE TRIAL',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 'Custom',
    yearlyPrice: 'Custom',
    suffix: '',
    description: 'For large organizations.',
    yearlyDescription: 'For large organizations.',
    features: ['Everything in Team', 'SSO & SAML', 'Custom Limits', 'Dedicated Support'],
    cta: 'CONTACT SALES',
    highlighted: false,
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      'GhostAPI saved our team hours of waiting time. Our frontend devs can ship faster without blocking on APIs.',
    author: 'Alex R.',
    role: 'Frontend Lead',
    initials: 'AR',
  },
  {
    quote: 'The behavior controls are a game changer. We can simulate any scenario instantly.',
    author: 'Priya M.',
    role: 'Full Stack Developer',
    initials: 'PM',
  },
  {
    quote: 'Setup took literally 30 seconds. The request logs are incredibly detailed.',
    author: 'Jason T.',
    role: 'Engineering Manager',
    initials: 'JT',
  },
] as const;

export const TRUSTED_COMPANIES: TrustedCompany[] = [
  { name: 'ShipFast', icon: RiStackLine },
  { name: 'ByteCraft', icon: RiCodeLine },
  { name: 'DevStack', icon: RiSettings3Line },
  { name: 'LaunchKit', icon: RiRocketLine },
  { name: 'Codewave', icon: RiFlashlightLine },
  { name: 'Acme Corp', icon: RiGlobalLine },
];

export const FOOTER_GROUPS = [
  {
    title: 'PRODUCT',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'RESOURCES',
    links: [
      { label: 'Docs', href: '/docs' },
      { label: 'API Reference', href: '/api-reference' },
      { label: 'Local Development', href: '/local-development' },
      { label: 'Troubleshooting', href: '/troubleshooting' },
    ],
  },
  {
    title: 'COMPANY',
    links: [
      { label: 'GitHub', href: 'https://github.com/ElhamDevelopmentStudio/ghost-api' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'LEGAL',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
      { label: 'License', href: '/license' },
    ],
  },
] as const;
