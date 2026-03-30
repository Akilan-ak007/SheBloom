'use client';

import { useState } from 'react';
import { 
  Inbox, FileText, Pill, UtensilsCrossed, Send,
  XCircle, CheckCircle2, Clock
} from 'lucide-react';
import styles from './requests.module.css';

const MOCK_REQUESTS = [
  {
    id: 'req_1',
    patientName: 'Priya Sharma',
    patientId: 'PT-10492',
    type: 'leave',
    label: 'Leave Approval',
    icon: FileText,
    time: '2 hours ago',
    message: 'Requesting formal leave approval for mandatory 3rd-trimester bed rest due to mild swelling. Need letter for employer (TCS) starting next week.',
    draftResponse: 'To Whom It May Concern,\n\nThis is to certify that Ms. Priya Sharma is currently under my care in her third trimester of pregnancy. Due to mild edema (swelling) and related fatigue, I strongly recommend she proceed on maternity leave starting from [DATE] to ensure the safety and well-being of both mother and child.\n\nSincerely,\nDr. Sarah Jenkins'
  },
  {
    id: 'req_2',
    patientName: 'Meera Krishnan',
    patientId: 'PT-10495',
    type: 'diet',
    label: 'Diet Adjustment',
    icon: UtensilsCrossed,
    time: '5 hours ago',
    message: 'Meera is experiencing severe morning sickness with the current iron supplements. Can we request a diet adjustment or alternative medicine?',
    draftResponse: 'Hello,\n\nIt is common to experience nausea with oral iron. I have updated the Care Plan: \n1. Switch to taking the iron supplement immediately after dinner instead of morning.\n2. I have added "Ginger Tea with Lemon" to the morning timeline to suppress nausea.\n\nPlease monitor for 3 days and update me.'
  },
  {
    id: 'req_3',
    patientName: 'Anjali Verma',
    patientId: 'PT-10498',
    type: 'medicine',
    label: 'Medicine Query',
    icon: Pill,
    time: '1 day ago',
    message: 'We ran out of the prescribed Folic Acid brand. The local pharmacy only has "Folvite" available. Is it safe to substitute?',
    draftResponse: 'Yes, Folvite (Folic Acid 5mg) is a perfectly safe and standard substitute. Please ensure she continues the routine without missing a dose.'
  }
];

export default function GeneralRequestsPage() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [activeReqId, setActiveReqId] = useState(MOCK_REQUESTS[0].id);

  const activeReq = requests.find(r => r.id === activeReqId);

  const handleSend = (id) => {
    alert('Response sent! Caretaker notified via push alert.');
    setRequests(requests.filter(r => r.id !== id));
    if (requests.length > 1) {
      setActiveReqId(requests.find(r => r.id !== id).id);
    } else {
      setActiveReqId(null);
    }
  };

  return (
    <div className="section">
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Inbox size={28} className={styles.headerIcon} />
          <h1>General Requests</h1>
        </div>
        <p className={styles.subtitle}>Manage incoming caretaker requests: leave letters, diet modifications, and medicine queries.</p>
      </div>

      <div className={styles.requestsLayout}>
        {/* Left pane: Inbox List */}
        <div className={styles.requestsList}>
          {requests.map((req) => {
            const Icon = req.icon;
            return (
              <div 
                key={req.id} 
                className={`${styles.requestItem} ${activeReqId === req.id ? styles.active : ''}`}
                onClick={() => setActiveReqId(req.id)}
              >
                <div className={styles.itemHeader}>
                  <h3 className={styles.itemName}>{req.patientName}</h3>
                  <span className={styles.itemTime}>{req.time}</span>
                </div>
                <div className={`${styles.itemType} ${styles[req.type]}`}>
                  <Icon size={12} /> {req.label}
                </div>
                <div className={styles.itemPreview}>
                  {req.message}
                </div>
              </div>
            );
          })}
          {requests.length === 0 && (
            <div className={styles.emptyState}>
              <CheckCircle2 size={48} />
              <p>Inbox is zero!</p>
            </div>
          )}
        </div>

        {/* Right pane: Active Detail/Response Editor */}
        <div className={styles.activeDetailPane}>
          {activeReq ? (
            <>
              <div className={styles.detailHeader}>
                <div className={styles.detailTitle}>
                  <h2>{activeReq.patientName}</h2>
                  <span className={styles.detailSubtitle}>Patient ID: {activeReq.patientId}</span>
                </div>
                <div className={`${styles.detailTypeBadge} ${styles[activeReq.type]}`}>
                  <activeReq.icon size={16} /> {activeReq.label}
                </div>
              </div>

              <div className={styles.requestMessage}>
                <h4>Message from Caretaker</h4>
                <p>"{activeReq.message}"</p>
              </div>

              <div className={styles.responseEditor}>
                <label>
                  <FileText size={16} /> Doctor's Official Response / Letter
                </label>
                <textarea 
                  defaultValue={activeReq.draftResponse}
                />
              </div>

              <div className={styles.actions}>
                <button 
                  className={styles.btnReject}
                  onClick={() => handleSend(activeReq.id)}
                >
                  <XCircle size={18} /> Dismiss
                </button>
                <button 
                  className={styles.btnApprove}
                  onClick={() => handleSend(activeReq.id)}
                >
                  <Send size={18} /> Send to Caretaker App
                </button>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <Inbox size={64} />
              <h3>Select a Request</h3>
              <p>Choose an item from the inbox to review and respond.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
