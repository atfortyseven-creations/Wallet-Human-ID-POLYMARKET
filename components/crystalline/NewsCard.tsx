import React from 'react';

// Definimos props flexibles para evitar errores de tipo
interface NewsCardProps {
  id?: string;
  title: string;
  url?: string;
  source?: string;
  publishedAt?: string;
  image?: string;
  // Permitimos cualquier otra prop extra para que no explote
  [key: string]: any;
}

export function NewsCard({ title, source, publishedAt, image, url }: NewsCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
      {image && (
        <div className="relative h-48 w-full">
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {source || 'Noticias'}
          </span>
          {publishedAt && (
            <span className="text-xs text-gray-500">
              {new Date(publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{title}</h3>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline mt-2 inline-block"
          >
            Leer más
          </a>
        )}
      </div>
    </div>
  );
}