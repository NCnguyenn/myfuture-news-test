import { Injectable } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class ContentSanitizerService {
  sanitize(contentHtml: string): string {
    return sanitizeHtml(contentHtml, {
      allowedTags: [
        'p',
        'h2',
        'h3',
        'h4',
        'ul',
        'ol',
        'li',
        'strong',
        'em',
        'blockquote',
        'a',
        'figure',
        'figcaption',
        'br',
        'img',
      ],
      allowedAttributes: {
        a: ['href', 'target', 'rel'],
        img: ['src', 'alt', 'width', 'height', 'loading'],
      },
      allowedSchemes: ['http', 'https'],
      allowedSchemesByTag: {
        a: ['http', 'https'],
        img: ['http', 'https'],
      },
      allowProtocolRelative: false,
    });
  }
}
