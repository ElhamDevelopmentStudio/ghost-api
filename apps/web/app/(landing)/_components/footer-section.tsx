import { Github, MessageCircle, Twitter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { FOOTER_GROUPS } from './constants';

export function FooterSection(): React.JSX.Element {
  return (
    <footer className="border-border/40 relative z-10 border-t px-6 py-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3" aria-label="GhostAPI">
            <Image
              src="/logo/logo-sm.png"
              alt=""
              width={32}
              height={32}
              unoptimized
              className="size-8"
            />
            <span className="text-lg font-semibold tracking-wider">
              <span className="text-foreground">GHOST</span>
              <span className="text-primary">API</span>
            </span>
          </Link>
          <p className="text-muted-foreground mt-4 max-w-xs text-sm leading-6">
            The developer-first API simulation platform.
          </p>
          <div className="text-muted-foreground mt-6 flex items-center gap-4">
            <Github className="size-5" />
            <Twitter className="size-5" />
            <MessageCircle className="size-5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-muted-foreground mb-4 font-mono text-xs font-semibold tracking-[0.16em]">
                {group.title}
              </h3>
              <ul className="text-muted-foreground space-y-3 text-sm">
                {group.links.map((item) => (
                  <li key={item}>
                    <Link href="#" className="hover:text-foreground transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-border/30 text-muted-foreground mx-auto mt-10 max-w-7xl border-t pt-6 text-center text-xs">
        © 2024 GhostAPI. All rights reserved.
      </div>
    </footer>
  );
}
