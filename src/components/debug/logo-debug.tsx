"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function LogoDebug() {
  const [imageStatus, setImageStatus] = useState('loading');
  const [errorDetails, setErrorDetails] = useState('');

  const testImageLoad = () => {
    const img = new window.Image();
    img.onload = () => {
      console.log('✅ Direct image load successful');
      setImageStatus('success');
    };
    img.onerror = (e) => {
      console.error('❌ Direct image load failed:', e);
      setImageStatus('error');
      setErrorDetails(e.toString());
    };
    img.src = '/assets/logo.webp';
  };

  useEffect(() => {
    testImageLoad();
  }, []);

  return (
    <div className="p-4 border-2 border-red-500 bg-red-50 m-4">
      <h2 className="text-lg font-bold mb-4">Logo Debug Info</h2>
      
      <div className="space-y-4">
        <div>
          <strong>Status:</strong> {imageStatus}
        </div>
        
        {errorDetails && (
          <div>
            <strong>Error:</strong> {errorDetails}
          </div>
        )}
        
        <div>
          <strong>Next.js Image Component:</strong>
          <div className="w-32 h-32 border relative">
            <Image
              src="/assets/logo.webp"
              alt="Debug logo"
              fill
              className="object-contain"
              onLoad={() => {
                console.log('✅ Next.js Image loaded');
                setImageStatus('next-success');
              }}
              onError={(e) => {
                console.error('❌ Next.js Image failed:', e);
                setImageStatus('next-error');
              }}
            />
          </div>
        </div>
        
        <div>
          <strong>Direct IMG tag:</strong>
          <img 
            src="/assets/logo.webp" 
            alt="Direct logo"
            style={{width: '128px', height: '128px', border: '1px solid black'}}
            onLoad={() => console.log('✅ Direct IMG loaded')}
            onError={(e) => console.error('❌ Direct IMG failed:', e)}
          />
        </div>
        
        <div>
          <strong>File exists check:</strong>
          <button 
            onClick={() => {
              fetch('/assets/logo.webp')
                .then(response => {
                  console.log('Fetch response:', response.status, response.statusText);
                  return response.blob();
                })
                .then(blob => {
                  console.log('File size:', blob.size, 'bytes');
                  console.log('File type:', blob.type);
                })
                .catch(err => console.error('Fetch error:', err));
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Check File
          </button>
        </div>
      </div>
    </div>
  );
}