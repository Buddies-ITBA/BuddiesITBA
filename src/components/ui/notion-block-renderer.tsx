import React from 'react';
import { NotionBlock } from '@/lib/cms/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface NotionBlockRendererProps {
    blocks: NotionBlock[];
    className?: string;
}

export function NotionBlockRenderer({ blocks, className }: NotionBlockRendererProps) {
    if (!blocks || blocks.length === 0) return null;

    return (
        <div className={cn('space-y-4', className)}>
            {blocks.map((block) => (
                <Block key={block.id} block={block} />
            ))}
        </div>
    );
}

function Block({ block }: { block: NotionBlock }) {
    const { type } = block;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content = (block as any)[type];

    // Helper to render rich text
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderRichText = (richText: any[], keyPrefix: string) => {
        if (!richText) return null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return richText.map((text: any, index: number) => {
            const { annotations } = text;
            const key = `${keyPrefix}-${index}`;

            let element = <span key={key}>{text.plain_text}</span>;

            if (annotations.bold) {
                element = <strong key={key} className="font-bold">{element}</strong>;
            }
            if (annotations.italic) {
                element = <em key={key} className="italic">{element}</em>;
            }
            if (annotations.strikethrough) {
                element = <s key={key} className="line-through">{element}</s>;
            }
            if (annotations.underline) {
                element = <u key={key} className="underline">{element}</u>;
            }
            if (annotations.code) {
                element = <code key={key} className="rounded bg-muted px-1 py-0.5 font-mono text-sm">{element}</code>;
            }
            if (text.href) {
                element = <a key={key} href={text.href} target="_blank" rel="noreferrer" className="text-primary hover:underline">{element}</a>;
            }

            return element;
        });
    };

    switch (type) {
        case 'paragraph':
            return (
                <p className="text-base leading-relaxed text-muted-foreground">
                    {renderRichText(content.rich_text, block.id)}
                </p>
            );
        case 'heading_1':
            return (
                <h1 className="mt-8 mb-4 text-3xl font-heading font-bold text-foreground">
                    {renderRichText(content.rich_text, block.id)}
                </h1>
            );
        case 'heading_2':
            return (
                <h2 className="mt-6 mb-3 text-2xl font-heading font-semibold text-foreground">
                    {renderRichText(content.rich_text, block.id)}
                </h2>
            );
        case 'heading_3':
            return (
                <h3 className="mt-4 mb-2 text-xl font-heading font-medium text-foreground">
                    {renderRichText(content.rich_text, block.id)}
                </h3>
            );
        case 'bulleted_list_item':
            return (
                <div className="flex items-start gap-2 ml-4">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <p className="text-base text-muted-foreground">
                        {renderRichText(content.rich_text, block.id)}
                    </p>
                </div>
            );
        case 'numbered_list_item':
            return (
                <div className="flex items-start gap-2 ml-4">
                    <span className="font-mono text-primary font-bold">1.</span>
                    <p className="text-base text-muted-foreground">
                        {renderRichText(content.rich_text, block.id)}
                    </p>
                </div>
            );
        case 'image':
            const imageUrl = content.type === 'external' ? content.external.url : content.file.url;
            const caption = content.caption?.[0]?.plain_text || 'Event image';
            return (
                <div className="my-6 overflow-hidden rounded-lg border bg-muted">
                    <div className="relative aspect-video w-full">
                        <Image
                            src={imageUrl}
                            alt={caption}
                            fill
                            className="object-cover"
                            loading="lazy"
                        />
                    </div>
                    {content.caption?.length > 0 && (
                        <p className="p-2 text-center text-xs text-muted-foreground">
                            {renderRichText(content.caption, block.id)}
                        </p>
                    )}
                </div>
            );
        case 'quote':
            return (
                <blockquote className="my-4 border-l-4 border-primary pl-4 italic text-muted-foreground">
                    {renderRichText(content.rich_text, block.id)}
                </blockquote>
            );
        case 'divider':
            return <hr className="my-6 border-border" />;

        default:
            console.warn(`Unsupported block type: ${type}`);
            return null;
    }
}
