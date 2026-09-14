import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import moment from 'moment';
import { actionDetails } from '../../../utils/consolidatedSurvey';

const dateLabel = (date: string) => date ? moment(date).format(date.length <= 10 ? 'll' : 'lll') : 'Date unavailable';

const WaterActionTab: React.FC<{actions:any[]}> = ({actions}) => {
  const [selected, setSelected] = useState<any>(null);
  useEffect(() => { setSelected(null); }, [actions]);
  useEffect(() => {
    if (!selected) return;
    document.body.classList.add('modal-open');
    const close = (event: KeyboardEvent) => {if(event.key === 'Escape') setSelected(null);};
    document.addEventListener('keydown', close);
    return () => {document.body.classList.remove('modal-open');document.removeEventListener('keydown',close);};
  }, [selected]);
  return <div style={{height:'280px',overflow:'auto'}}>
    {!actions.length ? <p className="text-muted mt-3">No water actions recorded for this Site.</p> :
      <table className="table table-bordered mt-3">
        <thead><tr><th>Date</th><th>Water Action Taken</th><th>Participants</th><th>Details</th></tr></thead>
        <tbody>{actions.map(action => <tr key={`${action.response._id}:${action.action_type}`}>
          <td>{dateLabel(action.date)}</td><td>{action.label}</td><td>{action.participants ?? '—'}</td>
          <td><button type="button" className="btn btn-link p-0" onClick={() => setSelected(action)}>Full Report</button></td>
        </tr>)}</tbody>
      </table>}
    {selected && createPortal(<>
      <div className="modal show" style={{display:'block'}} role="dialog" aria-modal="true" aria-labelledby="water-action-title">
        <div className="modal-dialog modal-dialog-scrollable"><div className="modal-content">
          <div className="modal-header"><h5 id="water-action-title" className="modal-title">{selected.label}</h5>
            <button autoFocus type="button" className="btn-close" aria-label="Close" onClick={() => setSelected(null)} />
          </div>
          <div className="modal-body">
            <p><strong>Date:</strong> {dateLabel(selected.date)}</p>
            <p><strong>Participants:</strong> {selected.participants ?? 'Not recorded'}</p>
            {actionDetails(selected).map((item,index) => <p key={index}><strong>{item.label}</strong><br /><span style={{whiteSpace:'pre-wrap'}}>{item.value}</span></p>)}
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button></div>
        </div></div>
      </div>
      <div className="modal-backdrop show" onClick={() => setSelected(null)} />
    </>,document.body)}
  </div>;
};
export default WaterActionTab;
