import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Context, Site } from '../../types';
import SpeciesTab from './tabs/SpeciesTab';
import PhotosTab from './tabs/PhotosTab';
import HistoryTab from './tabs/HistoryTab';
import WaterActionTab from './tabs/WaterActionTab';
import { createVisitsData } from '../../utils/dataProcessing';
import { activities, WATER_QUALITY, PHOTO_QUESTIONS, responseDate, siteResponseFilter, createActions } from '../../utils/consolidatedSurvey';

interface PopupViewProps {
  ctx: Context;
  site: Site;
}

const PopupView: React.FC<PopupViewProps> = ({ ctx, site }) => {
  const [activeTab, setActiveTab] = useState('water-quality');
  const [visitsData, setVisitsData] = useState<any>({ visits: [], photos: [], actions: [], plogging: [] });

  useEffect(() => {
    const controller = new AbortController();
    setVisitsData({visits:[], photos:[], actions:[]});
    const fetchAllData = async () => {
      if (!site.code) return;
      try {
        const filter = encodeURIComponent(JSON.stringify(siteResponseFilter(site.code)));
        const response = await fetch(`${ctx.apiUrl}responses?filter=${filter}`, {signal:controller.signal});
        if (!response.ok) throw new Error(`Response request failed (${response.status})`);
        const responses = await response.json();
        if (!Array.isArray(responses)) throw new Error('Unexpected response payload');
        const photos = responses.flatMap(item => {
          const ids = PHOTO_QUESTIONS.flatMap(id => {
            const value = item.data?.[id]?.value;
            return Array.isArray(value) ? value.map(photo => photo.id).filter(Boolean) : [];
          });
          const date = responseDate(item);
          return ids.length ? [{photoIds:[...new Set(ids)],date:date ? moment(date).format('lll') : 'Date unavailable'}] : [];
        });
        if (!controller.signal.aborted) setVisitsData({
          visits:createVisitsData(responses.filter(item => activities(item).includes(WATER_QUALITY))),
          photos, actions:createActions(responses)
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error fetching survey data:', error);
          setVisitsData({visits:[], photos:[], actions:[], error:true});
        }
      }
    };
    fetchAllData();
    return () => controller.abort();
  }, [ctx.apiUrl, site._id, site.code]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'water-quality':
        return <HistoryTab visitsData={visitsData.visits || []} />;
      case 'water-actions':
        return <WaterActionTab actions={visitsData.actions || []} />;
      case 'species':
        return <SpeciesTab visitsData={visitsData.visits || []} />;
      case 'photos':
        return <PhotosTab ctx={ctx} visitsData={visitsData.photos || []} />;
      default:
        return <HistoryTab visitsData={visitsData.visits || []} />;
    }
  };

  return (
    <div style={{ height: '420px' }}>
      <div className="row">
        <div className="col-md-7">
          <div><strong>{site.name || 'Unnamed Site'}</strong></div>
          <div><strong>Description:</strong> {site.desc || 'No description'}</div>
          <div><strong>Surface Water Type:</strong> {site.surface_water_type || 'Unknown'}</div>
        </div>
        <div id="image" className="col-md-4">
          {site.photo && (
            <img
              src={`${ctx.apiUrl}images/${site.photo.id}?h=100`}
              alt="Site photo"
              className="img-thumbnail"
              style={{ height: '100px' }}
            />
          )}
        </div>
        <div className="col-md-1"></div>
      </div>

      {visitsData.error && <p role="alert">Unable to load survey data. Please reopen this Site to retry.</p>}
      <ul className="nav nav-tabs" style={{ marginTop: '10px' }}>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'water-quality' ? 'active' : ''}`}
            onClick={() => handleTabClick('water-quality')}
          >
            Water Quality
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'water-actions' ? 'active' : ''}`}
            onClick={() => handleTabClick('water-actions')}
          >
            Water Actions
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'species' ? 'active' : ''}`}
            onClick={() => handleTabClick('species')}
          >
            Species
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => handleTabClick('photos')}
          >
            Photos
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PopupView;