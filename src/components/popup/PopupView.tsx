import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Context, Site } from '../../types';
import DataTab from './tabs/DataTab';
import SpeciesTab from './tabs/SpeciesTab';
import PhotosTab from './tabs/PhotosTab';
import HistoryTab from './tabs/HistoryTab';
import WaterActionTab from './tabs/WaterActionTab';
import { createVisitsData, createWaterActionData, ploggingFields } from '../../utils/dataProcessing';

interface PopupViewProps {
  ctx: Context;
  site: Site;
}

const PopupView: React.FC<PopupViewProps> = ({ ctx, site }) => {
  const [activeTab, setActiveTab] = useState('water-quality');
  const [visitsData, setVisitsData] = useState<any>({ visits: [], photos: [], actions: [], plogging: [] });

  useEffect(() => {
    const fetchAllData = async () => {
      const siteId = site._id;
      const siteCode = site.code;
      
      // Form IDs and question IDs from original code
      const formId = 'd1c360082dfc46b9bb1fd0ff582d6c06';
      const entityQuestionId = 'ee96dc4554b2431d8a2d7a8b418c23f8';
      
      const ploggingFormId = '3203d0e5b2ec47418fc7a37466dff7ba';
      const ploggingEntityQuestionId = '3f7902a73e4a4f908be0bf17368f9afa';
      
      const flushingFormId = '2e5325c13c80416db098e77a14eef2c3';
      const flushingEntityQuestionId = '2a381d9fe63146bdbdf3df2d9c0b98e2';

      try {
        // Build filters exactly like original
        const responseFilter = JSON.stringify({
          "form": formId,
          [`data.${entityQuestionId}.value`]: siteId
        });
        
        const ploggingResponseFilter = JSON.stringify({
          "form": ploggingFormId,
          [`data.${ploggingEntityQuestionId}.value.code`]: siteCode
        });
        
        const flushingResponseFilter = JSON.stringify({
          "form": flushingFormId,
          [`data.${flushingEntityQuestionId}.value.code`]: siteCode
        });

        // Debug URLs like original  
        const visitsUrl = `${ctx.apiUrl}responses?filter=${encodeURIComponent(responseFilter)}`;
        const ploggingUrl = `${ctx.apiUrl}responses?filter=${encodeURIComponent(ploggingResponseFilter)}`;
        const flushingUrl = `${ctx.apiUrl}responses?filter=${encodeURIComponent(flushingResponseFilter)}`;
        
        console.log('Visits URL:', visitsUrl);
        console.log('Plogging URL:', ploggingUrl);
        console.log('Flushing URL:', flushingUrl);

        // Make all 3 requests in parallel
        const [visitsResponse, ploggingResponse, flushingResponse] = await Promise.all([
          fetch(visitsUrl),
          fetch(ploggingUrl),
          fetch(flushingUrl)
        ]);

        const [visits, ploggingData, flushingData] = await Promise.all([
          visitsResponse.json(),
          ploggingResponse.json(),
          flushingResponse.json()
        ]);

        // Sort responses like original
        const sortedVisits = (visits || []).sort((a: any, b: any) => 
          new Date(a.submittedOn || 0).getTime() - new Date(b.submittedOn || 0).getTime()
        );
        const sortedPlogging = (ploggingData || []).sort((a: any, b: any) => 
          new Date(a.submittedOn || 0).getTime() - new Date(b.submittedOn || 0).getTime()
        );
        const sortedFlushing = (flushingData || []).sort((a: any, b: any) => 
          new Date(a.submittedOn || 0).getTime() - new Date(b.submittedOn || 0).getTime()
        );

        // --- Aggregate all actions like original ---
        const actions: any[] = [];

        // Visit form actions
        const visitActionQ = '2597aa0b0ae940a6b71a7d3aa87a4776';
        const visitParticipantsMatrixQ = '45c68102984b4c93b23a4e63e89d1d67';
        
        for (const response of sortedVisits) {
          const date = response.data['efb614336f504f31a312581e2283a8b2']?.value || response.submittedOn;
          
          // Robustly sum all values in the matrix question for total participants
          let participants = 0;
          for (const [key, val] of Object.entries(response.data)) {
            if (val && typeof (val as any).value === 'object' && (val as any).value != null) {
              for (const [rowKey, rowVal] of Object.entries((val as any).value)) {
                if ((rowVal as any)?.[visitParticipantsMatrixQ]?.value) {
                  const v = (rowVal as any)[visitParticipantsMatrixQ].value;
                  if (v != null && !isNaN(parseInt(v))) {
                    participants += parseInt(v);
                  }
                }
              }
            }
          }
          
          let actionsArr = response.data[visitActionQ]?.value || [];
          if (typeof actionsArr === 'string') actionsArr = [actionsArr];
          
          for (const actionId of actionsArr) {
            actions.push({
              date: date,
              action_type: actionId,
              participants: participants,
              response: response,
              form: 'd1c360082dfc46b9bb1fd0ff582d6c06'
            });
          }
        }

        // Plogging/Other Actions form
        const ploggingActionQ = '646a5d4f22ba4b9f81e03061df5e655d';
        for (const response of sortedPlogging) {
          const date = response.data['9e40eb8f50c8417bb0338c884f3916a1']?.value || response.submittedOn;
          const participants = response.data['1f4481c41936423fb957cb705c464211']?.value;
          let actionsArr = response.data[ploggingActionQ]?.value || [];
          if (typeof actionsArr === 'string') actionsArr = [actionsArr];
          
          for (const actionId of actionsArr) {
            actions.push({
              date: date,
              action_type: actionId,
              participants: participants,
              response: response,
              form: '3203d0e5b2ec47418fc7a37466dff7ba'
            });
          }
        }

        // Flushing form
        for (const response of sortedFlushing) {
          const date = response.data['9e40eb8f50c8417bb0338c884f3916a1']?.value || response.submittedOn;
          const participants = response.data['1f4481c41936423fb957cb705c464211']?.value;
          actions.push({
            date: date,
            action_type: 'flushing',
            participants: participants,
            response: response,
            form: 'flushing'
          });
        }

        // Sort actions by date descending
        const sortedActions = actions.sort((a, b) => -moment(a.date).valueOf() + moment(b.date).valueOf());

        // Process visits data
        const processedVisitsData = createVisitsData(sortedVisits);
        
        // Process plogging data
        const processedPloggingData = createWaterActionData(sortedPlogging, ploggingFields);

        // Create photo data like original
        const photoData: any[] = [];
        
        for (const visitData of processedVisitsData) {
          if (visitData.photos && visitData.photos.length > 0) {
            const photoIds: string[] = [];
            for (const photo of visitData.photos) {
              photoIds.push(photo.id);
            }
            photoData.push({
              photoIds: photoIds,
              date: visitData.date.length <= 10 
                ? moment(visitData.date, moment.ISO_8601).format("ll") 
                : moment(visitData.date, moment.ISO_8601).format("lll")
            });
          }
        }

        for (const fData of processedPloggingData) {
          if (fData.before_image && fData.before_image.length > 0) {
            const photoIds: string[] = [];
            for (const photo of fData.before_image) {
              photoIds.push(photo.id);
            }
            photoData.push({
              photoIds: photoIds,
              date: fData.date.length <= 10 
                ? moment(fData.date, moment.ISO_8601).format("ll") 
                : moment(fData.date, moment.ISO_8601).format("lll")
            });
          }
          if (fData.after_image && fData.after_image.length > 0) {
            const photoIds: string[] = [];
            for (const photo of fData.after_image) {
              photoIds.push(photo.id);
            }
            photoData.push({
              photoIds: photoIds,
              date: fData.date.length <= 10 
                ? moment(fData.date, moment.ISO_8601).format("ll") 
                : moment(fData.date, moment.ISO_8601).format("lll")
            });
          }
        }

        // Store processed data
        setVisitsData({
          visits: processedVisitsData,
          photos: photoData,
          actions: sortedActions,
          plogging: processedPloggingData
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setVisitsData({ visits: [], photos: [], actions: [], plogging: [] });
      }
    };

    fetchAllData();
  }, [ctx.apiUrl, site._id, site.code]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'water-quality':
        return <HistoryTab visitsData={visitsData.visits || []} />;
      case 'water-actions':
        return <WaterActionTab actions={visitsData.actions || []} ploggingData={visitsData.plogging || []} />;
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