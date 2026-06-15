import React from 'react';
import { sanitizeHtml } from '../../Utils/sanitizeHtml';

interface FoodbankTextComponentProps {
  text?: string;
  imageUrl?: string;
  LinkUrl?: string;
  linkText?: string;
}

const FoodbankTextComponent: React.FC<FoodbankTextComponentProps> = ({
  text = '',
  imageUrl = '',
  LinkUrl = '',
  linkText = '',
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="flex items-center justify-center w-16 h-16 sm:w-16 sm:h-16 flex-shrink-0">
        <img alt={text} src={imageUrl} className="max-w-full max-h-full" />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-xs"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(text ?? ''),
          }}
        />
      </div>
      <div className="w-full sm:w-auto break-words">
        <a
          href={LinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {linkText}
        </a>
      </div>
    </div>
  );
};

export default FoodbankTextComponent;
