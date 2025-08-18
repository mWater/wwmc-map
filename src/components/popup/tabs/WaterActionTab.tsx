import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import moment from 'moment';

interface WaterActionTabProps {
  actions: any[];
  ploggingData: any[];
}

const ACTION_LABELS: Record<string, string> = {
  flushing: 'Flushing',
  TKdfEkd: 'Beach/river cleanup',
  ASR2hr3: 'Storm Drain Activity',
  lSTK7fU: 'Education',
  NzRwvgQ: 'Tree planting',
  f1PswKP: 'Habitat Restoration',
  B5pN6Yc: 'Other (please specify)',
  qpNRqUh: "None"
};

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return '';
  return (dateStr.length <= 10)
    ? moment(dateStr, moment.ISO_8601).format('ll')
    : moment(dateStr, moment.ISO_8601).format('lll');
}

const WaterActionTab: React.FC<WaterActionTabProps> = ({ actions, ploggingData }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  useEffect(() => {
    if (modalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [modalOpen]);

  const onClickDetails = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setModalIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalIndex(null);
  };

  const displayRows = useMemo(() => {
    return (actions || []).map((action) => ({
      date: formatDateLabel(action.date),
      actionLabel: ACTION_LABELS[action.action_type] || action.action_type,
      participants: action.participants
    }));
  }, [actions]);

  const renderModal = () => {
    if (!modalOpen || modalIndex == null) return null;
    const action = actions[modalIndex];
    if (!action) return null;

    const isFlushing = action.form === 'flushing' || action.form === '2e5325c13c80416db098e77a14eef2c3';
    const isVisit = action.form === 'd1c360082dfc46b9bb1fd0ff582d6c06';
    const isPlogging = action.form === '3203d0e5b2ec47418fc7a37466dff7ba';
    const data = action.response?.data || {};

    const headerTitle = isFlushing ? 'Flushing Challenge Details' : 'Action Details';
    const actionTypeLabel = ACTION_LABELS[action.action_type] || action.action_type;

    const formatQtyUnits = (quantity?: number | string, unitsId?: string, unitMap?: Record<string, string>) => {
      if (quantity == null) return null;
      const units = unitsId && unitMap ? (unitMap[unitsId] || '') : '';
      return `${quantity} ${units}`.trim();
    };

    const milesKmMap: Record<string, string> = {
      c7nLyvE: 'miles',
      mFk9XEy: 'kilometers'
    };
    const poundsKgMap: Record<string, string> = {
      G15wjwt: 'pounds',
      pka2kmE: 'kilograms'
    };

    // Helpers to extract value/units from a field that may be either { value: { quantity, units } } or { quantity, units }
    const readQtyUnits = (obj: any): { quantity?: number | string, unitsId?: string } => {
      if (!obj) return {};
      if (obj.value && (obj.value.quantity != null || obj.value.units != null)) {
        return { quantity: obj.value.quantity, unitsId: obj.value.units };
      }
      return { quantity: obj.quantity, unitsId: obj.units };
    };

    const renderImpactDetails = () => {
      const items: Array<React.ReactNode> = [];
      if (action.action_type === 'TKdfEkd') {
        // Beach/river cleanup
        const durationId = isVisit ? 'bce772f96ca346b186f35be92a0436ac' : 'b8041344dc9f4ad39fde730feee52808';
        const durationChoices: Record<string, string> = {
          KkyCEUK: '5 minutes',
          '7kbp1Qf': '15 minutes',
          NacqJvl: '30 minutes',
          RA1sWJE: '1 hour+'
        };
        const durationVal = data[durationId]?.value;
        if (durationVal) {
          items.push(<p key="duration" className="card-text mb-2"><strong>Event Duration:</strong> {durationChoices[durationVal] || durationVal}</p>);
        }

        const distanceId = isVisit ? 'e3f956a595ef4760becb08d88e1959b8' : 'ded3045bbb394616b5c9138a254e25ff';
        const distanceObj = data[distanceId];
        const { quantity: distanceQty, unitsId: distanceUnits } = readQtyUnits(distanceObj);
        if (distanceQty != null) {
          items.push(<p key="distance" className="card-text mb-2"><strong>Distance of Clean-up:</strong> {formatQtyUnits(distanceQty, distanceUnits as string, milesKmMap)}</p>);
        }

        // Total estimated weight (matrix)
        const matrixParent = isVisit ? 'c362fb387c5047e2b86b5b973bf610d9' : 'ac2fd2bbd74e47ccb0dd305d45c90927';
        const matrixKey = 'UCxBANG';
        const weightField = 'f326ecae8ca949789d553b4673425431';
        const matrix = data[matrixParent]?.value;
        const beachRow = matrix ? matrix[matrixKey] : undefined;
        const weightObj = beachRow ? beachRow[weightField] : undefined;
        const { quantity: weightQty, unitsId: weightUnits } = readQtyUnits(weightObj);
        if (weightQty != null) {
          items.push(<p key="weight" className="card-text mb-2"><strong>Total Estimated Weight:</strong> {formatQtyUnits(weightQty, weightUnits as string, poundsKgMap)}</p>);
        }
      }

      if (action.action_type === 'ASR2hr3') {
        // Storm Drain Activity
        if (isPlogging) {
          const markedId = 'f9560b5ee5db4586b365820f8d8d22ee';
          const markedYes = 'jm5akUr';
          const howManyId = '51b5bf0208a344b48b108ae4b7349e5d';
          const marked = data[markedId]?.value;
          const num = data[howManyId]?.value;
          if (marked === markedYes) {
            items.push(<p key="drains-marked" className="card-text mb-2"><strong>Storm Drains Marked:</strong> Yes</p>);
            if (num != null) {
              items.push(<p key="drains-count" className="card-text mb-2"><strong>Number of Drains Marked:</strong> {num}</p>);
            }
          }
        } else if (isVisit) {
          const howManyVisitId = '127adc0314994e429962b06059b8d2ed';
          const numV = data[howManyVisitId]?.value;
          if (numV != null) {
            items.push(<p key="drains-count-visit" className="card-text mb-2"><strong>Number of Drains Marked:</strong> {numV}</p>);
          }
        }

        const debrisId = isVisit ? '47e85277f6c940f8bccf27ec4ec0c85b' : '8dbc1755488e4f919423984da96cb895';
        const debrisObj = data[debrisId];
        const { quantity: debrisQty, unitsId: debrisUnits } = readQtyUnits(debrisObj);
        if (debrisQty != null) {
          items.push(<p key="debris" className="card-text mb-2"><strong>Storm Drain Debris Collected:</strong> {formatQtyUnits(debrisQty, debrisUnits as string, poundsKgMap)}</p>);
        }
      }

      if (action.action_type === 'NzRwvgQ') {
        const typesId = '2269cd7772e34286b43d36ab84b5ecf4';
        const howManyId = isVisit ? '626fd436c5ea48fb9ada22094eea9005' : 'cb972ebaf6ac45718eea988160f2c6f8';
        const nativeId = isVisit ? '9c1e366f1c234381884bfe5df94a4264' : '420079c0c9834ae0b4abd2d21a7ab452';
        const speciesId = isVisit ? '94bdb71200d844d5826ad011c9f990a4' : '65eed5ce68be42a9ba9d23e4ae1f724b';
        const nativeYes = 'KYDFjR8';
        const types = data[typesId]?.value;
        const numTrees = data[howManyId]?.value;
        const native = data[nativeId]?.value;
        const species = data[speciesId]?.value;
        if (types != null) items.push(<p key="types" className="card-text mb-2"><strong>Types of Trees:</strong> {types}</p>);
        if (numTrees != null) items.push(<p key="trees" className="card-text mb-2"><strong>Trees Planted:</strong> {numTrees}</p>);
        if (native != null) items.push(<p key="native" className="card-text mb-2"><strong>Native Species Planted:</strong> {native === nativeYes ? 'Yes' : 'No'}</p>);
        if (species != null) items.push(<p key="species" className="card-text mb-0"><strong>Species Planted:</strong> {Array.isArray(species) ? species.join(', ') : species}</p>);
      }

      if (action.action_type === 'f1PswKP') {
        const areaId = isVisit ? '098c2f20637d4468ad5403439ce84983' : '098c2f20637d4468ad5403439ce84983';
        const areaObj = data[areaId];
        const { quantity: areaQty } = readQtyUnits(areaObj);
        if (areaQty != null) items.push(<p key="area" className="card-text mb-2"><strong>Area of Habitat Restored:</strong> {areaQty} m²</p>);

        const removedInvId = isVisit ? '4c949c2520b34ac9bee420e2bcea4b13' : '91b2ec06b678413d89ff6a2afcece01f';
        const removedYes = 'jzfqdme';
        const removed = data[removedInvId]?.value;
        if (removed === removedYes) {
          items.push(<p key="invasives" className="card-text mb-2"><strong>Invasive Species Removed:</strong> Yes</p>);
          const invasiveSpeciesId = isVisit ? '1c8cf5b3d5ce40538eff1dbde4e271eb' : 'ecbc3a42f3ca4ef888c0cc30fa9f05af';
          const invasiveSpecies = data[invasiveSpeciesId]?.value;
          if (invasiveSpecies != null) {
            items.push(<p key="inv-types" className="card-text mb-2"><strong>Types of Invasive Species Removed:</strong> {Array.isArray(invasiveSpecies) ? invasiveSpecies.join(', ') : invasiveSpecies}</p>);
          }
          const areaAltId = isVisit ? '4582e580df7b4e5b83428213a1da444f' : '01a17e04ec574517b7d9d71c8dfe0c2a';
          const areaAltObj = data[areaAltId];
          const { quantity: areaAltQty } = readQtyUnits(areaAltObj);
          if (areaAltQty != null) items.push(<p key="area-alt" className="card-text mb-0"><strong>Area Restored from Invasives:</strong> {areaAltQty} m²</p>);
        }
      }

      if (action.action_type === 'B5pN6Yc') {
        let otherAction: any = undefined;
        if (isPlogging) {
          otherAction = data['646a5d4f22ba4b9f81e03061df5e655d']?.specify?.B5pN6Yc;
        } else if (isVisit) {
          otherAction = data['2597aa0b0ae940a6b71a7d3aa87a4776']?.specify?.B5pN6Yc;
        }
        if (otherAction != null) {
          items.push(<p key="other" className="card-text mb-0"><strong>Other Action (Specify):</strong> {otherAction}</p>);
        }
      }

      return items;
    };

    const renderFlushingBody = () => {
      const affiliationMap: Record<string, string> = {
        vbvSy2S: 'School',
        CdbSvWD: 'Organization',
        vShkZmm: 'Group name',
        '78q4BkC': 'None'
      };
      const posterMap: Record<string, string> = {
        '4gEt9hY': 'Yes',
        sxRjm6r: 'No'
      };
      const affiliation = affiliationMap[data['b907c273299a40c8afbfa0fb00ec63bf']?.value] || '';
      const affiliationName = data['29814a936c6941c7b16a4c8803412f31']?.value || '';
      const poster = posterMap[data['cbe19b8328374cb38da6494ba922f0f3']?.value] || '';
      const posterImages = data['f41bcf066ccf41598a6decf8f0624984']?.value || [];
      const posterImgId = posterImages?.[0]?.id;
      return (
        <div className="modal-body p-3">
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body p-3">
                  <h5 className="card-title">Event Information</h5>
                  <p className="card-text mb-2"><strong>Date:</strong> {moment(action.date).format('ll')}</p>
                  <p className="card-text mb-0"><strong>Participants:</strong> {action.participants || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body p-3">
                  <h5 className="card-title">Organization Details</h5>
                  <p className="card-text mb-2"><strong>Affiliation:</strong> {affiliation || 'N/A'}</p>
                  <p className="card-text mb-0"><strong>Affiliation Name:</strong> {affiliationName || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body p-3">
                  <h5 className="card-title">Poster Information</h5>
                  <div className="px-3">
                    <p className="card-text mb-3"><strong>Poster Created:</strong> {poster || 'N/A'}</p>
                    {posterImgId && (
                      <div className="text-center mt-3">
                        <img className="img-thumbnail" src={`https://api.mwater.co/v3/images/${posterImgId}?h=200`} style={{ maxHeight: '200px' }} alt="Poster" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return createPortal((
      <>
        <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white py-2 px-3">
                <h5 className="modal-title mb-0">{headerTitle}</h5>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={closeModal} />
              </div>
              {isFlushing ? (
                renderFlushingBody()
              ) : (
                <div className="modal-body p-3">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body p-3">
                          <h5 className="card-title">Event Information</h5>
                          <p className="card-text mb-2"><strong>Date:</strong> {moment(action.date).format('ll')}</p>
                          <p className="card-text mb-2"><strong>Action Type:</strong> {actionTypeLabel}</p>
                          <p className="card-text mb-0"><strong>Participants:</strong> {action.participants || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body p-3">
                          <h5 className="card-title">Impact Details</h5>
                          {renderImpactDetails()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="modal-footer py-2 px-3">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show" onClick={closeModal} />
      </>
    ), document.body);
  };

  return (
    <div style={{ height: '280px', overflow: 'auto' }}>
      <div id="subContent">
        {actions.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: '40px 0', fontSize: '1.2em' }}>
            <i className="fa fa-info-circle" style={{ fontSize: '1.5em' }} />
            <br />
            No water actions recorded for this site.
          </div>
        ) : (
          <div className="table-responsive" style={{ maxHeight: '280px', overflow: 'auto', marginTop: '10px' }}>
            <table id="waterActionTable" className="table table-bordered">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Water Action Taken</th>
                  <th>Participants</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((action, index) => (
                  <tr className="action-row" key={index}>
                    <td>{displayRows[index]?.date}</td>
                    <td>{displayRows[index]?.actionLabel}</td>
                    <td>{action.participants ?? ''}</td>
                    <td>
                      <a href="#" className="view-details" onClick={(e) => onClickDetails(e, index)}>Full report</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {renderModal()}
    </div>
  );
};

export default WaterActionTab;