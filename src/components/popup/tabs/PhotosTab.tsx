import React from 'react';
import { Context } from '../../../types';

interface PhotosTabProps {
  ctx: Context;
  visitsData: any[];
}

const PhotosTab: React.FC<PhotosTabProps> = ({ ctx, visitsData }) => {
  const hasNoData = visitsData.length === 0;

  return (
    <div style={{ height: '280px', overflow: 'auto' }}>
      <br />
      {hasNoData ? (
        <p>No photos</p>
      ) : (
        visitsData.map((visit, index) => (
          <div key={index} className="mb-3">
            <strong>{visit.date}</strong>
            <div className="mt-2">
              {visit.photoIds && visit.photoIds.map((photoId: string, photoIndex: number) => (
                <img
                  key={photoIndex}
                  id={photoId}
                  className="img-thumbnail me-2"
                  src={`${ctx.apiUrl}images/${photoId}?h=100`}
                  style={{ maxHeight: '100px' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'img/no-image-icon.jpg';
                  }}
                  alt={`Photo ${photoIndex + 1}`}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PhotosTab;