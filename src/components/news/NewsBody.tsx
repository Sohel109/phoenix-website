import { bodyBlocks } from '../../data/news';

/** Texte d'un article : paragraphes et liens http(s), rien d'autre n'est interprété. */
export function NewsBody({ body, className = '' }: { body: string; className?: string }) {
    return (
        <div className={`space-y-5 ${className}`}>
            {bodyBlocks(body).map((parts, i) => (
                <p key={i} className="whitespace-pre-line break-words">
                    {parts.map((part, j) =>
                        'href' in part ? (
                            <a key={j} href={part.href} target="_blank" rel="noopener noreferrer" className="text-[#EC602B] underline underline-offset-2 break-all hover:text-[#904990]">
                                {part.text}
                            </a>
                        ) : (
                            <span key={j}>{part.text}</span>
                        )
                    )}
                </p>
            ))}
        </div>
    );
}
